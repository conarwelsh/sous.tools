import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { logger } from '@sous/logger';
import { IngestionService } from './ingestion.service.js';
import { IntegrationsService } from '../../integrations/services/integrations.service.js';

export interface IngestionJobData {
  recipeId: string;
  organizationId: string;
}

@Processor('ingestion-queue')
export class IngestionProcessor extends WorkerHost {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly integrationsService: IntegrationsService,
  ) {
    super();
  }

  async process(job: Job<IngestionJobData>): Promise<any> {
    const { recipeId, organizationId } = job.data;
    logger.info(`⚙️ Processing Ingestion Job: ${job.id} (Recipe: ${recipeId})`);

    // 1. Get Storage Driver from Integrations
    const driver = await this.integrationsService.getStorageDriver(organizationId, 'google-drive');

    // 2. Process
    return this.ingestionService.processGoogleDriveRecipe(recipeId, organizationId, driver);
  }
}
