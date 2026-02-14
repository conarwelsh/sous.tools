import {
  IPaymentDriver,
  SubscriptionResult,
  PaymentIntentResult,
} from './payment.interface.js';
import Stripe from 'stripe';
import { logger } from '@sous/logger';

export class StripeDriver implements IPaymentDriver {
  name = 'stripe';
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey);
  }

  async createCustomer(org: { name: string; id: string }): Promise<string> {
    const customer = await this.stripe.customers.create({
      name: org.name,
      metadata: { organizationId: org.id },
    });
    return customer.id;
  }

  async createSubscription(
    customerId: string,
    planSlug: string,
  ): Promise<SubscriptionResult> {
    // Map our slug to a Stripe Price ID (In prod this would be in platform settings)
    const priceMap: Record<string, string> = {
      commis: 'price_commis_id',
      'chef-de-partie': 'price_cdp_id',
      'executive-chef': 'price_exec_id',
    };

    const priceId = priceMap[planSlug] || planSlug;

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      externalSubscriptionId: subscription.id,
      externalCustomerId: customerId,
      status: this.mapStatus(subscription.status),
      currentPeriodEnd: new Date(
        (subscription as any).current_period_end * 1000,
      ),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async createPaymentIntent(
    amount: number,
    metadata: any,
  ): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata,
    });

    return {
      externalId: intent.id,
      clientSecret: intent.client_secret || undefined,
      status: intent.status,
    };
  }

  private mapStatus(stripeStatus: Stripe.Subscription.Status): any {
    switch (stripeStatus) {
      case 'active':
        return 'active';
      case 'past_due':
        return 'past_due';
      case 'canceled':
        return 'canceled';
      case 'trialing':
        return 'trialing';
      default:
        return 'active';
    }
  }
}
