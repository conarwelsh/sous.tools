import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { logger } from '@sous/logger';
import { SalesService } from './sales.service.js';

@Processor('sales-queue')
export class CommissionProcessor extends WorkerHost {
  constructor(private readonly salesService: SalesService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { type, data } = job.data;
    logger.info(`⚙️ Processing Sales Job: ${job.id} (${type})`);

    switch (type) {
      case 'calculate-commission':
        await this.salesService.recordCommission(
          data.organizationId,
          data.amount,
          data.externalId
        );
        break;
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
}
