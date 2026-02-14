# The Sous Master Plan

This document serves as the "Source of Truth" for the gap between our current codebase and the architectural vision defined in the ADRs/Specs.

## 🔴 Critical Gaps (Priority 1)

### 1. Infrastructure & Config
- [x] **Refactor `@sous/config` (ADR 057)**: Remove async logic. Implement `sous env exec`.
- [x] **Database Scalability (Spec 035)**: Update `DatabaseService` to support `reader`/`writer` separation.
- [x] **Observability (Spec 033)**: Replace `pino-pretty` with OpenTelemetry + HyperDX integration.
- [x] **Asset Forge (Spec 031)**: Implement `sous quality forge` to replace `generate-splash.ts`.

### 2. Authorization Engine (ADR 048)
- [x] **Unified Scopes**: Implement `EffectiveScopes` calculation in `PlanService`.
- [x] **Universal Guard**: Create `ScopesGuard` that checks `(Role U Plan) ∩ Token`.
- [x] **OAuth2 Provider (Spec 037)**: Build the `/oauth` endpoints and Developer Portal.

### 3. POS Financial Engine (Spec 027)
- [x] **Ledger Schema**: Add `pos_ledgers` and `financial_transactions` tables to `pos.schema.ts`.
- [x] **Idempotency**: Implement `IdempotencyInterceptor` using Redis.
- [x] **Offline Sync**: Create the local-first "Store and Forward" logic in `@sous/client-sdk`.

### 4. Payment & Billing (Spec 026)
- [x] **Domain Scaffold**: Create `apps/api/src/domains/billing/`.
- [x] **Driver Engine**: Implement `IPaymentDriver` and `StripeDriver`.
- [x] **Onboarding**: Link `RegisterForm` to the new Billing flow and `/checkout`.

## 🟡 Feature Gaps (Priority 2)

### 3.5 Support & Feedback (Spec 022)
- [x] **API Domain**: Create `apps/api/src/domains/support/`.
- [x] **Integrations**: Connect to GitHub Octokit and Resend.
- [x] **UI/UX**: Implement `SupportForm`, `FeedbackModal` and SuperAdmin settings.
- [x] **CLI Command**: Implement `sous feedback`.

### 4. Salesman System (Spec 030)
- [x] **Domain Scaffold**: Create `apps/api/src/domains/sales/`.
- [x] **Schema**: Add `sales_commissions` and update `users` with `salesman` role.
- [x] **Portal**: Build the `/sales` dashboard in `@sous/web` with support access.

### 5. Smart Seeding (Spec 032)
- [x] **Refactor**: Break `SeederService` into `[domain].seed.ts` files.
- [x] **External Sync**: Implement `seedExternal` in `CulinarySeeder` to push data to Square Sandbox.

### 6. Edge Node (Spec 036)
- [x] **Discovery**: Add `mdns` broadcasting to the API start sequence.
- [x] **Local Mode**: Create the "Offline Switch" in the client SDK that prioritizes local IPs.

## 🟢 Refactoring & Polish (Priority 3)

### 7. Codebase Cleanup
- [x] **Naming Standardization**: Rename "Item" to "Product" in all POS integrations (ADR 051).
- [x] **Type Hardening**: Audit and remove `any` types from `client.get()` and `client.post()` calls.
- [x] **Design System Audit**: Ensure all UI components use semantic tokens (no `bg-blue-500`).
- [x] **Loading Mandate**: Add missing `loading.tsx` files to all route groups (Mandate 25).

## 🔢 Next Steps Checklist

1.  **Standardize POS Names**: Transition from "Item" to "Product" globally. (COMPLETED)
2.  **Linting Guardrails**: Ensure multi-tenancy is enforced at the lint level.
3.  **Production Hardening**: Stress test the Offline Sync and Edge Discovery in real-world scenarios.

## 🤖 GitHub Automation Status
- [x] **Issue Triage**: Configured to analyze new and reopened issues.
- [x] **Command Agent**: Responds to `@gemini` mentions with code fixes or research.
- [x] **PR Review**: Automatically reviews diffs and provides feedback.
- [ ] **Branch Cleanup**: (Recommended) Enable "Automatically delete head branches" in GitHub Repo Settings.
