# ADR 021: Admin Domain Strategy (Platform & Tenant)

## Status
Proposed

## Date
2026-02-04 (Merged)

## Context
Administrative oversight is required at two levels: the Platform level (SuperAdmin) and the Organization level (Tenant Admin). While their scopes differ, they share core logic for management, dashboards, and role assignment.

## Decision
We will unify these under a single **Admin Domain**, utilizing Row-Level Security (RLS) and Role-Based Access Control (RBAC) to differentiate permissions.

### 1. Platform Oversight (SuperAdmin)
- **Scope:** Global (All Organizations/Locations).
- **Responsibilities:** Tenant lifecycle (onboarding/suspension), global analytics, system-wide audit logs, and support shadowing.
- **Bypass:** SuperAdmins utilize a "Service Role" to bypass RLS for cross-tenant reporting.

### 2. Business Management (Tenant Admin)
- **Scope:** Organization-specific.
- **Responsibilities:** Managing organization settings, branding (brandmarks/css), location configuration, and staff onboarding.
- **Enforcement:** Strictly constrained by RLS to the active `organizationId`.

### 3. Shared Capabilities
- **Branding Hub:** Management of logos, colors, and design tokens that propagate to all tenant apps.
- **Team Manager:** Scoped interface for user management and role assignment.
- **Analytics Engine:** Visual dashboards for monitoring performance (growth for platform, profitability for tenants).

## Consequences
- **Positive:** DRY logic for management views; unified branding hub; simplified API structure.
- **Negative:** Increased complexity in the UI to handle the visual "Admin-only" theme vs "Tenant" theme.
