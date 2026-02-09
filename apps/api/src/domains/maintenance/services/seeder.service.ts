import { Injectable, Inject } from '@nestjs/common';
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
    @Inject(PresentationService)
    private readonly presentationService: PresentationService,
    @Inject(ProcurementService)
    private readonly procurementService: ProcurementService,
    @Inject(CulinaryService)
    private readonly culinaryService: CulinaryService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async seedSystem() {
    logger.info('🌱 Seeding system data...');

    const orgId = await this.authService.seedSystem();

    // 5. Delegate to Domain Services
    await this.presentationService.seedSystem(orgId);
    await this.procurementService.seedSystem(orgId);
    await this.culinaryService.seedSystem(orgId);

    logger.info('✅ System seeding complete.');
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
