import { Comment } from '@/modules/comment/entity/comment.entity';
import { NotificationEntity } from '@/modules/notifications/entity/notification.entity';
import { NotificationController } from '@/modules/notifications/notification.controller';
import { NotificationService } from '@/modules/notifications/notification.service';
import { NotificationsProcessor } from '@/modules/notifications/notifications.processor';
import { NotificationsQueueMonitor } from '@/modules/notifications/NotificationsQueueMonitor';
import { Post } from '@/modules/post/entity/posts.entity';
import { PostModule } from '@/modules/post/post.module';
import { User } from '@/modules/user/entity/user.entity';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [NotificationController],
  exports: [NotificationService],
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, Comment, Post, User]),
    forwardRef(() => PostModule),

    BullModule.registerQueueAsync({
      name: 'notifications',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'redis'),
          port: config.get('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
        },
      }),
    }),
  ],
  providers: [
    NotificationService,
    NotificationsProcessor,
    NotificationsQueueMonitor,
  ],
})
export class NotificationModule {}
