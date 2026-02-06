import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { logger } from '@sous/logger';

@Injectable()
export class RealtimeThrottlingInterceptor implements NestInterceptor {
  private lastUpdate: Map<string, number> = new Map();
  private readonly THROTTLE_MS = 60000; // 60 seconds per ADR 034

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const event = context.getHandler().name; // Mock event name for simple check

    // We only throttle non-critical telemetry
    if (data.type === 'telemetry') {
      const key = `${client.data.hardwareId}:${data.key}`;
      const now = Date.now();
      const last = this.lastUpdate.get(key) || 0;

      if (now - last < this.THROTTLE_MS) {
        // Skip redundant update
        return of(null);
      }

      this.lastUpdate.set(key, now);
    }

    return next.handle();
  }
}
