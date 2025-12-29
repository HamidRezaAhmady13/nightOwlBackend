"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comment_controller_1 = require("./comment.controller");
const comment_service_1 = require("./comment.service");
const comment_entity_1 = require("./entity/comment.entity");
const notification_module_1 = require("../notifications/notification.module");
const posts_entity_1 = require("../post/entity/posts.entity");
const redis_module_1 = require("../redis/redis.module");
const user_entity_1 = require("../user/entity/user.entity");
let CommentModule = class CommentModule {
};
exports.CommentModule = CommentModule;
exports.CommentModule = CommentModule = __decorate([
    (0, common_1.Module)({
        controllers: [comment_controller_1.CommentController],
        providers: [comment_service_1.CommentService],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([comment_entity_1.Comment, posts_entity_1.Post, user_entity_1.User]),
            redis_module_1.RedisModule,
            notification_module_1.NotificationModule,
        ],
    })
], CommentModule);
//# sourceMappingURL=comment.module.js.map