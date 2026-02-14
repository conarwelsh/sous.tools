import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { SeederService } from './services/seeder.service.js';
import { CoreModule } from '../core/core.module.js';
import { PresentationModule } from '../presentation/presentation.module.js';
import { ProcurementModule } from '../procurement/procurement.module.js';
import { CulinaryModule } from '../culinary/culinary.module.js';
import { AuthModule } from '../iam/auth/auth.module.js';
import { IamSeeder } from './seeders/iam.seeder.js';
import { PresentationSeeder } from './seeders/presentation.seeder.js';
import { ProcurementSeeder } from './seeders/procurement.seeder.js';
import { CulinarySeeder } from './seeders/culinary.seeder.js';
import { logger } from '@sous/logger';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    forwardRef(() => ProcurementModule),
    forwardRef(() => PresentationModule),
    forwardRef(() => CulinaryModule),
  ],
  providers: [
    SeederService,
    IamSeeder,
    ProcurementSeeder,
    PresentationSeeder,
    CulinarySeeder,
  ],
  exports: [SeederService],
})
export class MaintenanceModule {}
