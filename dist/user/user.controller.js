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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("src/auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("src/common/decorators/current-user.decorator");
const post_service_1 = require("src/post/post.service");
const redis_service_1 = require("src/redis/redis.service");
const update_user_dto_1 = require("src/user/dto/update-user.dto");
const user_entity_1 = require("src/user/entity/user.entity");
const user_service_1 = require("src/user/user.service");
let UserController = class UserController {
    userService;
    postService;
    redis;
    constructor(userService, postService, redis) {
        this.userService = userService;
        this.postService = postService;
        this.redis = redis;
    }
    async getMe(user, res) {
        if (!user)
            throw new common_1.UnauthorizedException('Not authenticated');
        const userId = user.id ?? user.userId ?? user.sub;
        if (!userId)
            throw new common_1.UnauthorizedException('Not authenticated');
        const cacheKey = `user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        let fullUser;
        if (cached) {
            fullUser = JSON.parse(cached);
        }
        else {
            fullUser = await this.userService.getMe(String(userId));
            await this.redis.set(cacheKey, JSON.stringify(fullUser), 60_000);
        }
        res.cookie('theme', fullUser?.settings?.theme || 'light', {
            httpOnly: false,
            sameSite: 'lax',
        });
        return fullUser;
    }
    async updateTheme(req, theme, res) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('Not authenticated');
        const updatedUser = await this.userService.updateTheme(userId, theme);
        res.cookie('theme', updatedUser.settings?.theme || 'light', {
            httpOnly: false,
            sameSite: 'lax',
        });
        return updatedUser;
    }
    updateProfile(avatar, updateDto, currentUser) {
        const avatarUrl = avatar
            ? `/uploads/avatars/${avatar.filename}`
            : undefined;
        const sanitizedDto = Object.fromEntries(Object.entries(updateDto).filter(([_, value]) => value !== '' && value !== null && value !== undefined));
        const payload = {
            ...sanitizedDto,
            ...(avatarUrl && { avatarUrl }),
        };
        return this.userService.updateUser(currentUser.id, payload);
    }
    getProfile(req) {
        if (!req.user)
            throw new common_1.UnauthorizedException('Not authenticated');
        return req.user;
    }
    async fullSearch(query, limit = 20, page = 1) {
        return this.userService.searchUsers(query, Number(limit), Number(page));
    }
    async deleteAvatar(userId, req) {
        await this.userService.removeAvatar(userId);
        return { message: 'Avatar removed' };
    }
    followUser(username, currentUser) {
        const decoded = decodeURIComponent(username);
        return this.userService.followUser(currentUser.id, decoded);
    }
    unfollowUser(username, currentUser) {
        const decoded = decodeURIComponent(username);
        return this.userService.unfollowUser(currentUser.id, decoded);
    }
    getUserById(userId) {
        const decoded = decodeURIComponent(userId);
        return this.userService.findByUserId(userId);
    }
    async getPostsByUsername(username, limit = '24', cursor) {
        const decoded = decodeURIComponent(username);
        const user = await this.userService.findByUsername(decoded);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.postService.getPostsCursor(user.id, { limit: +limit, cursor });
    }
    getUser(username) {
        const decoded = decodeURIComponent(username);
        return this.userService.findByUsername(decoded);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('theme'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('theme')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateTheme", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: (0, multer_1.diskStorage)({
            destination: '/var/storage/uploads/avatars',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "fullSearch", null);
__decorate([
    (0, common_1.Delete)('/delete-avatar/:id/avatar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteAvatar", null);
__decorate([
    (0, common_1.Post)(':username/follow'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)(':username/unfollow'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Get)('/id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)(':username/posts'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPostsByUsername", null);
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUser", null);
exports.UserController = UserController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        post_service_1.PostService,
        redis_service_1.RedisService])
], UserController);
//# sourceMappingURL=user.controller.js.map