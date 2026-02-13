# ADR 048: Unified Authorization & Scoping Strategy

## Status

Accepted (Refined Feb 13, 2026)

## Context

The Sous platform needs to support tiered pricing plans, internal role-based access (RBAC), and future 3rd-party developer access (OAuth2).
Checking for specific roles (`if admin`) or plans (`if executive`) in code is brittle and fails to handle the intersection of these vectors (e.g., an Admin on a Basic plan, or a 3rd-party app acting on behalf of a User).

## Decision

We will adopt a **Pure Capability-Based Authorization** model using Scope-Based Access Control (SBAC).

### 1. The "Scope" as the Atom
Authorization checks will **ONLY** ever validate against a Scope string (e.g., `culinary:recipes:create`, `pos:orders:read`).
- **Granular Scopes**: Features will be identified by unique, namespaced strings defined in a shared `FeatureScope` enum.

### 2. Forbidden: Magic Checks
Code must **NEVER** check `user.role === 'admin'` or `org.plan === 'pro'` to determine feature access.
- **Bad**: `<if plan="executive">`
- **Good**: `<if scope="analytics:advanced">`

### 3. The Intersection Rule
To determine if a request is authorized, the system calculates `EffectiveScopes` by intersecting the user's entitlements with the access method's permissions.

`EffectiveScopes = (RolePermissions ∪ PlanPermissions) ∩ TokenDelegations`

- **RolePermissions**: What the user's role (Admin/Member) allows.
- **PlanPermissions**: What the organization's billing plan allows (including Custom plans).
- **TokenDelegations**:
    - For **Standard Login**: Effectively `*` (All).
    - For **3rd Party OAuth**: The specific subset of scopes granted by the user to the external app.

### 4. Database Schema
- **`plans` table**: Defines standard tiers with a name, slug, and a JSONB array of `baseScopes`.
- **`organizations` table**: Added `planId` (foreign key) and `scopeOverrides` (JSONB array for custom additions/removals).

### 5. Enforcement
- **API**: A `@RequiredScopes(...scopes: string[])` decorator and a corresponding `ScopesGuard`.
- **Frontend**: A `useScopes()` hook and a `<Feature scope="...">` component in `@sous/features`.

## Consequences

- **Pros**: 
    - **Universal**: Internal users and 3rd-party apps are treated identically by the authorization engine.
    - **Decoupled**: Business pricing logic is separated from code.
    - **Flexible**: "Custom Plans" are natively supported by simply adjusting the `scopeOverrides` JSON.
- **Cons**: 
    - Requires maintaining a comprehensive "Scope Registry" to avoid typos.
    - Initial effort to map every existing feature to a scope.

## Implementation Details

### API Adjustments
- Update `AuthService` to calculate `EffectiveScopes` during token generation.
- Implement `ScopesGuard` to check the JWT payload for the required scopes.

### Web Adjustments
- Update `AuthContext` to store the calculated scope list.
- Update navigation and UI components to conditionally render based on `hasScope()`.
