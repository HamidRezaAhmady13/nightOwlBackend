"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comment_entity_1 = require("src/comment/entity/comment.entity");
const media_service_1 = require("src/media/media.service");
const notification_module_1 = require("src/notifications/notification.module");
const media_entity_1 = require("src/post/entity/media.entity");
const posts_entity_1 = require("src/post/entity/posts.entity");
const post_controller_1 = require("src/post/post.controller");
const post_service_1 = require("src/post/post.service");
const redis_module_1 = require("src/redis/redis.module");
const user_entity_1 = require("src/user/entity/user.entity");
let PostModule = class PostModule {
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        controllers: [post_controller_1.PostController],
        providers: [post_service_1.PostService, media_service_1.MediaService],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([posts_entity_1.Post, media_entity_1.Media, comment_entity_1.Comment, user_entity_1.User]),
            (0, common_1.forwardRef)(() => notification_module_1.NotificationModule),
            redis_module_1.RedisModule,
        ],
        exports: [post_service_1.PostService],
    })
], PostModule);
//# sourceMappingURL=post.module.js.map