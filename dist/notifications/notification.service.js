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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const buildNotification_1 = require("src/common/utils/buildNotification");
const lineLogger_1 = require("src/common/utils/lineLogger");
const ntfDto_1 = require("src/notifications/dto/ntfDto");
const notification_entity_1 = require("src/notifications/entity/notification.entity");
const socket_service_1 = require("src/socket/socket.service");
const typeorm_2 = require("typeorm");
let NotificationService = NotificationService_1 = class NotificationService {
    repo;
    queue;
    socketService;
    constructor(repo, queue, socketService) {
        this.repo = repo;
        this.queue = queue;
        this.socketService = socketService;
    }
    logger = new common_1.Logger(NotificationService_1.name);
    async createForUser(userId, dto) {
        const built = (0, buildNotification_1.buildNotification)(dto);
        let existing = null;
        if (dto.type === ntfDto_1.NotificationType.Follow) {
            existing = await this.repo.findOne({
                where: {
                    userId,
                    sourceId: dto.sourceId,
                    type: ntfDto_1.NotificationType.Follow,
                },
            });
        }
        else if (dto.type === ntfDto_1.NotificationType.Like) {
            const postId = built.payloadRef?.postId;
            if (postId) {
                existing = await this.repo
                    .createQueryBuilder('n')
                    .where('"n"."userId" = :userId', { userId })
                    .andWhere('"n"."sourceId" = :sourceId', { sourceId: dto.sourceId })
                    .andWhere('"n"."type" = :type', { type: ntfDto_1.NotificationType.Like })
                    .andWhere(`"n"."payloadRef"->>'postId' = :postId`, { postId })
                    .getOne();
            }
        }
        if (existing) {
            existing.createdAt = new Date();
            existing.status = 'pending';
            const refreshed = await this.repo.save(existing);
            await this.queue.add('deliver', { id: refreshed.id }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
            return refreshed;
        }
        const payload = {
            userId,
            type: dto.type,
            smallBody: built.smallBody,
            payloadRef: built.payloadRef ?? null,
            meta: dto.meta ?? null,
            sourceId: dto.sourceId ?? null,
            status: 'pending',
        };
        const ntf = this.repo.create(payload);
        const saved = await this.repo.save(ntf);
        await this.queue.add('deliver', { id: saved.id }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
        return saved;
    }
    async countUnreadForUser(userId) {
        const res = this.repo.count({
            where: { userId, readAt: (0, typeorm_2.IsNull)() },
        });
        const logger = new lineLogger_1.LineLogger('this.logger');
        logger.log('22', `1111  ${await res}`);
        return res;
    }
    async listForUser(userId, cursor, limit = 20) {
        const qb = this.repo
            .createQueryBuilder('n')
            .leftJoinAndSelect('n.sourceUser', 'u')
            .where('n.userId = :userId', { userId })
            .orderBy('n.readAt', 'ASC')
            .orderBy('n.createdAt', 'DESC')
            .take(limit + 1);
        if (cursor) {
            try {
                const [cursorCreatedAt, cursorId] = cursor.split('_');
                qb.andWhere('(n.createdAt < :cursorCreatedAt OR (n.createdAt = :cursorCreatedAt AND n.id < :cursorId))', { cursorCreatedAt, cursorId });
            }
            catch {
                qb.andWhere('n.createdAt < :cursor', { cursor });
            }
        }
        const items = await qb.getMany();
        const hasMore = items.length > limit;
        const pageItems = hasMore ? items.slice(0, -1) : items;
        const total = await this.repo.count({ where: { userId } });
        const lastItem = pageItems[pageItems.length - 1];
        const nextCursor = hasMore && lastItem
            ? `${lastItem.createdAt.toISOString()}_${lastItem.id}`
            : undefined;
        return {
            items: pageItems,
            total,
            cursor: nextCursor,
        };
    }
    async markManyRead(userId, ids) {
        const result = await this.repo
            .createQueryBuilder()
            .update(notification_entity_1.NotificationEntity)
            .set({ readAt: () => 'CURRENT_TIMESTAMP' })
            .where('userId = :userId', { userId })
            .andWhere('id IN (:...ids)', { ids })
            .andWhere('readAt IS NULL')
            .execute();
        return result.affected ?? 0;
    }
    async markRead(userId, notificationId) {
        await this.repo
            .createQueryBuilder()
            .update(notification_entity_1.NotificationEntity)
            .set({ readAt: () => 'now()' })
            .where('id = :id AND userId = :userId', { id: notificationId, userId })
            .execute();
        const unread = await this.repo.count({
            where: { userId, readAt: (0, typeorm_2.IsNull)() },
        });
        this.socketService.emitToUser(userId, 'notifications:unreadCount', {
            unread,
        });
    }
    async markAllRead(userId) {
        const res = await this.repo
            .createQueryBuilder()
            .update(notification_entity_1.NotificationEntity)
            .set({ readAt: () => 'now()' })
            .where('userId = :userId AND readAt IS NULL', { userId })
            .execute();
        this.socketService.emitToUser(userId, 'notifications:unreadCount', {
            unread: 0,
        });
        return res.affected ?? 0;
    }
    async deliver(notificationId) {
        const ntf = await this.repo.findOne({ where: { id: notificationId } });
        if (!ntf || ntf.deliveredAt) {
            this.logger.debug(`already delivered or missing ${notificationId}`);
            return;
        }
        try {
            await this.repo.update(notificationId, {
                deliveredAt: () => 'now()',
                status: 'delivered',
            });
            this.socketService.emitToUser(ntf.userId, 'notification', ntf);
            this.logger.log(`delivered ${notificationId} -> user:${ntf.userId}`);
        }
        catch (err) {
            this.logger.error(`deliver failed ${notificationId}`, err);
            throw err;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.NotificationEntity)),
    __param(1, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, socket_service_1.SocketService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map