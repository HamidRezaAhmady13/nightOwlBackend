import { LineLogger } from '@/common/utils/lineLogger';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class NotificationsQueueMonitor implements OnModuleInit {
  private readonly logger = new LineLogger();
  constructor(@InjectQueue('notifications') private queue: Queue) {}

  async onModuleInit() {
    this.queue.on('failed', async (job, err) => {
      this.logger.warn(
        `job failed ${job.id} attempts=${job.attemptsMade} name=${job.name} err=${err?.message}`,
      );
      const maxAttempts = job.opts.attempts ?? 1;
      if (job.attemptsMade >= maxAttempts) {
        await this.moveToDlq(job, err);
      }
    });

    this.queue.on('completed', (job) => {
      this.logger.debug(`job completed ${job.id} name=${job.name}`);
    });

    this.queue.on('stalled', (job) => {
      this.logger.warn(`job stalled ${job.id}`);
    });
  }

  private async moveToDlq(job: any, err: Error | any) {
    try {
      const payload = {
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        failedReason: err?.message,
        timestamp: Date.now(),
      };
      await this.queue.client.rpush(
        'notifications:dlq',
        JSON.stringify(payload),
      );
      this.logger.warn(`moved job ${job.id} to DLQ`);
    } catch (e) {
      this.logger.error('failed to move job to DLQ', e);
    }
  }
}
