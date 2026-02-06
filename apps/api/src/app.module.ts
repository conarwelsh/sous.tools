import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CoreModule } from './domains/core/core.module.js';
import { IamModule } from './domains/iam/iam.module.js';
import { MediaModule } from './domains/media/media.module.js';
import { IntelligenceModule } from './domains/intelligence/intelligence.module.js';
import { HardwareModule } from './domains/hardware/hardware.module.js';
import { PresentationModule } from './domains/presentation/presentation.module.js';
import { RealtimeModule } from './domains/realtime/realtime.module.js';
import { ProcurementModule } from './domains/procurement/procurement.module.js';
import { CulinaryModule } from './domains/culinary/culinary.module.js';
import { InventoryModule } from './domains/inventory/inventory.module.js';
import { AccountingModule } from './domains/accounting/accounting.module.js';
import { IntegrationsModule } from './domains/integrations/integrations.module.js';
import { join } from 'path';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    CoreModule,
    IamModule,
    MediaModule,
    IntelligenceModule,
    HardwareModule,
    PresentationModule,
    RealtimeModule,
    ProcurementModule,
    CulinaryModule,
    InventoryModule,
    AccountingModule,
    IntegrationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
