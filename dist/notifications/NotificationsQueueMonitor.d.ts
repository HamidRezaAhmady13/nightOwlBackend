import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
export declare class NotificationsQueueMonitor implements OnModuleInit {
    private queue;
    private readonly logger;
    constructor(queue: Queue);
    onModuleInit(): Promise<void>;
    private moveToDlq;
}
