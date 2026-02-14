# Spec 030: Salesman Portal and Attribution System

## Overview

This specification details the tools and infrastructure required for the `@sous` sales force to onboard customers, track performance, and manage commissions.

## 1. Domain Expansion (IAM)

### 1.1 Role Hierarchy

Add `salesman` to the `roleEnum` in the `iam` domain.

### 1.2 Schema Updates

- **`organizations`**: Add `attributedSalesmanId` (FK to users) and `commissionBps` (integer).
- **`invitations`**: Add `salesmanId` (Optional UUID).
- **`sales_commissions`**: New table to track line-item payouts per organization payment.

## 2. Salesman Portal (@sous/web)

A dedicated area for salesmen to manage their business book.

### 2.1 Dashboard

- **Metrics**: Monthly Recurring Revenue (MRR) attributed, pending commissions, conversion rate.
- **Leads**: A simple CRM view to track potential kitchens before they register.

### 2.2 Customer Management

- **Book of Business**: Searchable list of attributed organizations.
- **Action - Plan Override**: Salesmen can change a customer's plan or apply a discount code (limited by their own scope).
- **Action - Support Access**: One-click login into the customer's dashboard for training and troubleshooting.

## 3. Workflow: Onboarding with Attribution

### 3.1 Invitation Flow

1. Salesman logs into the portal and clicks "Invite Kitchen".
2. System creates an invitation with `salesmanId` attached.
3. Customer receives an email from "Salesman Name via Sous".
4. Registration captures the `salesmanId` and sets it on the new `Organization`.

### 3.2 Referral Flow

1. Salesman shares a link: `https://sous.tools/register?ref=CHEF123`.
2. The `RegisterForm` detects the `ref` code and resolves the Salesman ID before submitting the creation request.

## 4. Commission Calculation Logic

A background job (`CommissionWorker`) runs every hour:

1. Scans for new successful `billing_subscriptions` payments.
2. Identifies the attributed Salesman and their specific rate (BPS).
3. Creates a record in `sales_commissions` with `amount = payment.amount * (rate / 10000)`.
4. Notifies the Salesman via push/email: "You just earned $XX.XX from Kitchen Name!"
