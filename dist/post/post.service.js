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
var PostService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = require("fs");
const path = require("path");
const extractQualityFromFilename_1 = require("../common/utils/extractQualityFromFilename");
const toUrlPth_1 = require("../common/utils/toUrlPth");
const media_service_1 = require("../media/media.service");
const ntfDto_1 = require("../notifications/dto/ntfDto");
const notification_service_1 = require("../notifications/notification.service");
const media_entity_1 = require("./entity/media.entity");
const posts_entity_1 = require("./entity/posts.entity");
const redis_service_1 = require("../redis/redis.service");
const socket_service_1 = require("../socket/socket.service");
const user_entity_1 = require("../user/entity/user.entity");
let PostService = PostService_1 = class PostService {
    postRepository;
    mediaRepository;
    userRepository;
    mediaService;
    redis;
    socketService;
    notificationService;
    constructor(postRepository, mediaRepository, userRepository, mediaService, redis, socketService, notificationService) {
        this.postRepository = postRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.mediaService = mediaService;
        this.redis = redis;
        this.socketService = socketService;
        this.notificationService = notificationService;
    }
    logger = new common_1.Logger(PostService_1.name);
    async getPostsCursor(userId, opts) {
        const limit = Math.min(50, opts.limit ?? 24);
        const take = limit + 1;
        let cursorTs;
        let cursorId;
        if (opts.cursor) {
            const parts = String(opts.cursor).split('|');
            cursorTs = parts[0];
            cursorId = parts[1];
        }
        const qb = this.postRepository
            .createQueryBuilder('post')
            .where('post.ownerId = :userId', { userId })
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('post.id', 'DESC')
            .take(take);
        if (cursorTs && cursorId) {
            qb.andWhere(new typeorm_2.Brackets((b) => {
                b.where('post."createdAt" < :cursorTs::timestamp', {
                    cursorTs,
                }).orWhere(new typeorm_2.Brackets((bb) => {
                    bb.where('post."createdAt" = :cursorTs::timestamp', {
                        cursorTs,
                    }).andWhere('post.id < :cursorId::uuid', { cursorId });
                }));
            }));
        }
        const posts = await qb.getMany();
        let nextCursor = null;
        let pageItems = posts;
        if (posts.length === take) {
            pageItems = posts.slice(0, limit);
            const lastReturned = pageItems[pageItems.length - 1];
            nextCursor = `${lastReturned.createdAt.toISOString()}|${lastReturned.id}`;
        }
        else {
        }
        const ids = pageItems.map((p) => p.id);
        const mediaMap = new Map();
        if (ids.length) {
            const mediaQb = this.mediaRepository
                .createQueryBuilder('media')
                .leftJoinAndSelect('media.post', 'post')
                .where('post.id IN (:...ids)', { ids });
            const mediaRows = await mediaQb.getMany();
            for (const m of mediaRows) {
                const postId = m.post ? m.post.id : m.postId;
                if (!postId)
                    continue;
                const arr = mediaMap.get(postId) ?? [];
                arr.push(m);
                mediaMap.set(postId, arr);
            }
        }
        const previews = pageItems.map((p) => {
            const mediaForPost = mediaMap.get(p.id) ?? [];
            const img = mediaForPost.find((m) => /\.(webp|avif|jpe?g|png)$/i.test(m.url)) ??
                mediaForPost.find((m) => !/\.(mp4|mov|webm)$/i.test(m.url)) ??
                mediaForPost[0];
            const imageUrl = img ? img.url : null;
            if (!imageUrl) {
            }
            return {
                id: p.id,
                imageUrl,
                createdAt: p.createdAt,
                likesCount: p.likesCount,
                commentsCount: p.commentsCount,
            };
        });
        return { items: previews, nextCursor };
    }
    async saveMediaRow(data, manager) {
        const repo = manager ? manager.getRepository(media_entity_1.Media) : this.mediaRepository;
        const entity = repo.create(data);
        return repo.save(entity);
    }
    async saveMediaBatch(items, manager) {
        if (!items?.length)
            return [];
        const repo = manager ? manager.getRepository(media_entity_1.Media) : this.mediaRepository;
        const entities = items.map((it) => repo.create(it));
        return repo.save(entities);
    }
    async createPost(dto, user, media) {
        if (!dto.content?.trim() && !media?.path) {
            throw new common_1.BadRequestException('Post must include content or media.');
        }
        const queryRunner = this.postRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const post = queryRunner.manager.create(posts_entity_1.Post, {
                content: dto.content,
                owner: user,
            });
            await queryRunner.manager.save(post);
            if (media?.path) {
                const finalPath = buildFinalPath(media.originalname, user.id, post.id);
                fs.mkdirSync(path.dirname(finalPath), { recursive: true });
                fs.renameSync(media.path, finalPath);
                const mimeType = media.mimetype;
                const ext = path.extname(media.originalname).toLowerCase();
                if (mimeType.startsWith('video/') && isVideoExt(ext)) {
                    const processed = await this.mediaService.processVideo(finalPath, user.id, post.id, media.originalname);
                    for (const variantPath of processed.mp4Variants) {
                        const quality = (0, extractQualityFromFilename_1.extractQualityFromFilename)(variantPath);
                        const relative = (0, toUrlPth_1.toUrlPath)(variantPath);
                        await queryRunner.manager.save(queryRunner.manager.create(media_entity_1.Media, {
                            type: 'video',
                            url: relative,
                            owner: user,
                            post,
                            quality,
                        }));
                    }
                    for (const thumbPath of processed.thumbnails) {
                        const relative = (0, toUrlPth_1.toUrlPath)(thumbPath);
                        await queryRunner.manager.save(queryRunner.manager.create(media_entity_1.Media, {
                            type: 'image',
                            url: relative,
                            owner: user,
                            post,
                        }));
                    }
                    await queryRunner.manager.save(queryRunner.manager.create(media_entity_1.Media, {
                        type: 'video',
                        url: (0, toUrlPth_1.toUrlPath)(finalPath),
                        owner: user,
                        post,
                        quality: 'original',
                    }));
                }
                else {
                    await queryRunner.manager.save(queryRunner.manager.create(media_entity_1.Media, {
                        type: mimeType.startsWith('image/') ? 'image' : 'file',
                        url: (0, toUrlPth_1.toUrlPath)(finalPath),
                        owner: user,
                        post,
                    }));
                }
            }
            await queryRunner.manager.increment(user_entity_1.User, { id: user.id }, 'postsCount', 1);
            await queryRunner.commitTransaction();
            return post;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAllPosts(userId, opts) {
        const skip = (opts.page - 1) * opts.limit;
        const qb = this.postRepository
            .createQueryBuilder('post')
            .where('post.ownerId = :userId', { userId })
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(opts.limit)
            .distinct(true);
        qb.leftJoinAndSelect('post.media', 'media');
        const [items, total] = await qb.getManyAndCount();
        const previews = items.map((p) => ({
            id: p.id,
            imageUrl: p.media?.[0]?.url ?? null,
            createdAt: p.createdAt,
            likesCount: p.likesCount,
            commentsCount: p.commentsCount,
        }));
        return { items: previews, total };
    }
    async getPost(postId) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['owner', 'media', 'likedBy', 'comments'],
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const likes = await this.redis.get(`post:${postId}:likes`);
        const comments = await this.redis.get(`post:${postId}:comments`);
        post.likesCount = Number(likes ?? post.likesCount);
        post.commentsCount = Number(comments ?? post.commentsCount);
        return post;
    }
    async updatePost(postId, dto, currentUserId, newMedia) {
        const queryRunner = this.postRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const post = await queryRunner.manager.findOne(posts_entity_1.Post, {
                where: { id: postId },
                relations: ['owner', 'media'],
            });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
            if (post.owner.id !== currentUserId)
                throw new common_1.ForbiddenException();
            if (dto.content !== undefined)
                post.content = dto.content;
            await queryRunner.manager.save(post);
            if (dto.replaceMedia && newMedia) {
                const existingMedia = post.media ?? [];
                if (existingMedia.length) {
                    await this.mediaService.removeMediaBatch(existingMedia.map((m) => m.id), queryRunner.manager);
                }
                const finalPath = buildFinalPath(newMedia.originalname, currentUserId, postId);
                fs.mkdirSync(path.dirname(finalPath), { recursive: true });
                fs.renameSync(newMedia.path, finalPath);
                const mimeType = newMedia.mimetype;
                const ext = path.extname(newMedia.originalname).toLowerCase();
                if (mimeType.startsWith('video/') && isVideoExt(ext)) {
                    const processed = await this.mediaService.processVideo(finalPath, currentUserId, postId, newMedia.originalname);
                    for (const variantPath of processed.mp4Variants) {
                        await queryRunner.manager.save(this.mediaRepository.create({
                            type: 'video',
                            url: (0, toUrlPth_1.toUrlPath)(variantPath),
                            owner: post.owner,
                            post,
                        }));
                    }
                    for (const t of processed.thumbnails) {
                        await queryRunner.manager.save(this.mediaRepository.create({
                            type: 'image',
                            url: (0, toUrlPth_1.toUrlPath)(t),
                            owner: post.owner,
                            post,
                        }));
                    }
                    await queryRunner.manager.save(this.mediaRepository.create({
                        type: 'video',
                        url: (0, toUrlPth_1.toUrlPath)(finalPath),
                        owner: post.owner,
                        post,
                        quality: 'original',
                    }));
                }
                else {
                    await queryRunner.manager.save(this.mediaRepository.create({
                        type: mimeType.startsWith('image/') ? 'image' : 'file',
                        url: (0, toUrlPth_1.toUrlPath)(finalPath),
                        owner: post.owner,
                        post,
                    }));
                }
            }
            await queryRunner.commitTransaction();
            return post;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deletePost(postId, currentUserId) {
        const queryRunner = this.postRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const post = await queryRunner.manager.findOne(posts_entity_1.Post, {
                where: { id: postId },
                relations: ['owner', 'media'],
            });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
            if (post.owner.id !== currentUserId)
                throw new common_1.ForbiddenException();
            if (post.media && post.media.length) {
                await this.mediaService.removeMediaBatch(post.media.map((m) => m.id), queryRunner.manager);
            }
            await queryRunner.manager.delete(posts_entity_1.Post, { id: postId });
            await queryRunner.manager.decrement(user_entity_1.User, { id: currentUserId }, 'postsCount', 1);
            await queryRunner.commitTransaction();
            try {
                const postDir = path.join(process.cwd(), 'uploads', `user-${currentUserId}`, `post-${postId}`);
                fs.rmSync(postDir, { recursive: true, force: true });
            }
            catch (e) {
            }
            return { message: 'Post deleted' };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getFeed(currentUserId, limit = 2, page = 1) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .innerJoin('post.owner', 'owner')
            .innerJoin('user_follows', 'f', 'f.follower_id = :currentUserId AND f.followed_id = owner.id', { currentUserId })
            .leftJoinAndSelect('post.media', 'media')
            .leftJoinAndSelect('post.owner', 'postOwner')
            .leftJoinAndSelect('post.likedBy', 'likedBy')
            .leftJoinAndSelect('post.comments', 'comments')
            .orderBy('post.createdAt', 'DESC');
        const total = await qb.getCount();
        const items = await qb
            .take(limit)
            .skip((page - 1) * limit)
            .getMany();
        return { items, total };
    }
    async toggleLike(postId, user) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['likedBy', 'owner'],
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const key = `post:${postId}:likes`;
        const alreadyLiked = post.likedBy.some((u) => u.id === user.id);
        if (alreadyLiked) {
            post.likedBy = post.likedBy.filter((u) => u.id !== user.id);
            --post.likesCount;
            await this.postRepository.save(post);
            await this.redis.decr(key);
            return { liked: false };
        }
        post.likedBy.push(user);
        ++post.likesCount;
        const saved = await this.postRepository.save(post);
        await this.redis.incr(key);
        const owner = post.owner;
        if (owner && owner.id !== user.id) {
            const ntf = await this.notificationService.createForUser(owner.id, {
                type: ntfDto_1.NotificationType.Like,
                sourceId: user.id,
                postId: postId,
                meta: {},
            });
            const unread = await this.notificationService.countUnreadForUser(owner.id);
            this.socketService.emitNotificationToUser(owner.id, ntf);
            this.socketService.emitUnreadCount(owner.id, unread);
        }
        return { liked: true, post: saved };
    }
    async getLikes(postId, page = 1, limit = 20) {
        return this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.likedPosts', 'post', 'post.id = :postId', { postId })
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
    }
};
exports.PostService = PostService;
exports.PostService = PostService = PostService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(posts_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        media_service_1.MediaService,
        redis_service_1.RedisService,
        socket_service_1.SocketService,
        notification_service_1.NotificationService])
], PostService);
function buildFinalPath(origName, userId, postId) {
    const safeName = origName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const timestamp = Date.now();
    const ext = path.extname(origName).toLowerCase();
    return path.join(process.cwd(), 'uploads', `user-${userId}`, `post-${postId}`, 'original', `${safeName}-original-${timestamp}${ext}`);
}
function isVideoExt(ext) {
    return [
        '.mp4',
        '.mov',
        '.mkv',
        '.avi',
        '.webm',
        '.flv',
        '.wmv',
        '.m4v',
    ].includes(ext);
}
//# sourceMappingURL=post.service.js.map