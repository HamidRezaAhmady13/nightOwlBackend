import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationType } from 'src/notifications/dto/ntfDto';
import { NotificationService } from 'src/notifications/notification.service';
import { Post } from 'src/post/entity/posts.entity';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly redis: RedisService,
    private readonly socketService: SocketService,
  ) {}

  async createComment(
    text: string,
    postId: string,
    author: User,
    parentCommentId?: string,
  ) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['owner'],
    });
    if (!post) throw new NotFoundException('Post not found');

    let parentComment: Comment | null = null;
    if (parentCommentId) {
      parentComment = await this.commentRepo.findOne({
        where: { id: parentCommentId },
      });
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');

      await this.commentRepo.increment(
        { id: parentCommentId },
        'replyCount',
        1,
      );
    }

    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
    await this.redis.incr(`post:${postId}:comments`);

    const comment = this.commentRepo.create({
      text,
      author,
      post,
      parentComment,
    });
    const savedComment = await this.commentRepo.save(comment);

    console.log(post.owner);
    console.log(post.owner.id);

    if (post.owner && post.owner.id && post.owner.id !== author.id) {
      const ntf = await this.notificationService.createForUser(post.owner.id, {
        type: NotificationType.Comment,

        sourceId: author.id,
        postId: postId,
        commentId: savedComment.id,
        meta: {},
        // smallBody: `${author.username} commented on your post`,
        // payloadRef: { postId, commentId: savedComment.id },
        // meta: {},
        // sourceId: savedComment.id,
      });

      const unread = await this.notificationService.countUnreadForUser(
        post.owner.id,
      );

      this.socketService.emitNotificationToUser(post.owner.id, ntf);
      this.socketService.emitUnreadCount(post.owner.id, unread);
    }

    return this.commentRepo.save(comment);
  }

  async getCommentsForPost(
    postId: string,
    currentUserId: string,
    page = 1,
    limit = 10,
  ) {
    const qb = this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.author', 'author')
      .leftJoinAndSelect('c.likedByUsers', 'likedByUsers')
      .leftJoinAndSelect('c.childComments', 'childComments')
      .leftJoinAndSelect('childComments.author', 'childAuthor')
      .leftJoinAndSelect('childComments.likedByUsers', 'childLikedBy')
      .where('c."postId" = :postId', { postId })
      .andWhere('c."parentCommentId" IS NULL')
      // use property path (no quotes) so TypeORM can resolve metadata
      .orderBy('c.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const comments = await qb.getMany();

    return comments.map((comment) => ({
      ...comment,
      likedByCurrentUser: comment.likedByUsers?.some(
        (u) => u.id === currentUserId,
      ),
      childComments: (comment.childComments || []).map((child) => ({
        ...child,
        likedByCurrentUser: child.likedByUsers?.some(
          (u) => u.id === currentUserId,
        ),
      })),
    }));
  }

  async getReplies(commentId: string, currentUserId: string) {
    const replies = await this.commentRepo.find({
      where: { parentComment: { id: commentId } },
      relations: ['author', 'likedByUsers'],
      order: { createdAt: 'ASC' },
    });

    return replies.map((reply) => ({
      ...reply,
      likedByCurrentUser: reply.likedByUsers.some(
        (u) => u.id === currentUserId,
      ),
    }));
  }

  async updateComment(commentId: string, userId: string, text: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId) throw new Error('Not authorized');

    comment.text = text;
    return this.commentRepo.save(comment);
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId) throw new Error('Not authorized');

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['likedByUsers', 'author', 'post'],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const alreadyLiked = comment.likedByUsers.some((u) => u.id === userId);
    if (alreadyLiked) return comment; // no-op if already liked

    comment.likedByUsers.push(user);
    comment.likeCount++;
    const saved = await this.commentRepo.save(comment);

    // Redis counter
    await this.redis.incr(`comment:${commentId}:likes`);
    // ntf
    const owner = comment.author;
    console.log(comment);
    if (owner && owner.id !== userId) {
      const ntf = await this.notificationService.createForUser(owner.id, {
        type: NotificationType.Like,
        sourceId: user.id,
        postId: comment.post?.id,
        // smallBody: `${user.username ?? 'Someone'} liked your comment`,
        // payloadRef: { commentId, postId: comment.post?.id },
        meta: {},
        // sourceId: commentId,
      });

      const unread = await this.notificationService.countUnreadForUser(
        owner.id,
      );

      this.socketService.emitNotificationToUser(owner.id, ntf);
      this.socketService.emitUnreadCount(owner.id, unread);
    }

    return saved;
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['likedByUsers'],
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const beforeCount = comment.likedByUsers.length;
    comment.likedByUsers = comment.likedByUsers.filter((u) => u.id !== userId);

    if (comment.likedByUsers.length < beforeCount) {
      comment.likeCount = Math.max(0, comment.likeCount - 1);
      await this.commentRepo.save(comment);

      // Redis counter
      await this.redis.decr(`comment:${commentId}:likes`);
    }

    return comment;
  }
}
