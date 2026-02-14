# Spec 026: Payment and Billing Orchestrator

## Overview
This specification details the implementation of a multi-tenant payment system that integrates with the account registration flow, supports recurring tiered subscriptions, and provides a robust API for POS terminal hardware.

## 1. Domain Architecture
A new `BillingModule` will be established in `@sous/api` to orchestrate payment events.

### 1.1 Core Components
- `BillingService`: High-level business logic (subscribing, canceling, status checks).
- `PaymentDriverFactory`: Logic to select and initialize the correct provider adapter.
- `WebhookController`: A unified entry point for external events (Stripe Webhooks, CardConnect Callbacks).
- `PaymentProcessor`: BullMQ-backed queue for async tasks like sending receipts and updating organization status.

## 2. Database Schema (Drizzle)

### `billing_plans`
- `id`: uuid (PK)
- `name`: varchar (e.g. 'Chef de Partie')
- `slug`: varchar (unique)
- `priceMonthly`: integer (cents)
- `currency`: varchar (default 'USD')
- `baseScopes`: jsonb (Effective feature set)

### `billing_subscriptions`
- `id`: uuid (PK)
- `organizationId`: uuid (FK to organizations)
- `provider`: enum ('stripe', 'cardconnect', 'custom')
- `externalCustomerId`: varchar
- `externalSubscriptionId`: varchar
- `status`: enum ('active', 'past_due', 'canceled', 'trialing')
- `currentPeriodEnd`: timestamp

## 3. The Driver Interface (`IPaymentDriver`)
```typescript
interface IPaymentDriver {
  name: string;
  
  // Recurring Subscriptions
  createCustomer(org: Organization): Promise<string>;
  createSubscription(customerId: string, planSlug: string): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  
  // Terminal & One-off Payments
  createPaymentIntent(amount: number, metadata: any): Promise<PaymentIntentResult>;
  capturePayment(intentId: string): Promise<void>;
  
  // Normalization
  normalizeWebhook(payload: any, signature: string): Promise<NormalizedEvent>;
}
```

## 4. Onboarding Workflow

### Phase 1: Registration
1. User submits `RegisterForm`.
2. API creates `Organization` with `planStatus: 'PENDING_PAYMENT'`.
3. API creates `User` with `role: 'admin'`.
4. Returns a temporary JWT with limited `billing:setup` scope.

### Phase 2: Checkout
1. Web UI redirects to `/settings/billing/checkout`.
2. User selects a `billing_plan`.
3. UI initializes the provider's secure element (Stripe Elements or CardConnect Bolt).
4. User submits card details; provider returns a secure token.

### Phase 3: Activation
1. Web UI calls `POST /billing/subscribe` with `planSlug` and `token`.
2. `BillingService` uses the factory to get the `IPaymentDriver`.
3. Driver calls external API to create Customer and Subscription.
4. On Success:
   - `Organization` updated to `planStatus: 'ACTIVE'`.
   - `planId` is assigned.
   - Event `billing.activated` emitted to BullMQ.

## 5. POS Terminal Integration
The `createPaymentIntent` method will be the foundation for physical hardware payments.
- **Request**: `POST /payments/terminal/intent` (amount, terminalId).
- **Response**: Client Secret or Transaction ID.
- **Mobile Action**: The POS app uses the response to trigger the local reader (via Stripe Terminal SDK or CardConnect Bolt SDK).

## 6. Notifications & Emails
The `MailService` will be expanded with the following templates:
- `SubscriptionConfirmedEmail`: Sent immediately upon activation.
- `PaymentFailedEmail`: Sent on webhook `invoice.payment_failed`.
- `RenewalReminder`: Sent 3 days before `currentPeriodEnd`.
