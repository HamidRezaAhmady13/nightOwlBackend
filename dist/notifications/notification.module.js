"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comment_entity_1 = require("../comment/entity/comment.entity");
const notification_entity_1 = require("./entity/notification.entity");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const notifications_processor_1 = require("./notifications.processor");
const NotificationsQueueMonitor_1 = require("./NotificationsQueueMonitor");
const posts_entity_1 = require("../post/entity/posts.entity");
const post_module_1 = require("../post/post.module");
const user_entity_1 = require("../user/entity/user.entity");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        controllers: [notification_controller_1.NotificationController],
        exports: [notification_service_1.NotificationService],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.NotificationEntity, comment_entity_1.Comment, posts_entity_1.Post, user_entity_1.User]),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            bull_1.BullModule.registerQueue({ name: 'notifications' }),
        ],
        providers: [
            notification_service_1.NotificationService,
            notifications_processor_1.NotificationsProcessor,
            NotificationsQueueMonitor_1.NotificationsQueueMonitor,
        ],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map