import { Injectable } from '@nestjs/common';
import { PresentationService } from '../../presentation/services/presentation.service.js';
import { Seeder } from './base.seeder.js';
import { logger } from '@sous/logger';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PresentationSeeder implements Seeder {
  constructor(private readonly moduleRef: ModuleRef) {}

  private get presentationService() {
    return this.moduleRef.get(PresentationService, { strict: false });
  }

  async seedSystem(orgId: string): Promise<void> {
    logger.info('🌱 Seeding Presentation System Data...');
    await this.presentationService.seedSystem(orgId);
  }

  async seedSample(orgId: string): Promise<void> {
    logger.info('🌱 Seeding Presentation Sample Data...');
    await this.presentationService.seedSample(orgId);
  }
}
