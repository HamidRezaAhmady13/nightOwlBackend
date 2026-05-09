// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { UserController } from 'src/modules/user/user.controller';
import { UserService } from 'src/modules/user/user.service';
import { NotificationModule } from 'src/notifications/notification.module';
import { PostModule } from 'src/post/post.module';
import { RedisModule } from 'src/redis/redis.module';
import { StorageModule } from 'src/storage/storage.module';

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
