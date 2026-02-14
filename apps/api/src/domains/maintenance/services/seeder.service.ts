import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { organizations, locations, users } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { PresentationService } from '../../presentation/services/presentation.service.js';
import { ProcurementService } from '../../procurement/services/procurement.service.js';
import { CulinaryService } from '../../culinary/services/culinary.service.js';
import { AuthService } from '../../iam/auth/auth.service.js';
import { ModuleRef } from '@nestjs/core';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly authService: AuthService,
    private readonly moduleRef: ModuleRef,
  ) {
    logger.info('🏗️ SeederService: constructor');
  }

  async seedSystem() {
    logger.info('🌱 SeederService: Starting system seeding...');

    const orgId = await this.authService.seedSystem();
    logger.info(`🌱 SeederService: IAM seeded, orgId: ${orgId}`);

    // Resolve domain services on demand
    const presentationService = this.moduleRef.get(PresentationService, {
      strict: false,
    });
    const procurementService = this.moduleRef.get(ProcurementService, {
      strict: false,
    });
    const culinaryService = this.moduleRef.get(CulinaryService, {
      strict: false,
    });

    // 5. Delegate to Domain Services
    if (presentationService) {
      logger.info('🌱 SeederService: Seeding Presentation...');
      await presentationService.seedSystem(orgId);
    }

    if (procurementService) {
      logger.info('🌱 SeederService: Seeding Procurement...');
      await procurementService.seedSystem(orgId);
    }

    if (culinaryService) {
      logger.info('🌱 SeederService: Seeding Culinary...');
      await culinaryService.seedSystem(orgId);
    }

    logger.info('✅ SeederService: System seeding complete.');
  }

  async seedSample() {
    logger.info('🧪 Seeding sample data for development...');

    // Resolve domain services on demand
    const presentationService = this.moduleRef.get(PresentationService, {
      strict: false,
    });
    const procurementService = this.moduleRef.get(ProcurementService, {
      strict: false,
    });
    const culinaryService = this.moduleRef.get(CulinaryService, {
      strict: false,
    });

    // 1. IAM (Org & User)
    await this.authService.seedSample();

    const sampleOrg = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.slug, 'sample-kitchen'),
    });

    if (!sampleOrg) return;

    // 2. Core (Locations)
    await this.dbService.db
      .insert(locations)
      .values({
        name: 'Main Store',
        organizationId: sampleOrg.id,
      })
      .onConflictDoNothing();

    // 3. Delegate to Domain Services
    if (presentationService) await presentationService.seedSample(sampleOrg.id);
    if (procurementService) await procurementService.seedSample(sampleOrg.id);
    if (culinaryService) await culinaryService.seedSample(sampleOrg.id);

    logger.info('✅ Sample seeding complete.');
  }
}
