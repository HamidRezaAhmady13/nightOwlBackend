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
exports.PostController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const multer_1 = require("multer");
const path = require("path");
const jwt_auth_guard_1 = require("src/auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("src/common/decorators/current-user.decorator");
const create_post_dto_1 = require("src/post/dto/create-post.dto");
const post_service_1 = require("src/post/post.service");
const user_entity_1 = require("src/user/entity/user.entity");
let PostController = class PostController {
    postService;
    constructor(postService) {
        this.postService = postService;
    }
    async createPost(createPostDto, user, media) {
        return this.postService.createPost(createPostDto, user, media);
    }
    async getFeed(user, limit, page) {
        const id = user.id ?? user.userId;
        if (!id)
            throw new common_1.UnauthorizedException('no user is found with that id for fecthing feed');
        return this.postService.getFeed(id, limit, page);
    }
    getPostsCursor(user, limit = '24', cursor) {
        return this.postService.getPostsCursor(user.id, { limit: +limit, cursor });
    }
    async toggleLike(postId, user) {
        return this.postService.toggleLike(postId, user);
    }
    async getPostById(id) {
        const post = await this.postService.getPost(id);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('media', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const tempPath = '/var/storage/uploads/temp';
                fs.mkdirSync(tempPath, { recursive: true });
                cb(null, tempPath);
            },
            filename: (req, file, cb) => {
                const safeName = path
                    .basename(file.originalname, path.extname(file.originalname))
                    .replace(/\s+/g, '-')
                    .replace(/[^a-zA-Z0-9-_]/g, '');
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${safeName}-${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto,
        user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, String]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "getPostsCursor", null);
__decorate([
    (0, common_1.Post)(':id/toggle-like'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostById", null);
exports.PostController = PostController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostController);
//# sourceMappingURL=post.controller.js.map