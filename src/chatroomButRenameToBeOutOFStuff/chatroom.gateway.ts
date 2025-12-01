// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   MessageBody,
//   ConnectedSocket,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import * as jwt from 'jsonwebtoken';
// import { ConfigService } from '@nestjs/config';
// import { Message } from './entity/message.entity'; // adjust path if needed
// import { ChatService } from './chatroom.service';
// import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   constructor(
//     private readonly chatService: ChatService,
//     private readonly configService: ConfigService,
//   ) {}
//   @WebSocketServer()
//   server: Server;

//   handleConnection(client: Socket) {
//     const userId = this.extractUserId(client);
//     this.chatService.markUserOnline(userId);
//   }

//   handleDisconnect(client: Socket) {
//     const userId = this.extractUserId(client);
//     this.chatService.markUserOffline(userId);
//   }

//   extractUserId(client: Socket): string {
//     const token = client.handshake.auth?.token;
//     if (!token) throw new UnauthorizedException('Missing auth token');

//     const secret = this.configService.get<string>('JWT_SECRET');
//     if (!secret) throw new NotFoundException('JWT secret not configured');

//     try {
//       const decoded = jwt.verify(token, secret) as { sub: string };
//       if (!decoded.sub)
//         throw new UnauthorizedException('Invalid token payload');
//       return decoded.sub;
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         throw new UnauthorizedException('Token has expired');
//       }
//       console.log('JWT verification failed:', err);
//       throw new UnauthorizedException('Token verification failed');
//     }
//   }

//   @SubscribeMessage('joinRoom')
//   handleJoinRoom(
//     @MessageBody() roomId: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.join(roomId);
//     console.log(`Client ${client.id} joined room ${roomId}`);
//   }

//   sendMessageToRoom(roomId: string, message: Message) {
//     this.server.to(roomId).emit('newMessage', message);
//   }
// }
