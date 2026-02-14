import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { logger } from '@sous/logger';

export class SupportReport {
  type: 'BUG' | 'FEATURE' | 'QUESTION';
  subject: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata: {
    appVersion: string;
    orgId: string;
    userId: string;
    userAgent: string;
    url: string;
  };
}

@Injectable()
export class SupportService {
  constructor(
    @InjectQueue('support-queue') private readonly supportQueue: Queue<SupportReport>,
  ) {}

  async report(data: SupportReport) {
    logger.info(`[Support] Queueing ${data.type} report: ${data.subject}`);
    await this.supportQueue.add('process-report', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    return { success: true };
  }
}
