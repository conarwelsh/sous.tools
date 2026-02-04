# ADR 009: Security, Authentication, and Authorization Strategy

## Status
Proposed

## Date
2026-02-03

## Context
As a multi-tenant SaaS platform (`sous.tools`), we must ensure strict data isolation and robust identity management.
- **Tenancy:** Data leakage between organizations is a critical risk.
- **Access Control:** We need a flexible system to handle different user roles and API-level access.
- **Unified Identity:** A user logged into `@sous/web` should have their session handled consistently across all platform apps, with centralized termination.
- **Multi-Protocol:** Authentication must work seamlessly across REST, GraphQL, and WebSockets.

## Decision

### 1. Multi-Tenant Isolation (RLS)
We will implement **Row-Level Security (RLS)** at the database level (Supabase/PostgreSQL).
- Every table containing tenant-specific data will include an `organization_id`.
- Database policies will be configured to ensure that a database user (or a scoped session) can only access rows matching their `organization_id`.
- The `@sous/api` will act as the gatekeeper, using **Drizzle ORM** to execute scoped queries and manage tenant-specific session context within the database connection.
- **Enforcement:** Drizzle's relational queries and middleware will be used to ensure `organization_id` is consistently applied.

### 2. Identity & Access Management (IAM)
- **Roles:** We will start with three hierarchical roles:
  - `user`: Standard access to location-specific data.
  - `admin`: Full access to organization-wide data and settings.
  - `superadmin`: Platform-level access (for `sous.tools` internal staff).
- **RBAC:** Every API endpoint and frontend route will be protected by a Role-Based Access Control guard.

### 3. Authentication Mechanisms
- **Web/Mobile (JWT):** We will use JSON Web Tokens (JWT) for stateless authentication.
  - Access Tokens: Short-lived.
  - Refresh Tokens: Long-lived, stored in secure, `httpOnly` cookies for web.
- **API Keys:** For CLI or external integrations, we will support API Keys which are hashed and stored in the database.
- **Cross-App Session Termination:** We will implement a "Global Logout" using a Redis-backed (Upstash/Redis Cloud) **Deny List** or **Session Store**. When a user logs out of one app, their refresh token is revoked in Redis, effectively logging them out of all platform apps upon their next token refresh.
- **Features:** "Forgot Password" (Email-based OTP/Link) and "Remember Me" (Extended Refresh Token duration) are mandatory.

### 4. Protocol-Specific Security
- **REST/GraphQL:** Standardized Authorization headers (`Bearer <JWT>`).
- **WebSockets:**
  - Initial connection (handshake) must include a valid JWT.
  - For long-running connections, the socket must be disconnected if the session is revoked in the Redis store.
- **Validation:** All inputs across all protocols must be validated via **Zod** to prevent injection and malformed data.

## Consequences
- **Positive:**
  - **Highest Isolation:** RLS provides a "belt and suspenders" approach alongside application-level checks.
  - **Consistency:** Unified login/logout experience across the entire `@sous` ecosystem.
  - **Scalability:** JWTs keep the API stateless, while Redis handles the edge case of immediate revocation.
- **Negative:**
  - **Performance:** Checking the Redis Deny List on every refresh/socket connection adds a small latency overhead.
  - **Complexity:** Managing RLS policies in PostgreSQL requires careful migration planning and testing.

## Research & Implementation Plan

### Research
- **Supabase Auth vs. Custom JWT:** Selected custom JWT for full control over session lifecycle and integration with our Redis-based revoke list.
- **PostgreSQL RLS:** Verified the performance of RLS policies with complex joins.

### Implementation Plan
1. **IAM Module:** Build the core authentication logic in `@sous/api` (Login, Register, Refresh).
2. **RLS Policies:** Write the SQL migrations to enable RLS and create the `auth.uid()` and `auth.org_id()` policies.
3. **Redis Integration:** Setup Upstash Redis and implement the token revocation check in a NestJS Guard.
4. **Guard Implementation:** Create `@Roles()` decorators and `RolesGuard` to enforce RBAC at the controller level.
