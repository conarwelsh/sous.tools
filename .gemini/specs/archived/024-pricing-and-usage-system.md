# Spec 024: Pricing and Usage System

## Objective

Implement a robust, multi-tenant pricing and feature management system using Scope-Based Access Control (SBAC). The system will support hierarchical plans, granular feature toggles, numerical usage limits (e.g., max 50 recipes), and subscription grace periods.

## 1. Shared Constants & Enums

To avoid magic strings, all scopes and plan identifiers will be defined in a centralized location (likely `@sous/features/constants`).

### `PlanType` (Enum)

- `COMMIS`: Entry-level.
- `CHEF_DE_PARTIE`: Standard.
- `EXECUTIVE_CHEF`: Premium.
- `CUSTOM`: Bespoke configurations.

### `FeatureScope` (Enum/Constants)

- `PROCURE_INVOICE_CREATE`
- `PROCURE_INVOICE_VIEW`
- `CULINARY_RECIPE_AI_PARSE`
- `INTEL_ANALYTICS_VIEW`
- ... (and so on)

## 2. Database Schema (Drizzle)

### `plans` Table

- `id`: uuid (PK)
- `name`: varchar
- `slug`: varchar (e.g., 'commis')
- `baseScopes`: jsonb (Array of FeatureScope)
- `limits`: jsonb (Object mapping MetricKey to value, e.g., `{ "max_recipes": 50 }`)

### `organizations` Updates

- `planId`: uuid (FK to plans)
- `planStatus`: enum ('ACTIVE', 'GRACE_PERIOD', 'SUSPENDED', 'EXPIRED')
- `gracePeriodEndsAt`: timestamp
- `scopeOverrides`: jsonb (Array of scopes to add/remove)
- `limitOverrides`: jsonb (Object to override plan limits)

### `usage_metrics` Table (Tracking)

- `organizationId`: uuid
- `metricKey`: varchar (e.g., 'recipe_count')
- `currentCount`: integer
- `lastResetAt`: timestamp

## 3. Caching Strategy

To ensure high performance, "Effective Scopes" and "Current Limits" for an organization will be cached in Redis.

- **Cache Key**: `org:{orgId}:access`
- **Payload**: `{ scopes: string[], limits: Record<string, number>, status: string }`
- **Invalidation**: On organization plan update or manual scope override.

## 4. API Logic (NestJS)

### `ScopesGuard`

- Extracts user's `organizationId` from JWT.
- Retrieves effective scopes from cache/DB.
- Verifies if the required scope exists for the endpoint.

### `UsageGuard`

- Decorator: `@CheckUsage('metric_key')`
- Logic: Checks if `currentCount` < `limit`.
- Throws `403 Forbidden` with a specialized "Limit Exceeded" payload if the check fails.

## 5. Web Implementation (@sous/features)

### `useScopes` Hook

Returns `hasScope(scope: FeatureScope): boolean` and `getLimit(key: string): number`.

### `<Feature>` Component

```tsx
<Feature
  scope={FeatureScope.INTEL_ANALYTICS_VIEW}
  fallback={<UpgradePrompt plan={PlanType.EXECUTIVE_CHEF} />}
>
  <AdvancedAnalyticsChart />
</Feature>
```

## 6. SuperAdmin Management Interface (@sous/web)

A dedicated management section located at `/admin/billing` will be implemented for platform-wide plan orchestration.

### Plan Editor

- **Global Tiers**: UI to create and edit the three standard tiers (Commis, Chef de Partie, Executive Chef).
- **Scope Selector**: A visual multi-select list for assigning `FeatureScope` constants to plans.
- **Limit Configurator**: Form to define numerical `limits` (e.g., max recipes, max users) per plan.

### Organization Plan Manager

- **Bespoke Overrides**: Interface to select a specific organization and apply `scopeOverrides` or `limitOverrides`.
- **Custom Plan Generator**: Ability to convert an organization to a `CUSTOM` plan type with a unique set of features not tied to standard tiers.
- **Status Override**: Manual control over an organization's `planStatus` and `gracePeriodEndsAt`.

## 7. Organization Settings UI (@sous/web)

Updates to the organization settings at `/settings/billing` for tenant-level management.

### Subscription Overview

- **Current Plan**: Visual card showing the active tier and status (Active, Grace Period, etc.).
- **Upgrade Path**: Comparison table of plans with "Upgrade" buttons.
- **Grace Period Alert**: Prominent banner for organizations in the grace period with a countdown to expiration.

### Usage Dashboard

- **Metric Visualizers**: Progress bars showing current usage vs. limits (e.g., "Recipes: 42 / 50").
- **Limit Warnings**: Warning indicators when a metric reaches 80% and 100% of its limit.

## 8. Grace Period Logic

- When a subscription payment fails, `planStatus` changes to `GRACE_PERIOD`.
- `gracePeriodEndsAt` is set (e.g., +7 days).
- System continues to allow access but displays a non-blocking "Payment Required" banner.
- After expiration, `planStatus` becomes `EXPIRED`, and all non-core scopes are revoked.

## 9. Implementation Roadmap

1. **Phase 1**: Define Enums and update DB Schema.
2. **Phase 2**: Implement `PlanService` (Effective Scope resolution) and Caching.
3. **Phase 3**: Create `ScopesGuard` and `UsageGuard` in API.
4. **Phase 4**: Implement `useScopes` and `<Feature>` in Web.
5. **Phase 5**: Build SuperAdmin Plan Editor and Organization Overrides.
6. **Phase 6**: Build Organization Billing Settings and Usage Visualizers.
7. **Phase 7**: Add automated background tasks for grace period checking.
