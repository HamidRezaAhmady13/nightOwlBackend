// user.module.ts
import { RedisModule } from '@/core/redis/redis.module';
import { StorageModule } from '@/core/storage/storage.module';
import { NotificationModule } from '@/modules/notifications/notification.module';
import { PostModule } from '@/modules/post/post.module';
import { User } from '@/modules/user/entity/user.entity';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    StorageModule,
    PostModule,
    RedisModule,
    NotificationModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // if other modules need it
})
export class UserModule {}
