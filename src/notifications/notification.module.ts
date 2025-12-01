import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entity/comment.entity';
import { Post } from 'src/post/entity/posts.entity';
import { PostModule } from 'src/post/post.module';
import { User } from 'src/user/entity/user.entity';
import { NotificationsProcessor } from './ notifications.processor';
import { NotificationEntity } from './entity/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationsQueueMonitor } from './NotificationsQueueMonitor';

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
