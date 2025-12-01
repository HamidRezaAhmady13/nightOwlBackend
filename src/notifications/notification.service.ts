import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { SocketService } from 'src/socket/socket.service';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { CreateNotificationDto, FeedPage } from './dto/ntfDto';
import { NotificationEntity } from './entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private repo: Repository<NotificationEntity>,
    @InjectQueue('notifications') private queue: Queue,
    private readonly socketService: SocketService,
  ) {}
  private readonly logger = new Logger(NotificationService.name);

  // notification.service.ts
  async createForUser(userId: string, dto: CreateNotificationDto) {
    const payload: DeepPartial<NotificationEntity> = {
      userId,
      type: dto.type,
      smallBody: dto.smallBody,
      payloadRef: dto.payloadRef ?? null,
      meta: dto.meta ?? null,
      sourceId: dto.sourceId ?? null,
      status: 'pending',
    };
    const ntf = this.repo.create(payload);
    const saved = await this.repo.save(ntf);
    await this.queue.add(
      'deliver',
      { id: saved.id },
      { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
    );
    return saved;
  }

  async countUnreadForUser(userId: string): Promise<number> {
    return this.repo.count({
      where: { userId, readAt: IsNull() }, // unread = readAt IS NULL
    });
  }

  async listForUser(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<FeedPage<NotificationEntity>> {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .take(limit + 1);
    if (cursor) qb.andWhere('n.createdAt < :cursor', { cursor });
    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, -1) : items;
    return {
      items: pageItems,
      total: pageItems.length,
      cursor: hasMore
        ? pageItems[pageItems.length - 1].createdAt.toISOString()
        : undefined,
    };
  }

  async markRead(userId: string, notificationId: string) {
    await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: () => 'now()' })
      .where('id = :id AND userId = :userId', { id: notificationId, userId })
      .execute();

    const unread = await this.repo.count({
      where: { userId, readAt: IsNull() },
    });
    this.socketService.emitToUser(userId, 'notifications:unreadCount', {
      unread,
    });
  }

  async markAllRead(userId: string) {
    const res = await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: () => 'now()' })
      .where('userId = :userId AND readAt IS NULL', { userId })
      .execute();
    this.socketService.emitToUser(userId, 'notifications:unreadCount', {
      unread: 0,
    });
    return res.affected ?? 0;
  }

  // idempotent deliver used by worker
  async deliver(notificationId: string) {
    const ntf = await this.repo.findOne({ where: { id: notificationId } });
    if (!ntf || ntf.deliveredAt) {
      this.logger.debug(`already delivered or missing ${notificationId}`);
      return;
    }

    try {
      await this.repo.update(notificationId, {
        deliveredAt: () => 'now()',
        status: 'delivered',
      });
      this.socketService.emitToUser(ntf.userId, 'notification', ntf);
      this.logger.log(`delivered ${notificationId} -> user:${ntf.userId}`);
    } catch (err) {
      this.logger.error(`deliver failed ${notificationId}`, err);
      throw err; // let Bull retry according to attempts/backoff
    }
  }
}
