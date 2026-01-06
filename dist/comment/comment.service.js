"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comment_entity_1 = require("src/comment/entity/comment.entity");
const ntfDto_1 = require("src/notifications/dto/ntfDto");
const notification_service_1 = require("src/notifications/notification.service");
const posts_entity_1 = require("src/post/entity/posts.entity");
const redis_service_1 = require("src/redis/redis.service");
const socket_service_1 = require("src/socket/socket.service");
const user_entity_1 = require("src/user/entity/user.entity");
const typeorm_2 = require("typeorm");
let CommentService = class CommentService {
    commentRepo;
    postRepo;
    userRepo;
    notificationService;
    redis;
    socketService;
    constructor(commentRepo, postRepo, userRepo, notificationService, redis, socketService) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.redis = redis;
        this.socketService = socketService;
    }
    async createComment(text, postId, author, parentCommentId) {
        const post = await this.postRepo.findOne({
            where: { id: postId },
            relations: ['owner'],
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        let parentComment = null;
        if (parentCommentId) {
            parentComment = await this.commentRepo.findOne({
                where: { id: parentCommentId },
            });
            if (!parentComment)
                throw new common_1.NotFoundException('Parent comment not found');
            await this.commentRepo.increment({ id: parentCommentId }, 'replyCount', 1);
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
                type: ntfDto_1.NotificationType.Comment,
                sourceId: author.id,
                postId: postId,
                commentId: savedComment.id,
                meta: {},
            });
            const unread = await this.notificationService.countUnreadForUser(post.owner.id);
            this.socketService.emitNotificationToUser(post.owner.id, ntf);
            this.socketService.emitUnreadCount(post.owner.id, unread);
        }
        return this.commentRepo.save(comment);
    }
    async getCommentsForPost(postId, currentUserId, page = 1, limit = 10) {
        const qb = this.commentRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.author', 'author')
            .leftJoinAndSelect('c.likedByUsers', 'likedByUsers')
            .leftJoinAndSelect('c.childComments', 'childComments')
            .leftJoinAndSelect('childComments.author', 'childAuthor')
            .leftJoinAndSelect('childComments.likedByUsers', 'childLikedBy')
            .where('c."postId" = :postId', { postId })
            .andWhere('c."parentCommentId" IS NULL')
            .orderBy('c.createdAt', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);
        const comments = await qb.getMany();
        return comments.map((comment) => ({
            ...comment,
            likedByCurrentUser: comment.likedByUsers?.some((u) => u.id === currentUserId),
            childComments: (comment.childComments || []).map((child) => ({
                ...child,
                likedByCurrentUser: child.likedByUsers?.some((u) => u.id === currentUserId),
            })),
        }));
    }
    async getReplies(commentId, currentUserId) {
        const replies = await this.commentRepo.find({
            where: { parentComment: { id: commentId } },
            relations: ['author', 'likedByUsers'],
            order: { createdAt: 'ASC' },
        });
        return replies.map((reply) => ({
            ...reply,
            likedByCurrentUser: reply.likedByUsers.some((u) => u.id === currentUserId),
        }));
    }
    async updateComment(commentId, userId, text) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['author'],
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.author.id !== userId)
            throw new Error('Not authorized');
        comment.text = text;
        return this.commentRepo.save(comment);
    }
    async deleteComment(commentId, userId) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['author'],
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.author.id !== userId)
            throw new Error('Not authorized');
        await this.commentRepo.remove(comment);
        return { message: 'Comment deleted' };
    }
    async likeComment(commentId, userId) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['likedByUsers', 'author', 'post'],
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const alreadyLiked = comment.likedByUsers.some((u) => u.id === userId);
        if (alreadyLiked)
            return comment;
        comment.likedByUsers.push(user);
        comment.likeCount++;
        const saved = await this.commentRepo.save(comment);
        await this.redis.incr(`comment:${commentId}:likes`);
        const owner = comment.author;
        console.log(comment);
        if (owner && owner.id !== userId) {
            const ntf = await this.notificationService.createForUser(owner.id, {
                type: ntfDto_1.NotificationType.Like,
                sourceId: user.id,
                postId: comment.post?.id,
                meta: {},
            });
            const unread = await this.notificationService.countUnreadForUser(owner.id);
            this.socketService.emitNotificationToUser(owner.id, ntf);
            this.socketService.emitUnreadCount(owner.id, unread);
        }
        return saved;
    }
    async unlikeComment(commentId, userId) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['likedByUsers'],
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const beforeCount = comment.likedByUsers.length;
        comment.likedByUsers = comment.likedByUsers.filter((u) => u.id !== userId);
        if (comment.likedByUsers.length < beforeCount) {
            comment.likeCount = Math.max(0, comment.likeCount - 1);
            await this.commentRepo.save(comment);
            await this.redis.decr(`comment:${commentId}:likes`);
        }
        return comment;
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(posts_entity_1.Post)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        redis_service_1.RedisService,
        socket_service_1.SocketService])
], CommentService);
//# sourceMappingURL=comment.service.js.map