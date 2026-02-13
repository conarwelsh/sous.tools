# The Sous Master Plan

This document serves as the "Source of Truth" for the gap between our current codebase and the architectural vision defined in the ADRs/Specs.

## 🔴 Critical Gaps (Priority 1)

### 1. Infrastructure & Config
- [ ] **Refactor `@sous/config` (ADR 057)**: Remove async logic. Implement `sous env exec`.
- [ ] **Database Scalability (Spec 035)**: Update `DatabaseService` to support `reader`/`writer` separation.
- [ ] **Observability (Spec 033)**: Replace `pino-pretty` with OpenTelemetry + HyperDX integration.
- [ ] **Asset Forge (Spec 031)**: Implement `sous quality forge` to replace `generate-splash.ts`.

### 2. Authorization Engine (ADR 048)
- [ ] **Unified Scopes**: Implement `EffectiveScopes` calculation in `AuthService`.
- [ ] **Universal Guard**: Create `ScopesGuard` that checks `(Role U Plan) ∩ Token`.
- [ ] **OAuth2 Provider (Spec 037)**: Build the `/oauth` endpoints and Developer Portal.

### 3. POS Financial Engine (Spec 027)
- [ ] **Ledger Schema**: Add `pos_ledgers` and `financial_transactions` tables to `pos.schema.ts`.
- [ ] **Idempotency**: Implement `IdempotencyGuard` using Redis for all financial mutations.
- [ ] **Offline Sync**: Create the local-first "Store and Forward" logic in `@sous/client-sdk`.

### 4. Payment & Billing (Spec 026)
- [ ] **Domain Scaffold**: Create `apps/api/src/domains/billing/`.
- [ ] **Driver Engine**: Implement `IPaymentDriver` and `StripeDriver`.
- [ ] **Onboarding**: Link `RegisterForm` to the new Billing flow (Checkout -> Activation).

## 🟡 Feature Gaps (Priority 2)

### 5. Salesman System (Spec 030)
- [ ] **Domain Scaffold**: Create `apps/api/src/domains/sales/`.
- [ ] **Schema**: Add `sales_commissions` and update `users` with `salesman` role.
- [ ] **Portal**: Build the `/sales` dashboard in `@sous/web`.

### 6. Smart Seeding (Spec 032)
- [ ] **Refactor**: Break `SeederService` into `[domain].seed.ts` files.
- [ ] **Dependency Chain**: Update `MaintenanceModule` to execute seeders in hierarchical order.
- [ ] **External Sync**: Implement `seedExternal` in `CulinarySeeder` to push data to Square Sandbox.

### 7. Edge Node (Spec 036)
- [ ] **Discovery**: Add `mdns` broadcasting to the API start sequence.
- [ ] **Local Auth**: Implement salted hash caching for offline login.
- [ ] **Local Mode**: Create the "Offline Switch" in the client SDK that prioritizes local IPs.

## 🟢 Refactoring & Polish (Priority 3)

### 8. Codebase Cleanup
- [ ] **Naming Standardization**: Rename "Item" to "Product" in all POS integrations (ADR 051).
- [ ] **Type Hardening**: Audit and remove `any` types from `client.get()` and `client.post()` calls.
- [ ] **Design System Audit**: Ensure all UI components use semantic tokens (no `bg-blue-500`).
- [ ] **Loading Mandate**: Add missing `loading.tsx` files to all route groups (Mandate 25).

## 🗓️ Weekend Workflow (Checklist)

1.  **Phase A (Infrastructure)**:
    - [ ] Run `pnpm sous env exec -- pnpm build` to test the injection concept.
    - [ ] Split `DatabaseService` into reader/writer.
2.  **Phase B (Financial Foundation)**:
    - [ ] Update `pos.schema.ts` with the Ledger tables.
    - [ ] Create `BillingModule` scaffold.
3.  **Phase C (Identity & Access)**:
    - [ ] Refactor `AuthService` to calculate effective scopes on login.
    - [ ] Add `salesman` role to database.
4.  **Phase D (Quality)**:
    - [ ] Initialize the Asset Forge.
    - [ ] Start decentralizing the seed files.

## 🤖 GitHub Automation Status
- [x] **Issue Triage**: Configured to analyze new and reopened issues.
- [x] **Command Agent**: Responds to `@gemini` mentions with code fixes or research.
- [x] **PR Review**: Automatically reviews diffs and provides feedback.
- [ ] **Branch Cleanup**: (Recommended) Enable "Automatically delete head branches" in GitHub Repo Settings.
