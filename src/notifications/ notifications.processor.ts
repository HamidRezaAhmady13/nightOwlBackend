// notifications.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationService } from './notification.service';

@Processor('notifications')
export class NotificationsProcessor {
  constructor(private svc: NotificationService) {}
  @Process('deliver')
  async handleDeliver(job: Job) {
    await this.svc.deliver(job.data.id);
  }
}
