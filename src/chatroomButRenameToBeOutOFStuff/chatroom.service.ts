// import {
//   ForbiddenException,
//   forwardRef,
//   Inject,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { In, Repository } from 'typeorm';
// import { ChatRoom } from './entity/chatroom.entity';
// import { User } from 'src/user/entity/user.entity';
// import { CreateChatRoomDto } from './dto/create-chatroom.dto';
// import Redis from 'ioredis';
// import { Message } from './entity/message.entity';
// import { ChatGateway } from './chatroom.gateway';

// @Injectable()
// export class ChatService {
//   constructor(
//     @Inject('REDIS_CLIENT') private readonly redis: Redis,
//     @InjectRepository(ChatRoom)
//     private readonly chatRoomRepository: Repository<ChatRoom>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     @InjectRepository(Message)
//     private readonly messageRepository: Repository<Message>,
//     @Inject(forwardRef(() => ChatGateway))
//     private readonly chatGateway: ChatGateway,
//   ) {}

//   async createChatRoom(
//     dto: CreateChatRoomDto,
//     creator: User,
//   ): Promise<ChatRoom> {
//     const users = await this.userRepository.findBy({
//       id: In(dto.participantIds),
//     });
//     const room = this.chatRoomRepository.create({
//       name: dto.name,
//       participants: [...users, creator],
//     });
//     return this.chatRoomRepository.save(room);
//   }

//   // chatroom.service.ts
//   async joinChatRoom(
//     roomId: string,
//     userId: string,
//   ): Promise<{ success: boolean }> {
//     const room = await this.chatRoomRepository.findOne({
//       where: { id: roomId },
//       relations: ['participants'],
//     });

//     if (!room) {
//       throw new NotFoundException('Chatroom not found');
//     }

//     const isParticipant = room.participants.some((user) => user.id === userId);
//     if (!isParticipant) {
//       throw new ForbiddenException(
//         'You are not a participant of this chatroom',
//       );
//     }

//     // Optional: update user status or log join time
//     // await this.userRepository.update(userId, { isOnline: true });

//     return { success: true };
//   }

//   async findUserChatRooms(userId: string): Promise<ChatRoom[]> {
//     return this.chatRoomRepository.find({
//       where: {
//         participants: {
//           id: userId,
//         },
//       },
//       relations: ['participants'],
//     });
//   }

//   markUserOnline(userId: string) {
//     this.redis.set(`user:${userId}:online`, 'true');
//   }

//   markUserOffline(userId: string) {
//     this.redis.set(`user:${userId}:online`, 'false');
//   }

//   //
//   async sendMessage(
//     roomId: string,
//     userId: string,
//     content: string,
//   ): Promise<Message> {
//     const room = await this.chatRoomRepository.findOne({
//       where: { id: roomId },
//       relations: ['participants'],
//     });

//     if (!room) throw new NotFoundException('Chatroom not found');

//     const isParticipant = room.participants.some((u) => u.id === userId);
//     if (!isParticipant) throw new ForbiddenException('Not a participant');

//     const sender = await this.userRepository.findOneBy({ id: userId });
//     if (!sender) throw new NotFoundException('Sender not found');

//     const message = this.messageRepository.create({
//       content,
//       sender,
//       room,
//     });

//     const saved = await this.messageRepository.save(message);

//     // Update Redis cache
//     // const recent = await this.getRecentMessages(roomId);
//     const recent = ((await this.getRecentMessages(roomId)) as Message[]) || [];

//     const updated = [...(recent || []), saved].slice(-100); // keep last 100
//     await this.cacheRecentMessages(roomId, updated);

//     // Update metadata
//     await this.cacheChatroomMeta(roomId, {
//       name: room.name,
//       lastMessage: saved.content,
//     });

//     await this.incrementMessageCount(roomId);
//     this.chatGateway.sendMessageToRoom(roomId, saved);

//     return saved;
//   }

//   //

//   async getMessages(roomId: string): Promise<Message[]> {
//     const room = await this.chatRoomRepository.findOne({
//       where: { id: roomId },
//       relations: ['participants'],
//     });

//     if (!room) throw new NotFoundException('Chatroom not found');

//     return this.messageRepository.find({
//       where: { room: { id: roomId } },
//       relations: ['sender'],
//       order: { timestamp: 'ASC' },
//       take: 100, // or paginate later
//     });
//   }

//   async leaveChatRoom(
//     roomId: string,
//     userId: string,
//   ): Promise<{ success: boolean }> {
//     const room = await this.chatRoomRepository.findOne({
//       where: { id: roomId },
//       relations: ['participants'],
//     });

//     if (!room) throw new NotFoundException('Chatroom not found');

//     room.participants = room.participants.filter((u) => u.id !== userId);
//     await this.chatRoomRepository.save(room);

//     return { success: true };
//   }

//   //

//   async cacheRecentMessages(roomId: string, messages: Message[]) {
//     const key = `chatroom:${roomId}:recentMessages`;
//     await this.redis.set(key, JSON.stringify(messages), 'EX', 300); // 5 min cache
//   }

//   async getRecentMessages(roomId: string): Promise<Message[] | null> {
//     const key = `chatroom:${roomId}:recentMessages`;
//     const cached = await this.redis.get(key);
//     return cached ? JSON.parse(cached) : null;
//   }

//   async cacheChatroomMeta(
//     roomId: string,
//     meta: { name: string; lastMessage: string },
//   ) {
//     const key = `chatroom:${roomId}:meta`;
//     await this.redis.set(key, JSON.stringify(meta), 'EX', 300);
//   }

//   async getChatroomMeta(
//     roomId: string,
//   ): Promise<{ name: string; lastMessage: string } | null> {
//     const key = `chatroom:${roomId}:meta`;
//     const cached = await this.redis.get(key);
//     return cached ? JSON.parse(cached) : null;
//   }

//   async incrementMessageCount(roomId: string): Promise<number> {
//     const key = `chatroom:${roomId}:messageCount`;
//     return await this.redis.incr(key); // atomic increment
//   }

//   async getMessageCount(roomId: string): Promise<number> {
//     const key = `chatroom:${roomId}:messageCount`;
//     const count = await this.redis.get(key);
//     return count ? parseInt(count) : 0;
//   }
// }
