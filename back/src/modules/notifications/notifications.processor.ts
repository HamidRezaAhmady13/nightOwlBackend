// notifications.processor.ts
import { NotificationService } from '@/modules/notifications/notification.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('notifications')
export class NotificationsProcessor {
  constructor(private svc: NotificationService) {}
  @Process('deliver')
  async handleDeliver(job: Job) {
    await this.svc.deliver(job.data.id);
  }
}
