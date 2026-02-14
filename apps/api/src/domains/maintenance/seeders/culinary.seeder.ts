import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CulinaryService } from '../../culinary/services/culinary.service.js';
import { IntegrationsService } from '../../integrations/services/integrations.service.js';
import { Seeder } from './base.seeder.js';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class CulinarySeeder implements Seeder {
  constructor(
    private readonly culinaryService: CulinaryService,
    private readonly moduleRef: ModuleRef,
  ) {}

  private get integrationsService() {
    return this.moduleRef.get(IntegrationsService, { strict: false });
  }

  async seedSystem(orgId: string): Promise<void> {
    logger.info('🌱 Seeding Culinary System Data...');
    await this.culinaryService.seedSystem(orgId);
  }

  async seedSample(orgId: string): Promise<void> {
    logger.info('🌱 Seeding Culinary Sample Data...');
    await this.culinaryService.seedSample(orgId);

    // External Sync to Square Sandbox if configured
    if (config.square.applicationId && config.square.environment === 'sandbox') {
      await this.seedExternal(orgId);
    }
  }

  async seedExternal(orgId: string): Promise<void> {
    logger.info(`🌐 CulinarySeeder: Pushing local catalog to Square Sandbox for org ${orgId}...`);
    
    try {
      // Find Square integration for this org
      const integration = await this.integrationsService.getIntegration(orgId, 'square');
      
      if (integration) {
        logger.info(`🌐 CulinarySeeder: Found Square integration for org ${orgId}. Triggering driver seed...`);
        await this.integrationsService.seed(orgId, 'square');
        logger.info(`✅ CulinarySeeder: Square Sandbox seeded successfully.`);
      } else {
        logger.warn(`🌐 CulinarySeeder: No Square integration found for org ${orgId}. Skipping external seed.`);
        logger.info(`💡 Tip: Connect Square in the Integrations Manager to enable automatic external seeding.`);
      }
    } catch (error: any) {
      logger.error(`❌ CulinarySeeder: Failed to seed external Square Sandbox: ${error.message}`);
    }
  }
}
