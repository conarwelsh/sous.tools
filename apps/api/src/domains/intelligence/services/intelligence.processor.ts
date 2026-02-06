import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CostingService } from './costing.service.js';
import { logger } from '@sous/logger';

@Processor('intelligence')
export class IntelligenceProcessor extends WorkerHost {
  constructor(private readonly costingService: CostingService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    logger.info(`Processing job ${job.name}`);
    switch (job.name) {
      case 'calculate-recipe-cost':
        return this.costingService.calculateRecipeCost(
          job.data.recipeId,
          job.data.organizationId,
        );
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
