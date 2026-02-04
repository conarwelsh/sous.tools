# ADR 022: Tenant Admin Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
While the `SuperAdmin` domain (ADR 021) provides platform-wide oversight, restaurant owners and managers require a dedicated **Tenant Admin** domain to manage their specific organization and its multiple locations. This domain is the "Command Center" for a tenant's business operations.

**Key Requirements:**
- **Organization Management:** Managing organization-level settings, branding (colors/logos), and global preferences.
- **Location Management:** Creating and configuring specific restaurant locations.
- **Team Management:** Scoped User management (adding/removing staff, assigning roles like `admin` or `user` within the organization).
- **Business Analytics:** Dashboard displaying metrics scoped to their organization (e.g., total sales across locations, ingredient cost trends, staff performance).
- **Access Control:** Managing permissions and role-based access for their staff.

## Decision
We will establish the **Admin Domain** to handle tenant-level administrative operations and business intelligence.

### Domain Responsibilities & Logic

1. **Organization & Location Lifecycle**

    - Managing the details of the `Organization` entity.

    - **Branding Management:** Centralized hub for uploading and managing Organization Brandmarks, Lettermarks, and Wordmarks.

    - **Global Style Overrides:** Ability to upload custom CSS and define theme variables (colors, fonts, spacing) that propagate across all tenant-facing applications.

    - Handling the creation and configuration of `Location` entities.



2.  **Tenant-Scoped IAM**
    - Managing users who belong to the organization.
    - Assigning and revoking roles within the organization's boundary.

3.  **Tenant Dashboard & Reporting**
    - Aggregating data from `Recipes`, `Invoices`, `Hardware`, and `POS` domains, but strictly filtered by the current `organizationId`.
    - Providing actionable insights specifically for the restaurant owner (e.g., "Location B's food cost is 5% higher than Location A").

4.  **Configuration Management**
    - Managing tenant-specific overrides for system behavior.
    - Setting up organization-wide defaults for `Catalog` and `Ingredients` domains.

### Implementation Details
- **Security:** This domain is restricted to users with the `admin` role (or `superadmin` when shadowing).
- **Tenancy:** Strictly adheres to Row-Level Security (RLS) to ensure no data from other organizations is visible.
- **UI:** Integrated into the primary `@sous/web` and `@sous/native` apps as a "Management" or "Settings" section.

## Consequences
- **Positive:**
    - **Empowerment:** Gives restaurant owners full control over their digital and physical infrastructure.
    - **Data-Driven Decisions:** Provides high-level business intelligence without exposing platform-level complexity.
    - **Scalability:** Easily supports multi-unit operators with centralized management for all their locations.
- **Negative:**
    - **Complexity in Aggregation:** Calculating organization-wide metrics across multiple locations and domains requires efficient query design to maintain performance.
    - **Role Nuance:** Differentiating between "Organization Admin" and "Location Manager" roles may require further refinement of the IAM structure.

## Research & Implementation Plan

### Research
- **White-Labeling:** Researched CSS variable-based theming for supporting multi-tenant branding.

### Implementation Plan
1. **Management Dashboard:** Build the tenant-facing administration interface.
2. **Branding Hub:** Implement tools for uploading and managing organization logos and colors.
3. **Team Manager:** Build the interface for staff onboarding and role assignment.
4. **Analytics Hub:** Implement organization-specific reporting and insights.
