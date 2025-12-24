import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { buildNotification } from 'src/common/utils/buildNotification';
import { LineLogger } from 'src/common/utils/lineLogger';
import { SocketService } from 'src/socket/socket.service';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import {
  CreateNotificationWithtypesDto,
  FeedPage,
  NotificationType,
} from './dto/ntfDto';
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

  async createForUser(userId: string, dto: CreateNotificationWithtypesDto) {
    const built = buildNotification(dto);

    let existing: NotificationEntity | null = null;

    if (dto.type === NotificationType.Follow) {
      existing = await this.repo.findOne({
        where: {
          userId,
          sourceId: dto.sourceId,
          type: NotificationType.Follow,
        },
      });
    } else if (dto.type === NotificationType.Like) {
      const postId = built.payloadRef?.postId;
      if (postId) {
        existing = await this.repo
          .createQueryBuilder('n')
          .where('"n"."userId" = :userId', { userId })
          .andWhere('"n"."sourceId" = :sourceId', { sourceId: dto.sourceId })
          .andWhere('"n"."type" = :type', { type: NotificationType.Like })
          .andWhere(`"n"."payloadRef"->>'postId' = :postId`, { postId })
          .getOne();
      }
    }

    if (existing) {
      existing.createdAt = new Date();
      existing.status = 'pending';
      const refreshed = await this.repo.save(existing);
      await this.queue.add(
        'deliver',
        { id: refreshed.id },
        { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
      );
      return refreshed;
    }

    const payload: DeepPartial<NotificationEntity> = {
      userId,
      type: dto.type,
      smallBody: built.smallBody,
      payloadRef: built.payloadRef ?? null,
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
    const res = this.repo.count({
      where: { userId, readAt: IsNull() }, // unread = readAt IS NULL
    });
    const logger = new LineLogger('this.logger');
    logger.log('22', `1111  ${await res}`);
    return res;
  }

  async listForUser(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<FeedPage<NotificationEntity>> {
    const qb = this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.sourceUser', 'u')
      .where('n.userId = :userId', { userId })
      .orderBy('n.readAt', 'ASC')
      .orderBy('n.createdAt', 'DESC')
      .take(limit + 1);

    // if (cursor) qb.andWhere('n.createdAt < :cursor', { cursor });
    if (cursor) {
      try {
        const [cursorCreatedAt, cursorId] = cursor.split('_');
        qb.andWhere(
          '(n.createdAt < :cursorCreatedAt OR (n.createdAt = :cursorCreatedAt AND n.id < :cursorId))',
          { cursorCreatedAt, cursorId },
        );
      } catch {
        // Fallback for old cursor format
        qb.andWhere('n.createdAt < :cursor', { cursor });
      }
    }

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, -1) : items;
    const total = await this.repo.count({ where: { userId } });

    // new by deepSeek
    const lastItem = pageItems[pageItems.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? `${lastItem.createdAt.toISOString()}_${lastItem.id}`
        : undefined;

    return {
      items: pageItems,
      total,
      cursor: nextCursor,
      // cursor: hasMore
      //   ? pageItems[pageItems.length - 1].createdAt.toISOString()
      //   : undefined,
    };
  }

  async markManyRead(userId: string, ids: string[]): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('userId = :userId', { userId })
      .andWhere('id IN (:...ids)', { ids })
      .andWhere('readAt IS NULL') // only mark unread
      .execute();

    return result.affected ?? 0;
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
