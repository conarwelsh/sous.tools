import { Module, forwardRef } from '@nestjs/common';
import { BillingService } from './services/billing.service.js';
import { BillingController } from './controllers/billing.controller.js';
import { BillingResolver } from './resolvers/billing.resolver.js';
import { WebhookController } from './controllers/webhook.controller.js';
import { PaymentDriverFactory } from './drivers/driver.factory.js';
import { CoreModule } from '../core/core.module.js';
import { SalesModule } from '../sales/sales.module.js';

@Module({
  imports: [CoreModule, forwardRef(() => SalesModule)],
  providers: [BillingService, BillingResolver, PaymentDriverFactory],
  controllers: [BillingController, WebhookController],
  exports: [BillingService],
})
export class BillingModule {}
