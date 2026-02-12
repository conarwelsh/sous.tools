# ADR 048: Pricing Plans and Feature Scoping

## Status

Proposed

## Context

The Sous platform needs to support tiered pricing plans to monetize different feature sets. The three primary tiers are:
1.  **Commis** (Entry Level)
2.  **Chef de Partie** (Standard)
3.  **Executive Chef** (Premium)

Features should be hierarchical, meaning higher tiers include all features of lower tiers. Additionally, the system must support **Custom Plans** for enterprise or early-adopter organizations that don't fit into the standard tiers.

## Decision

We will implement a **Scope-Based Access Control (SBAC)** system where pricing plans are mapped to a collection of granular "Scopes".

### 1. Granular Scopes
Features will be identified by unique strings (e.g., `procurement:invoices`, `culinary:recipes:advanced`, `intelligence:analytics`).

### 2. Database Schema
- **`plans` table**: Defines standard tiers with a name, slug, and a JSONB array of `baseScopes`.
- **`organizations` table**: Added `planId` (foreign key) and `scopeOverrides` (JSONB array for custom additions or removals).

### 3. Hierarchical Logic
Standard plans will be defined with their specific scopes. A helper utility `getEffectiveScopes(org)` will merge the base scopes from the organization's plan with any `scopeOverrides`.

### 4. API Enforcement (NestJS)
A `@RequiredScopes(...scopes: string[])` decorator and a corresponding `ScopesGuard` will be used to protect endpoints.
```typescript
@Get('analytics')
@RequiredScopes('intelligence:analytics')
export class AnalyticsController { ... }
```

### 5. Web/Frontend Enforcement
A `useScopes()` hook and a `<Feature scope="...">` component will be provided in `@sous/features` to conditionally render UI elements.
```tsx
const { hasScope } = useScopes();
if (!hasScope('procurement:invoices')) return null;
```

## Consequences

- **Pros**: 
    - Decouples business pricing logic from code implementation.
    - High flexibility with custom plans and overrides.
    - Clear path for future "Add-on" features.
- **Cons**: 
    - Requires careful management of scope strings to avoid typos (should use a shared constant or enum).
    - Slightly increases complexity of the authentication/authorization flow.
    - Initial effort to map existing features to scopes.

## Implementation Details

### API Adjustments
- Update `organizations` schema.
- Implement `PlanService` and `ScopesGuard`.
- Integrate scope check into `JwtStrategy` validation or a dedicated middleware.

### Web Adjustments
- Update `AuthContext` to store effective scopes.
- Update navigation components to filter links based on scopes.
- Implement "Upgrade Required" placeholders for restricted features.

## Improvements & Considerations
- **Usage Limits**: Future expansion should allow plans to define numeric limits (e.g., `limit:monthly_invoices: 100`).
- **Caching**: Effective scopes should be cached in Redis to minimize DB lookups per request.
- **Grace Periods**: Implement a status field on organizations to handle subscription expiration or payment failures without immediate lockout.
