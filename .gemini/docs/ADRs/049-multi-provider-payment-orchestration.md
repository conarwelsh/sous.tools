# ADR 049: Multi-Provider Payment Orchestration

## Status
Proposed

## Context
The Sous platform requires a monetization strategy that supports tiered recurring subscriptions and high-speed POS terminal payments. To maximize market reach and flexibility, the system must not be locked into a single provider (like Stripe). It needs to accommodate:
1. **Default Providers**: Stripe for ease of use and developer experience.
2. **Strategic Partnerships**: CardConnect (via Bolt/REST) for specialized restaurant merchant services.
3. **Enterprise Flexibility**: "Bring Your Own Merchant" (BYOM) for customers with existing high-volume processing agreements.

## Decision
We will implement a **Provider-Agnostic Driver Pattern** for all payment and billing operations.

### 1. Unified Payment Interface (`IPaymentDriver`)
All provider-specific logic will be encapsulated in classes that implement a shared interface. This ensures the core business logic (activation, usage tracking, notifications) remains decoupled from the underlying SDKs.

### 2. Strategic Driver Implementation
- **StripeDriver**: Handling global SaaS subscriptions and WisePad terminals.
- **CardConnectDriver**: Optimized for hospitality-focused processing and Ingenico/Verifone terminals.
- **CustomDriver**: A flexible adapter that uses tenant-provided credentials.

### 3. Dynamic Driver Factory
A `PaymentDriverFactory` will initialize the appropriate driver instance based on the Organization's configuration. This allows the platform to switch a tenant's processor without modifying the core billing engine.

### 4. Delayed Activation Workflow
Registration will move to a `PENDING_PAYMENT` state. Full account activation (provisioning, data ingestion, etc.) will only trigger upon a successful `SUBSCRIPTION_CREATED` event from the active driver.

## Consequences
- **Pros**:
    - Zero vendor lock-in.
    - Ability to support diverse hardware (terminals) across different processors.
    - Competitive advantage by allowing customers to keep their existing merchant rates.
- **Cons**:
    - Increased complexity in webhook management (normalizing events from different providers).
    - Database schema must support polymorphic "External IDs".
    - Testing requires multiple sets of sandbox credentials.
