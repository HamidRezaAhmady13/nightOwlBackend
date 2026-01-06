import { NotificationService } from 'src/notifications/notification.service';
import { SocketService } from 'src/socket/socket.service';
import { CreateNtfDto, RequestWithUser } from './dto/ntfDto';
export declare class NotificationController {
    private readonly ntfService;
    private readonly socketService;
    private readonly logger;
    constructor(ntfService: NotificationService, socketService: SocketService);
    unreadCount(req: RequestWithUser): Promise<{
        unread: number;
    }>;
    list(req: RequestWithUser, cursor?: string, limit?: string): Promise<import("./dto/ntfDto").FeedPage<import("./entity/notification.entity").NotificationEntity>>;
    markManyRead(req: RequestWithUser, ids: string[]): Promise<{
        ok: boolean;
        updated: number;
    }>;
    markRead(req: RequestWithUser, id: string): Promise<{
        ok: boolean;
    }>;
    markAllRead(req: RequestWithUser): Promise<{
        ok: boolean;
        updated: number;
    }>;
    create(dto: CreateNtfDto): Promise<import("./entity/notification.entity").NotificationEntity>;
    private buildPayload;
}
