import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { configPromise } from '@sous/config';

@Injectable()
export class SessionService {
  private redis: Redis | null = null;

  async onModuleInit() {
    const config = await configPromise;
    if (config.redis.url) {
      this.redis = new Redis(config.redis.url);
    }
  }

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
