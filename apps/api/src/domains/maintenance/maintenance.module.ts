import { Module } from '@nestjs/common';
import { SeederService } from './services/seeder.service.js';
import { CoreModule } from '../core/core.module.js';
import { PresentationModule } from '../presentation/presentation.module.js';
import { ProcurementModule } from '../procurement/procurement.module.js';
import { CulinaryModule } from '../culinary/culinary.module.js';
import { AuthModule } from '../iam/auth/auth.module.js';

@Module({
  imports: [
    CoreModule,
    PresentationModule,
    ProcurementModule,
    CulinaryModule,
    AuthModule,
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class MaintenanceModule {}
