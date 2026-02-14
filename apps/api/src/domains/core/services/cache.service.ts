import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '@sous/config';
import { logger } from '@sous/logger';

@Injectable()
export class CacheService implements OnModuleInit {
  private redis: Redis | null = null;

  async onModuleInit() {
    if (config.redis.url) {
      this.redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 0,
        connectTimeout: 5000,
      });
      this.redis.on('error', (err) => {
        logger.error('❌ CacheService Redis Error', err);
      });
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }
}
