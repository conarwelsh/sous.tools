import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { organizations, locations } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { IamSeeder } from '../seeders/iam.seeder.js';
import { PresentationSeeder } from '../seeders/presentation.seeder.js';
import { ProcurementSeeder } from '../seeders/procurement.seeder.js';
import { CulinarySeeder } from '../seeders/culinary.seeder.js';
import { HardwareSeeder } from '../seeders/hardware.seeder.js';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly iamSeeder: IamSeeder,
    private readonly presentationSeeder: PresentationSeeder,
    private readonly procurementSeeder: ProcurementSeeder,
    private readonly culinarySeeder: CulinarySeeder,
    private readonly hardwareSeeder: HardwareSeeder,
  ) {
    logger.info('🏗️ SeederService: Initialized with domain-specific seeders');
  }

  onModuleInit() {
    logger.info('🏗️ SeederService: onModuleInit');
  }

  async seedSystem() {
    logger.info('🌱 SeederService: Starting system seeding...');

    // 1. IAM Seeding (returns orgId)
    const orgId = await this.iamSeeder.seedSystem();

    if (!orgId) {
      logger.error(
        '❌ SeederService: Failed to seed IAM. Aborting system seeding.',
      );
      return;
    }

    // 2. Delegate to Domain Seeders
    await this.presentationSeeder.seedSystem(orgId);
    await this.procurementSeeder.seedSystem(orgId);
    await this.culinarySeeder.seedSystem(orgId);

    logger.info('✅ SeederService: System seeding complete.');
  }

  async seedSample() {
    logger.info('🧪 SeederService: Starting sample data seeding...');

    // 1. IAM (Org & User)
    await this.iamSeeder.seedSample();

    const sampleOrg = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.slug, 'sample-kitchen'),
    });

    if (!sampleOrg) {
      logger.error(
        '❌ SeederService: Sample organization not found. Aborting sample seeding.',
      );
      return;
    }

    const orgId = sampleOrg.id;

    // 2. Core (Locations)
    await this.dbService.db
      .insert(locations)
      .values({
        name: 'Main Store',
        organizationId: orgId,
      })
      .onConflictDoNothing();

    // 3. Delegate to Domain Seeders
    await this.presentationSeeder.seedSample(orgId);
    await this.procurementSeeder.seedSample(orgId);
    await this.culinarySeeder.seedSample(orgId);
    await this.hardwareSeeder.seedSample(orgId);

    logger.info('✅ SeederService: Sample seeding complete.');
  }
}
