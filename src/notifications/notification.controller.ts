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
  constructor(private readonly ntfService: NotificationService) {}

  @Get('unread-count')
  async unreadCount(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return { unread: await this.ntfService.countUnreadForUser(userId) };
  }

  @Get()
  async list(
    @Req() req: RequestWithUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const userId = req.user.id;
    return this.ntfService.listForUser(userId, cursor, Number(limit));
  }

  @Patch('mark-many-read')
  async markManyRead(@Req() req: RequestWithUser, @Body('ids') ids: string[]) {
    const userId = req.user.id;
    const updated = await this.ntfService.markManyRead(userId, ids);
    return { ok: true, updated };
  }

  @Patch(':id/read')
  async markRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    await this.ntfService.markRead(userId, id);
    return { ok: true };
  }

  @Patch('mark-all-read')
  async markAllRead(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const updated = await this.ntfService.markAllRead(userId);
    return { ok: true, updated };
  }

  @Post()
  async create(@Body() dto: CreateNtfDto) {
    let payload: CreateNotificationWithtypesDto;

    switch (dto.type) {
      case NotificationType.Follow:
        payload = {
          type: NotificationType.Follow,
          sourceId: dto.actor.id,
          followerId: dto.actor.id,
          meta: dto.meta ?? null,
        };
        break;

      case NotificationType.Comment:
        payload = {
          type: NotificationType.Comment,
          sourceId: dto.actor.id,
          postId: dto.meta?.postId, // ✅ correct fields
          commentId: dto.meta?.commentId,
          meta: dto.meta ?? null,
        };
        break;

      case NotificationType.Like:
        payload = {
          type: NotificationType.Like,
          sourceId: dto.actor.id,
          postId: dto.meta?.postId, // ✅ correct fields
          meta: dto.meta ?? null,
        };
        break;

      default:
        throw new BadRequestException('Invalid notification type');
    }

    return this.ntfService.createForUser(dto.userId, payload);
  }

  // @Post()
  // async create(@Body() dto: CreateNtfDto) {
  //   if (dto.type === NotificationType.Follow) {
  //     const payload: FollowNtf = {
  //       type: NotificationType.Follow,
  //       sourceId: dto.actor.id,
  //       followerId: dto.actor.id,
  //       meta: dto.meta ?? null,
  //     };
  //   }
  //   if (dto.type === NotificationType.Comment) {
  //     const payload: CommentNtf = {
  //       type: NotificationType.Comment,
  //       sourceId: dto.actor.id,
  //       followerId: dto.actor.id,
  //       meta: dto.meta ?? null,
  //     };
  //   }
  //   if (dto.type === NotificationType.Like) {
  //     const payload: LikeNtf = {
  //       type: NotificationType.Like,
  //       sourceId: dto.actor.id,
  //       followerId: dto.actor.id,
  //       meta: dto.meta ?? null,
  //     };
  //   }
  //   // const payload: CreateNotificationWithtypesDto = {
  //   //   type: dto.type,
  //   //   // type: 'follow',
  //   //   sourceId: dto.actor.id, // ✅ string
  //   //   followerId: dto.actor.id,
  //   //   meta: dto.meta ?? null,
  //   // };
  //   // {
  //   //   type: dto.type,
  //   //   smallBody: `${dto.actor.username} ${dto.type}`,
  //   //   payloadRef: { actor: dto.actor },
  //   //   meta: dto.meta ?? null,
  //   //   sourceId: undefined,
  //   // };
  //   return this.ntfService.createForUser(dto.userId, payload);
  // }
}
