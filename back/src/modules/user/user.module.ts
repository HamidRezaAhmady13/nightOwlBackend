// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/core/redis/redis.module';
import { StorageModule } from 'src/core/storage/storage.module';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { PostModule } from 'src/modules/post/post.module';
import { User } from 'src/modules/user/entity/user.entity';
import { UserController } from 'src/modules/user/user.controller';
import { UserService } from 'src/modules/user/user.service';

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
