import { Queue } from 'bull';
import { CreateNotificationWithtypesDto, FeedPage } from 'src/notifications/dto/ntfDto';
import { NotificationEntity } from 'src/notifications/entity/notification.entity';
import { SocketService } from 'src/socket/socket.service';
import { Repository } from 'typeorm';
export declare class NotificationService {
    private repo;
    private queue;
    private readonly socketService;
    constructor(repo: Repository<NotificationEntity>, queue: Queue, socketService: SocketService);
    private readonly logger;
    createForUser(userId: string, dto: CreateNotificationWithtypesDto): Promise<NotificationEntity>;
    countUnreadForUser(userId: string): Promise<number>;
    listForUser(userId: string, cursor?: string, limit?: number): Promise<FeedPage<NotificationEntity>>;
    markManyRead(userId: string, ids: string[]): Promise<number>;
    markRead(userId: string, notificationId: string): Promise<void>;
    markAllRead(userId: string): Promise<number>;
    deliver(notificationId: string): Promise<void>;
}
