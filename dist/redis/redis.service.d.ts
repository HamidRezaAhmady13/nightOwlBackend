import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    client: Redis;
    constructor(config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    set(key: string, value: string, ttlSeconds?: number): Promise<"OK">;
    psetex(key: string, ttlMs: number, value: string): Promise<unknown>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<number>;
    hset(hash: string, field: string, value: string): Promise<number>;
    hget(hash: string, field: string): Promise<string | null>;
    createSubscriber(): Redis;
    createPublisher(): Redis;
    ping(): Promise<string>;
    eval(script: string, opts: {
        keys?: string[];
        arguments?: (string | number)[];
    }): Promise<any>;
    incr(key: string): Promise<number>;
    decr(key: string): Promise<number>;
}
