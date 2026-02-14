# ADR 053: Sales Attribution and Commission Engine

## Status

Proposed

## Context

As `@sous` grows, a professional sales force is required to scale restaurant acquisition. We need a system that incentivizes salesmen via recurring commissions while ensuring they have the tools to support their clients.

## Decision

We will implement a multi-tiered administrative hierarchy with a dedicated **Salesman Role** and an automated **Commission Ledger**.

### 1. The Salesman Role

A new role, `salesman`, will be added to the IAM domain.

- **Hierarchy**: SuperAdmin > Salesman > TenantAdmin.
- **Management**: Only SuperAdmins can manage Salesmen.
- **Permissions**: Salesmen have view/edit permissions for any Organization attributed to them (via `attributedSalesmanId`). They can perform "Support Impersonation" to assist clients.

### 2. Attribution Logic

- **Link-Based**: Salesmen receive unique referral codes/links.
- **Invite-Based**: Admin-sent invitations can carry a `salesmanId` payload.
- **Inheritance**: Attribution is permanent at the `Organization` level unless manually moved by a SuperAdmin.

### 3. Commission Engine

- **Model**: Hybrid recurring (e.g., 10% RevShare) + One-time Bounty.
- **Calculation**: Commission entries are generated automatically whenever a customer's `billing_subscription` successfully processes a payment event.
- **Ledger**: A dedicated `sales_commissions` table will act as the source of truth for payouts.

## Consequences

- **Pros**:
  - Scalable growth via partnerships.
  - Automated financial transparency for salesmen.
  - Simplified customer support (Salesman as the first line of defense).
- **Cons**:
  - Increased IAM complexity (cross-tenant access for salesmen).
  - Requires careful auditing of plan overrides to prevent commission manipulation.
