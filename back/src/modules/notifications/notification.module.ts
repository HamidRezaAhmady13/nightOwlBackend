import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entity/comment.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { NotificationEntity } from 'src/notifications/entity/notification.entity';
import { NotificationController } from 'src/notifications/notification.controller';
import { NotificationService } from 'src/notifications/notification.service';
import { NotificationsProcessor } from 'src/notifications/notifications.processor';
import { NotificationsQueueMonitor } from 'src/notifications/NotificationsQueueMonitor';
import { Post } from 'src/post/entity/posts.entity';
import { PostModule } from 'src/post/post.module';

@Module({
  controllers: [NotificationController],
  exports: [NotificationService],
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, Comment, Post, User]),
    forwardRef(() => PostModule),
    // SocketModule,
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [
    NotificationService,
    NotificationsProcessor,
    // SocketGateway,
    NotificationsQueueMonitor,
  ],
})
export class NotificationModule {}
