// import {
//   Body,
//   Controller,
//   ForbiddenException,
//   Get,
//   Param,
//   Post,
//   Request,
//   UseGuards,
// } from '@nestjs/common';
// import { ChatService } from './chatroom.service';
// import { CreateChatRoomDto } from './dto/create-chatroom.dto';
// import { AuthGuard } from '@nestjs/passport';

// import { UserService } from 'src/user/user.service';
// import { JwtRequest } from 'src/common/interfaces/JwtRequest';

// @Controller('chatrooms')
// export class ChatController {
//   constructor(
//     private readonly chatService: ChatService,
//     private readonly userService: UserService,
//   ) {}

//   @Get()
//   @UseGuards(AuthGuard('jwt'))
//   async getRooms(@Request() req: JwtRequest) {
//     const userId = req.user.userId;
//     const rooms = await this.chatService.findUserChatRooms(userId);
//     return rooms;
//   }

//   @Post()
//   @UseGuards(AuthGuard('jwt'))
//   async createRoom(@Body() dto: CreateChatRoomDto, @Request() req: JwtRequest) {
//     const userId = req.user.userId;
//     const creator = await this.userService.findById(userId);
//     if (!creator) throw new ForbiddenException('no creator found!');
//     return this.chatService.createChatRoom(dto, creator);
//   }

//   @Post(':id/join')
//   @UseGuards(AuthGuard('jwt'))
//   async joinRoom(@Param('id') roomId: string, @Request() req: JwtRequest) {
//     const userId = req.user.userId;
//     return this.chatService.joinChatRoom(roomId, userId);
//   }

//   @Post(':id/messages')
//   @UseGuards(AuthGuard('jwt'))
//   async sendMessage(
//     @Param('id') roomId: string,
//     @Request() req: JwtRequest,
//     @Body('text') text: string,
//   ) {
//     return this.chatService.sendMessage(roomId, req.user.userId, text);
//   }

//   @Get(':id/messages')
//   @UseGuards(AuthGuard('jwt'))
//   async getMessages(@Param('id') roomId: string, @Request() req: JwtRequest) {
//     return this.chatService.getMessages(roomId);
//   }

//   @Post(':id/leave')
//   @UseGuards(AuthGuard('jwt'))
//   async leaveRoom(@Param('id') roomId: string, @Request() req: JwtRequest) {
//     const userId = req.user.userId;
//     return this.chatService.leaveChatRoom(roomId, userId);
//   }
// }
