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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const class_transformer_1 = require("class-transformer");
const ntfDto_1 = require("src/notifications/dto/ntfDto");
const notification_service_1 = require("src/notifications/notification.service");
const redis_service_1 = require("src/redis/redis.service");
const socket_service_1 = require("src/socket/socket.service");
const storage_service_1 = require("src/storage/storage.service");
const safe_user_dto_1 = require("src/user/dto/safe-user.dto");
const user_entity_1 = require("src/user/entity/user.entity");
const typeorm_2 = require("typeorm");
let UserService = class UserService {
    userRepo;
    storageService;
    configService;
    redis;
    socketService;
    notificationService;
    constructor(userRepo, storageService, configService, redis, socketService, notificationService) {
        this.userRepo = userRepo;
        this.storageService = storageService;
        this.configService = configService;
        this.redis = redis;
        this.socketService = socketService;
        this.notificationService = notificationService;
    }
    async followUser(currentUserId, targetUsername) {
        const qr = this.userRepo.manager.connection.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const target = await qr.manager.findOne(user_entity_1.User, {
                where: { username: targetUsername },
                relations: ['followers'],
            });
            if (!target)
                throw new common_1.NotFoundException('Target user not found');
            const existing = await qr.manager.query(`SELECT 1 FROM user_follows WHERE follower_id = $1 AND followed_id = $2 FOR UPDATE`, [currentUserId, target.id]);
            if (existing.length === 0) {
                await qr.manager
                    .createQueryBuilder()
                    .relation(user_entity_1.User, 'following')
                    .of({ id: currentUserId })
                    .add(target.id);
                await qr.manager.increment(user_entity_1.User, { id: currentUserId }, 'followingsCount', 1);
                await qr.manager.increment(user_entity_1.User, { id: target.id }, 'followersCount', 1);
            }
            await qr.commitTransaction();
            const freshCurrent = await qr.manager.findOne(user_entity_1.User, {
                where: { id: currentUserId },
                relations: ['following'],
            });
            const freshTarget = await qr.manager.findOne(user_entity_1.User, {
                where: { id: target.id },
                select: ['id', 'username', 'avatarUrl'],
            });
            if (!freshCurrent)
                throw new common_1.NotFoundException('freshCurrent user not found');
            await this.redis.del(`user:${currentUserId}`);
            await this.redis.del(`user:uname:${freshCurrent.username}`);
            await this.redis.set(`user:${currentUserId}`, JSON.stringify(freshCurrent), 10);
            if (freshTarget && freshTarget.id !== currentUserId) {
                const ntf = await this.notificationService.createForUser(freshTarget.id, {
                    type: ntfDto_1.NotificationType.Follow,
                    sourceId: currentUserId,
                    followerId: currentUserId,
                });
                const unread = await this.notificationService.countUnreadForUser(freshTarget.id);
                this.socketService.emitNotificationToUser(freshTarget.id, ntf);
                this.socketService.emitUnreadCount(freshTarget.id, unread);
            }
            return { currentUser: freshCurrent };
        }
        catch (err) {
            try {
                await qr.rollbackTransaction();
            }
            catch { }
            if (err.code === '23505') {
            }
            throw err;
        }
        finally {
            await qr.release();
        }
    }
    async unfollowUser(currentUserId, targetUsername) {
        const qr = this.userRepo.manager.connection.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const target = await qr.manager.findOne(user_entity_1.User, {
                where: { username: targetUsername },
            });
            if (!target)
                throw new common_1.NotFoundException('Target user not found');
            const existing = await qr.manager.query(`SELECT 1 FROM user_follows WHERE follower_id = $1 AND followed_id = $2 FOR UPDATE`, [currentUserId, target.id]);
            if (existing.length > 0) {
                await qr.manager
                    .createQueryBuilder()
                    .relation(user_entity_1.User, 'following')
                    .of({ id: currentUserId })
                    .remove(target.id);
                await qr.manager.decrement(user_entity_1.User, { id: currentUserId }, 'followingsCount', 1);
                await qr.manager.decrement(user_entity_1.User, { id: target.id }, 'followersCount', 1);
            }
            else {
            }
            await qr.commitTransaction();
            const freshCurrent = await qr.manager.findOne(user_entity_1.User, {
                where: { id: currentUserId },
                relations: ['following'],
            });
            const freshTarget = await qr.manager.findOne(user_entity_1.User, {
                where: { id: target.id },
                select: ['id', 'username', 'avatarUrl'],
            });
            if (!freshCurrent)
                throw new common_1.NotFoundException('freshCurrent user not found');
            await this.redis.del(`user:${currentUserId}`);
            await this.redis.del(`user:uname:${freshCurrent.username}`);
            await this.redis.set(`user:${currentUserId}`, JSON.stringify(freshCurrent), 10);
            return { currentUser: freshCurrent };
        }
        catch (err) {
            try {
                await qr.rollbackTransaction();
            }
            catch { }
            if (err.code === '23505') {
            }
            throw err;
        }
        finally {
            await qr.release();
        }
    }
    async findAll() {
        return this.userRepo.find();
    }
    async findByUserId(id) {
        return this.userRepo.findOneBy({ id });
    }
    async findByUsername(username) {
        return this.userRepo.findOneBy({ username });
    }
    async removeAvatar(userId) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
        }
        if (user.avatarUrl) {
            await this.storageService.delete(user.avatarUrl);
            user.avatarUrl = null;
            await this.userRepo.save(user);
        }
    }
    async findById(id) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID '${id}' not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async createUser(userData) {
        const existing = await this.userRepo.findOne({
            where: [{ username: userData.username }, { email: userData.email }],
        });
        if (existing) {
            throw new common_1.ConflictException('Username or email already exists');
        }
        const user = this.userRepo.create(userData);
        return this.userRepo.save(user);
    }
    async remove(id) {
        await this.userRepo.delete(id);
    }
    async getMe(userId) {
        const id = String(userId);
        const ttlSeconds = Number(this.configService.get('USER_CACHE_TTL') ?? 600);
        const key = `user:${id}`;
        const cached = await this.redis.get(key);
        if (cached)
            return JSON.parse(cached);
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['following'],
            select: [
                'id',
                'email',
                'createdAt',
                'avatarUrl',
                'username',
                'bio',
                'location',
                'website',
                'settings',
            ],
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const safeUser = (0, class_transformer_1.plainToInstance)(safe_user_dto_1.SafeUserDto, user, {
            excludeExtraneousValues: true,
        });
        await this.redis.set(key, JSON.stringify(safeUser), ttlSeconds);
        return safeUser;
    }
    async updateUser(userId, dto) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.provider !== 'local' && dto.password) {
            throw new common_1.BadRequestException("OAuth users can't update password");
        }
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }
        await this.userRepo.update(userId, dto);
        const updatedUser = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['following'],
        });
        await this.redis.del(`user:${userId}`);
        return (0, class_transformer_1.plainToInstance)(safe_user_dto_1.SafeUserDto, updatedUser, {
            excludeExtraneousValues: true,
        });
    }
    async createOAuthUser(dto) {
        return this.userRepo.save(this.userRepo.create(dto));
    }
    async searchUsers(query, limit = 20, page = 1) {
        const [data, total] = await this.userRepo
            .createQueryBuilder('user')
            .select(['user.id', 'user.username', 'user.avatarUrl'])
            .where('user.username ILIKE :exact')
            .orWhere('user.username ILIKE :partial')
            .orderBy(`
        CASE
          WHEN user.username ILIKE :exact THEN 0
          WHEN user.username ILIKE :startsWith THEN 1
          WHEN user.username ILIKE :endsWith THEN 3
          ELSE 2
        END
      `, 'ASC')
            .addOrderBy('user.username', 'ASC')
            .setParameters({
            exact: query,
            partial: `%${query}%`,
            startsWith: `${query}%`,
            endsWith: `%${query}`,
        })
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount();
        return { data, total };
    }
    async updateTheme(userId, theme) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const old = user.settings ?? {
            notifications: false,
            theme: 'light',
            language: null,
        };
        user.settings = {
            notifications: old.notifications,
            theme,
            language: old.language,
        };
        const saved = await this.userRepo.save(user);
        await this.redis.del(`user:${userId}`);
        return saved;
    }
    async findByEmailWithPassword(email) {
        return this.userRepo.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'provider'],
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        socket_service_1.SocketService,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map