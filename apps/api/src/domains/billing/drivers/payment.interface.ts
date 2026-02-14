export interface SubscriptionResult {
  externalSubscriptionId: string;
  externalCustomerId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd: Date;
}

export interface PaymentIntentResult {
  externalId: string;
  clientSecret?: string;
  status: string;
}

export interface IPaymentDriver {
  name: string;
  createCustomer(org: { name: string; id: string }): Promise<string>;
  createSubscription(customerId: string, planSlug: string): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  createPaymentIntent(amount: number, metadata: any): Promise<PaymentIntentResult>;
}
