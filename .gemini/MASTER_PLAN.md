# The Sous Master Plan

This document serves as the "Source of Truth" for the gap between our current codebase and the architectural vision defined in the ADRs/Specs.

## 🔴 Critical Gaps (Priority 1)

### 1. Infrastructure & Config
- [ ] **Refactor `@sous/config` (ADR 057)**: Remove async logic. Implement `sous env exec`.
- [ ] **Database Scalability (Spec 035)**: Update `DatabaseService` to support `reader`/`writer` separation.
- [ ] **Observability (Spec 033)**: Replace `pino-pretty` with OpenTelemetry + HyperDX integration.

### 2. Authorization Engine (ADR 048)
- [ ] **Unified Scopes**: Implement `EffectiveScopes` calculation in `AuthService`.
- [ ] **Universal Guard**: Create `ScopesGuard` that checks `(Role U Plan) ∩ Token`.
- [ ] **OAuth2 Provider (Spec 037)**: Build the `/oauth` endpoints and Developer Portal.

### 3. POS Financial Engine (Spec 027)
- [ ] **Ledger Schema**: Add `pos_ledgers` and `financial_transactions` tables to `pos.schema.ts`.
- [ ] **Idempotency**: Implement `IdempotencyGuard` using Redis.
- [ ] **Offline Sync**: Create the local-first "Store and Forward" logic in `@sous/client-sdk`.

### 3. Payment & Billing (Spec 026)
- [ ] **Domain Scaffold**: Create `apps/api/src/domains/billing/`.
- [ ] **Driver Engine**: Implement `IPaymentDriver` and `StripeDriver`.
- [ ] **Onboarding**: Link `RegisterForm` to the new Billing flow.

## 🟡 Feature Gaps (Priority 2)

### 4. Salesman System (Spec 030)
- [ ] **Domain Scaffold**: Create `apps/api/src/domains/sales/`.
- [ ] **Schema**: Add `sales_commissions` and update `users` with `salesman` role.
- [ ] **Portal**: Build the `/sales` dashboard in `@sous/web`.

### 5. Smart Seeding (Spec 032)
- [ ] **Refactor**: Break `SeederService` into `[domain].seed.ts` files.
- [ ] **External Sync**: Implement `seedExternal` in `CulinarySeeder` to push data to Square Sandbox.

### 6. Edge Node (Spec 036)
- [ ] **Discovery**: Add `mdns` broadcasting to the API start sequence.
- [ ] **Local Mode**: Create the "Offline Switch" in the client SDK that prioritizes local IPs.

## 🟢 Refactoring & Polish (Priority 3)

### 7. Codebase Cleanup
- [ ] **Asset Forge (Spec 031)**: Implement `sous quality forge` to replace `generate-splash.ts`.
- [ ] **Naming Standardization**: Rename "Item" to "Product" in all POS integrations (ADR 051).
- [ ] **Linting**: Add rule to enforce `organization_id` on all Drizzle tables.

## 🔢 Next Steps Checklist

1.  **Fix Config**: We cannot scale if the config layer is flaky. **(Start Here)**
2.  **Harden POS**: The financial data structure is currently too weak for production.
3.  **Implement Billing**: We need to be able to take money.
4.  **Refactor Seeding**: Essential for developer velocity and testing the new domains.
