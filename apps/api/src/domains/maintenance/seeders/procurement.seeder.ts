import { Injectable } from '@nestjs/common';
import { ProcurementService } from '../../procurement/services/procurement.service.js';
import { Seeder } from './base.seeder.js';
import { logger } from '@sous/logger';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ProcurementSeeder implements Seeder {
  constructor(private readonly moduleRef: ModuleRef) {}

  private get procurementService() {
    return this.moduleRef.get(ProcurementService, { strict: false });
  }

  async seedSystem(orgId: string): Promise<void> {
    logger.info('🌱 Seeding Procurement System Data...');
    await this.procurementService.seedSystem(orgId);
  }

  async seedSample(orgId: string): Promise<void> {
    logger.info('🌱 Seeding Procurement Sample Data...');
    await this.procurementService.seedSample(orgId);
  }
}
