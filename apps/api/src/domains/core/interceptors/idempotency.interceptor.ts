import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service.js';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Only apply to mutations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return next.handle();
    }

    const key = request.headers['x-idempotency-key'];
    if (!key) return next.handle();

    const userId = request.user?.sub || 'anonymous';
    const cacheKey = `idempotency:${userId}:${key}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      if (cached === 'IN_PROGRESS') {
        throw new BadRequestException('Request already in progress');
      }
      return of(JSON.parse(cached));
    }

    await this.cacheService.set(cacheKey, 'IN_PROGRESS', 60);

    return next.handle().pipe(
      tap((response) => {
        // Store the result for 24h
        void this.cacheService.set(cacheKey, JSON.stringify(response), 86400);
      }),
    );
  }
}
