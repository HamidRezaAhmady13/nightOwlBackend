import { Module } from '@nestjs/common';
import { ChatService } from './chatroom.service';
import { ChatGateway } from './chatroom.gateway';
import { ChatController } from './chatroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ChatRoom } from './entity/chatroom.entity';
import { Message } from './entity/message.entity';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, User, Message]),
    UserModule,
    RedisModule,
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
