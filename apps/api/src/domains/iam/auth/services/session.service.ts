import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '@sous/config';
import { logger } from '@sous/logger';

@Injectable()
export class SessionService {
  private redis: Redis | null = null;

  /*
  async onModuleInit() {
    if (config.redis.url) {
      this.redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 0,
        connectTimeout: 5000,
      });
      this.redis.on('error', (err) => {
        // Silent error to prevent hanging/crashing
      });
    }
  }
  */

  async revokeToken(jti: string, exp: number) {
    if (!this.redis) return;
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl > 0) {
      await this.redis.set(`revoked_token:${jti}`, '1', 'EX', ttl);
    }
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    if (!this.redis) return false;
    const result = await this.redis.get(`revoked_token:${jti}`);
    return !!result;
  }
}
