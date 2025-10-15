import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/posts.entity';
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
  ) {}

  async createComment(
    text: string,
    postId: string,
    author: User,
    parentCommentId?: string,
  ) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    let parentComment: Comment | null = null;
    if (parentCommentId) {
      parentComment = await this.commentRepo.findOne({
        where: { id: parentCommentId },
      });
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');

      // Increment reply count for the parent
      await this.commentRepo.increment(
        { id: parentCommentId },
        'replyCount',
        1,
      );
    }

    // Always increment total comments count for the post
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);

    const comment = this.commentRepo.create({
      text,
      author,
      post,
      parentComment,
    });

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
      relations: ['likedByUsers'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    console.log(commentId);
    console.log(userId);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!comment.likedByUsers.some((u) => u.id === userId)) {
      comment.likedByUsers.push(user);
      comment.likeCount++;
      await this.commentRepo.save(comment);
    }

    return comment;
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['likedByUsers'],
    });
    if (!comment) throw new NotFoundException('Comment not found');

    comment.likedByUsers = comment.likedByUsers.filter((u) => u.id !== userId);
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    await this.commentRepo.save(comment);

    return comment;
  }
}
