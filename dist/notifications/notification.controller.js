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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const lineLogger_1 = require("../common/utils/lineLogger");
const notification_service_1 = require("./notification.service");
const socket_service_1 = require("../socket/socket.service");
const ntfDto_1 = require("./dto/ntfDto");
let NotificationController = class NotificationController {
    ntfService;
    socketService;
    logger = new lineLogger_1.LineLogger('NotificationController');
    constructor(ntfService, socketService) {
        this.ntfService = ntfService;
        this.socketService = socketService;
    }
    async unreadCount(req) {
        const userId = req.user.id;
        const unread = await this.ntfService.countUnreadForUser(userId);
        this.logger.log('unreadCount', `User ${userId} has ${unread} unread`);
        return { unread };
    }
    async list(req, cursor, limit = '20') {
        return this.ntfService.listForUser(req.user.id, cursor, Number(limit));
    }
    async markManyRead(req, ids) {
        const userId = req.user.id;
        const updated = await this.ntfService.markManyRead(req.user.id, ids);
        const unread = await this.ntfService.countUnreadForUser(userId);
        this.socketService.emitUnreadCount(userId, unread);
        return { ok: true, updated };
    }
    async markRead(req, id) {
        await this.ntfService.markRead(req.user.id, id);
        return { ok: true };
    }
    async markAllRead(req) {
        const updated = await this.ntfService.markAllRead(req.user.id);
        return { ok: true, updated };
    }
    async create(dto) {
        const payload = this.buildPayload(dto);
        return this.ntfService.createForUser(dto.userId, payload);
    }
    buildPayload(dto) {
        const base = {
            sourceId: dto.actor.id,
            meta: dto.meta ?? null,
        };
        switch (dto.type) {
            case ntfDto_1.NotificationType.Follow:
                return {
                    ...base,
                    type: ntfDto_1.NotificationType.Follow,
                    followerId: dto.actor.id,
                };
            case ntfDto_1.NotificationType.Comment:
                return {
                    ...base,
                    type: ntfDto_1.NotificationType.Comment,
                    postId: dto.meta?.postId,
                    commentId: dto.meta?.commentId,
                };
            case ntfDto_1.NotificationType.Like:
                return {
                    ...base,
                    type: ntfDto_1.NotificationType.Like,
                    postId: dto.meta?.postId,
                };
            default:
                throw new common_1.BadRequestException('Invalid notification type');
        }
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('mark-many-read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markManyRead", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ntfDto_1.CreateNtfDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "create", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        socket_service_1.SocketService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map