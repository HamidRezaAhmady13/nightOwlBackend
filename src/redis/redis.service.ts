// redis.service.ts
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public client!: Redis; // <-- change from private to public

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const options: RedisOptions = {
      host: this.config.get<string>('REDIS_HOST', '127.0.0.1'),
      port: Number(this.config.get<number>('REDIS_PORT', 6379)),
      password: this.config.get<string | undefined>('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 200, 2000),
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    };

    this.client = new Redis(options);

    this.client.on('connect', () => this.logger.log('Redis connecting...'));
    this.client.on('ready', () => this.logger.log('Redis ready'));
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`),
    );
    this.client.on('end', () => this.logger.warn('Redis connection closed'));
    this.client.on('reconnecting', () =>
      this.logger.warn('Redis reconnecting...'),
    );
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => this.client.disconnect());
      this.logger.log('Redis connection closed gracefully');
    }
  }

  // Basic KV
  async set(key: string, value: string, ttlSeconds?: number) {
    return ttlSeconds
      ? this.client.set(key, value, 'EX', ttlSeconds)
      : this.client.set(key, value);
  }

  async psetex(key: string, ttlMs: number, value: string) {
    return this.client.psetex(key, ttlMs, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  // Hashes
  async hset(hash: string, field: string, value: string) {
    return this.client.hset(hash, field, value);
  }

  async hget(hash: string, field: string) {
    return this.client.hget(hash, field);
  }

  // Pub/Sub (optional)
  createSubscriber(): Redis {
    return this.client.duplicate();
  }

  createPublisher(): Redis {
    return this.client.duplicate();
  }

  // Health
  async ping(): Promise<string> {
    return this.client.ping();
  }

  // redis.service.ts (add this method)
  async eval(
    script: string,
    opts: { keys?: string[]; arguments?: (string | number)[] },
  ): Promise<any> {
    const keys = opts.keys ?? [];
    const args = (opts.arguments ?? []).map(String);
    return this.client.eval(script, keys.length, ...keys, ...args);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }
}
