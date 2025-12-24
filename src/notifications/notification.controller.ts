// import {
//   BadRequestException,
//   Body,
//   Controller,
//   Get,
//   Param,
//   Patch,
//   Post,
//   Query,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { LineLogger } from 'src/common/utils/lineLogger';
// import {
//   CreateNotificationWithtypesDto,
//   CreateNtfDto,
//   NotificationType,
//   RequestWithUser,
// } from './dto/ntfDto';
// import { NotificationService } from './notification.service';

// @UseGuards(JwtAuthGuard)
// @Controller('notifications')
// export class NotificationController {
//   constructor(private readonly ntfService: NotificationService) {}

//   @Get('unread-count')
//   async unreadCount(@Req() req: RequestWithUser) {
//     const userId = req.user.id;
//     const unread = await this.ntfService.countUnreadForUser(userId);
//     new LineLogger('NotificationController').log(
//       'unreadCount',
//       `User ${userId} has ${unread} unread notifications`,
//     );
//     return { unread };
//   }

//   @Get()
//   async list(
//     @Req() req: RequestWithUser,
//     @Query('cursor') cursor?: string,
//     @Query('limit') limit = '20',
//   ) {
//     const userId = req.user.id;
//     return this.ntfService.listForUser(userId, cursor, Number(limit));
//   }

//   @Patch('mark-many-read')
//   async markManyRead(@Req() req: RequestWithUser, @Body('ids') ids: string[]) {
//     const userId = req.user.id;
//     const updated = await this.ntfService.markManyRead(userId, ids);
//     return { ok: true, updated };
//   }

//   @Patch(':id/read')
//   async markRead(@Req() req: RequestWithUser, @Param('id') id: string) {
//     const userId = req.user.id;
//     await this.ntfService.markRead(userId, id);
//     return { ok: true };
//   }

//   @Patch('mark-all-read')
//   async markAllRead(@Req() req: RequestWithUser) {
//     const userId = req.user.id;
//     const updated = await this.ntfService.markAllRead(userId);
//     return { ok: true, updated };
//   }

//   @Post()
//   async create(@Body() dto: CreateNtfDto) {
//     let payload: CreateNotificationWithtypesDto;

//     switch (dto.type) {
//       case NotificationType.Follow:
//         payload = {
//           type: NotificationType.Follow,
//           sourceId: dto.actor.id,
//           followerId: dto.actor.id,
//           meta: dto.meta ?? null,
//         };
//         break;

//       case NotificationType.Comment:
//         payload = {
//           type: NotificationType.Comment,
//           sourceId: dto.actor.id,
//           postId: dto.meta?.postId, // ✅ correct fields
//           commentId: dto.meta?.commentId,
//           meta: dto.meta ?? null,
//         };
//         break;

//       case NotificationType.Like:
//         payload = {
//           type: NotificationType.Like,
//           sourceId: dto.actor.id,
//           postId: dto.meta?.postId, // ✅ correct fields
//           meta: dto.meta ?? null,
//         };
//         break;

//       default:
//         throw new BadRequestException('Invalid notification type');
//     }

//     return this.ntfService.createForUser(dto.userId, payload);
//   }
// }

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LineLogger } from 'src/common/utils/lineLogger';
import { SocketService } from 'src/socket/socket.service';
import {
  CreateNotificationWithtypesDto,
  CreateNtfDto,
  NotificationType,
  RequestWithUser,
} from './dto/ntfDto';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  private readonly logger = new LineLogger('NotificationController');

  constructor(
    private readonly ntfService: NotificationService,
    private readonly socketService: SocketService,
  ) {}

  // -------------------------
  // GET /notifications/unread-count
  // -------------------------
  @Get('unread-count')
  async unreadCount(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const unread = await this.ntfService.countUnreadForUser(userId);

    this.logger.log('unreadCount', `User ${userId} has ${unread} unread`);

    return { unread };
  }

  // -------------------------
  // GET /notifications
  // -------------------------
  @Get()
  async list(
    @Req() req: RequestWithUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    return this.ntfService.listForUser(req.user.id, cursor, Number(limit));
  }

  // -------------------------
  // PATCH /notifications/mark-many-read
  // -------------------------
  @Patch('mark-many-read')
  async markManyRead(@Req() req: RequestWithUser, @Body('ids') ids: string[]) {
    const userId = req.user.id;

    const updated = await this.ntfService.markManyRead(req.user.id, ids);

    const unread = await this.ntfService.countUnreadForUser(userId);
    this.socketService.emitUnreadCount(userId, unread);

    return { ok: true, updated };
  }

  // -------------------------
  // PATCH /notifications/:id/read
  // -------------------------
  @Patch(':id/read')
  async markRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.ntfService.markRead(req.user.id, id);
    return { ok: true };
  }

  // -------------------------
  // PATCH /notifications/mark-all-read
  // -------------------------
  @Patch('mark-all-read')
  async markAllRead(@Req() req: RequestWithUser) {
    const updated = await this.ntfService.markAllRead(req.user.id);
    return { ok: true, updated };
  }

  // -------------------------
  // POST /notifications
  // -------------------------
  @Post()
  async create(@Body() dto: CreateNtfDto) {
    const payload = this.buildPayload(dto);
    return this.ntfService.createForUser(dto.userId, payload);
  }

  // -------------------------
  // PRIVATE HELPERS
  // -------------------------
  private buildPayload(dto: CreateNtfDto): CreateNotificationWithtypesDto {
    const base = {
      sourceId: dto.actor.id,
      meta: dto.meta ?? null,
    };

    switch (dto.type) {
      case NotificationType.Follow:
        return {
          ...base,
          type: NotificationType.Follow,
          followerId: dto.actor.id,
        };

      case NotificationType.Comment:
        return {
          ...base,
          type: NotificationType.Comment,
          postId: dto.meta?.postId,
          commentId: dto.meta?.commentId,
        };

      case NotificationType.Like:
        return {
          ...base,
          type: NotificationType.Like,
          postId: dto.meta?.postId,
        };

      default:
        throw new BadRequestException('Invalid notification type');
    }
  }
}
