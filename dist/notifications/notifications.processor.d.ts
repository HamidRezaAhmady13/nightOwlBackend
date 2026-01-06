import { Job } from 'bull';
import { NotificationService } from 'src/notifications/notification.service';
export declare class NotificationsProcessor {
    private svc;
    constructor(svc: NotificationService);
    handleDeliver(job: Job): Promise<void>;
}
