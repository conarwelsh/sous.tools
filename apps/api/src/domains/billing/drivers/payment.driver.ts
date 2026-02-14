export interface SubscriptionResult {
  externalSubscriptionId: string;
  externalCustomerId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd: Date;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  amount: number;
}

export interface NormalizedEvent {
  type: string;
  externalCustomerId: string;
  data: any;
}

export interface IPaymentDriver {
  name: string;

  // Recurring Subscriptions
  createCustomer(org: {
    id: string;
    name: string;
    email?: string;
  }): Promise<string>;
  createSubscription(
    customerId: string,
    planSlug: string,
    paymentMethodId: string,
  ): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;

  // Terminal & One-off Payments
  createPaymentIntent(
    amount: number,
    metadata: any,
  ): Promise<PaymentIntentResult>;
  capturePayment(intentId: string): Promise<void>;

  // Normalization
  normalizeWebhook(payload: any, signature: string): Promise<NormalizedEvent>;
}
