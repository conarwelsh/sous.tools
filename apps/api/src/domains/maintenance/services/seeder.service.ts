import { Injectable, Inject, Optional } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { organizations, locations, users } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { PresentationService } from '../../presentation/services/presentation.service.js';
import { ProcurementService } from '../../procurement/services/procurement.service.js';
import { CulinaryService } from '../../culinary/services/culinary.service.js';
import { AuthService } from '../../iam/auth/auth.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    @Optional()
    @Inject(PresentationService)
    private readonly presentationService: PresentationService,
    @Optional()
    @Inject(ProcurementService)
    private readonly procurementService: ProcurementService,
    @Optional()
    @Inject(CulinaryService)
    private readonly culinaryService: CulinaryService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {
    logger.info('🏗️ SeederService: constructor');
    void this.dbService.db
      .execute('SELECT 1')
      .then(() => {
        logger.info(
          '🐘 SeederService: Database connection verified in constructor',
        );
      })
      .catch((e) => {
        logger.error(
          '🐘 SeederService: Database connection failed in constructor',
          e,
        );
      });
  }

  async seedSystem() {
    logger.info('🌱 SeederService: Starting system seeding...');

    const orgId = await this.authService.seedSystem();
    logger.info(`🌱 SeederService: IAM seeded, orgId: ${orgId}`);

    // 5. Delegate to Domain Services
    logger.info('🌱 SeederService: Seeding Presentation...');
    await this.presentationService.seedSystem(orgId);

    logger.info('🌱 SeederService: Seeding Procurement...');
    await this.procurementService.seedSystem(orgId);

    logger.info('🌱 SeederService: Seeding Culinary...');
    await this.culinaryService.seedSystem(orgId);

    logger.info('✅ SeederService: System seeding complete.');
  }

  async seedSample() {
    logger.info('🧪 Seeding sample data for development...');

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
    await this.presentationService.seedSample(sampleOrg.id);
    await this.procurementService.seedSample(sampleOrg.id);
    await this.culinaryService.seedSample(sampleOrg.id);

    logger.info('✅ Sample seeding complete.');
  }
}
