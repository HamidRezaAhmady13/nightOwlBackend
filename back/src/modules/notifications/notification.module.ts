import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/modules/comment/entity/comment.entity';
import { NotificationEntity } from 'src/modules/notifications/entity/notification.entity';
import { NotificationController } from 'src/modules/notifications/notification.controller';
import { NotificationService } from 'src/modules/notifications/notification.service';
import { NotificationsProcessor } from 'src/modules/notifications/notifications.processor';
import { NotificationsQueueMonitor } from 'src/modules/notifications/NotificationsQueueMonitor';
import { Post } from 'src/modules/post/entity/posts.entity';
import { PostModule } from 'src/modules/post/post.module';
import { User } from 'src/modules/user/entity/user.entity';

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
