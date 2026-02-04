# ADR 021: SuperAdmin Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
As a multi-tenant platform (`sous.tools`), we require a dedicated domain for platform-level administration. Internal staff (SuperAdmins) need tools to oversee the entire ecosystem, manage the lifecycle of tenants, and monitor the health and growth of the platform.

**Key Requirements:**
- **Tenant Management:** Ability to create, suspend, and manage organizations (tenants).
- **User Oversight:** Global view of all users across all tenants, with support capabilities (e.g., password resets, role management).
- **Platform Analytics:** A dashboard displaying key metrics (active users, tenant growth, hardware node status, API usage).
- **Billing Integration:** Oversight of tenant subscription status and usage-based billing metrics.
- **Support Tools:** Ability to impersonate or "shadow" a tenant for troubleshooting purposes (with strict audit logging).

## Decision
We will establish the **SuperAdmin Domain** as the administrative control plane for the platform.

### Domain Responsibilities & Logic

1.  **Tenant Control Plane**
    - Managing the `Organization` and `Location` entities at a platform level.
    - Handling tenant onboarding and offboarding workflows.

2.  **Global Identity Management**
    - Bridging with the `IAM` domain (ADR 009) to provide platform-wide user management.
    - Managing the `superadmin` role and permissions.

3.  **Platform Dashboard**
    - Aggregating data from across all domains (`Hardware`, `Recipes`, `Invoices`, `Ingredients`) to provide high-level business intelligence.
    - Monitoring infrastructure health and cost (staying within Free Tier limits).

4.  **Audit & Compliance**
    - Maintaining a global audit log of all administrative actions.
    - Ensuring strict data isolation is maintained even during support interventions.

### Implementation Details
- **Access Control:** This domain is strictly restricted to users with the `superadmin` role.
- **UI:** The SuperAdmin interface will be a specialized section within `@sous/web`, utilizing the same `@sous/ui` components but with an "Admin-only" visual theme.
- **Infrastructure:** Leverages the same Drizzle ORM and NestJS structure, but often executes queries that bypass tenant-level RLS filters (using a specialized "Service Role").

## Consequences
- **Positive:**
    - **Operational Efficiency:** Streamlines support and platform management tasks.
    - **Visibility:** Provides a "God View" of the entire system to identify bottlenecks or growth opportunities.
    - **Security:** Centralizes high-privilege operations into a single, highly-audited domain.
- **Negative:**
    - **Security Risk:** The SuperAdmin domain is a high-value target; it requires the highest level of security, including mandatory Multi-Factor Authentication (MFA).
    - **Complexity:** Managing global state and cross-tenant analytics can be resource-intensive and requires careful query optimization.

## Research & Implementation Plan

### Research
- **SuperAdmin Patterns:** Analyzed administrative dashboards of multi-tenant platforms (e.g., Shopify, Stripe) to identify core requirements.
- **Tenant Isolation:** Verified Drizzle's ability to safely "bypass" RLS when using a specialized service role.

### Implementation Plan
1. **Admin UI:** Build the protected SuperAdmin section in `@sous/web`.
2. **Tenant Management:** Implement CRUD operations for Organizations and Locations.
3. **Analytics Dashboard:** Create the global monitoring dashboard using aggregated cross-tenant data.
4. **Shadow Mode:** Build the secure impersonation tool with comprehensive audit logging.
