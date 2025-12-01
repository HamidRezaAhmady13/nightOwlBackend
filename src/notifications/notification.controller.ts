import {
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
  CreateNotificationDto,
  CreateNtfDto,
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
    const payload: CreateNotificationDto = {
      type: dto.type,
      smallBody: `${dto.actor.username} ${dto.type}`,
      payloadRef: { actor: dto.actor },
      meta: dto.meta ?? null,
      sourceId: undefined,
    };
    return this.ntfService.createForUser(dto.userId, payload);
  }
}
