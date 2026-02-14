import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { BillingService } from '../services/billing.service.js';
import { SalesService } from '../../sales/services/sales.service.js';
import { config } from '@sous/config';
import { logger } from '@sous/logger';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly billingService: BillingService,
    private readonly salesService: SalesService,
  ) {
    if (config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey);
    }
  }

  @Post()
  async handleWebhook(@Req() req: any, @Res() res: any, @Headers('stripe-signature') sig: string) {
    if (!this.stripe) return res.status(500).send('Stripe not configured');

    let event: Stripe.Event;

    try {
      // In NestJS, getting the raw body for Stripe is a common challenge.
      // We assume the middleware is configured to provide req.rawBody
      const payload = req.rawBody || req.body;
      event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        config.stripe.webhookSecret!
      );
    } catch (err: any) {
      logger.error(`[Stripe Webhook] Verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    logger.info(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          const orgId = invoice.metadata?.organizationId;
          if (orgId) {
            await this.salesService.recordCommission(orgId, invoice.amount_paid, invoice.id);
          }
          break;
        case 'customer.subscription.deleted':
          // Handle downgrade/cancellation logic
          break;
      }
    } catch (e: any) {
      logger.error(`[Stripe Webhook] Error processing event ${event.type}: ${e.message}`);
    }

    res.json({ received: true });
  }
}
