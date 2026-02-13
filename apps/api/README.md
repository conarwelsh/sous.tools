# @sous/api

The core intelligence and data gateway for the `sous.tools` platform.

## Responsibilities

- **Data Persistence**: Manages the PostgreSQL database using Drizzle ORM.
- **API Protocols**: Provides REST (standard), GraphQL (complex), and WebSockets (real-time).
- **Domain Logic**: Implements business rules for Recipes, Invoices, Inventory, etc.
- **Tenancy**: Enforces strict organization-level isolation.

## Functionality List

- [x] Multi-tenant data isolation (RLS).
- [x] Hybrid API (REST + GraphQL + WebSockets).
- [x] Robust Authentication & IAM (JWT, RBAC, OAuth2: Google, GitHub, Facebook).
- [x] User Invitation System with token-based joining.
- [x] Account Recovery (Password Reset) with secure tokens.
- [x] AI-powered recipe and invoice extraction (Schema & Logic).
- [x] Real-time Menuboard/Signage synchronization.
- [x] Asynchronous background job processing (BullMQ).
- [x] Financial Ledger & P&L generation.
- [x] Stock Ledger & Depletion logic.

## Installation & Setup

1. Ensure the root `@sous/config` is configured with a valid `DATABASE_URL`.
2. Run `pnpm install` from the root.
3. Build the package: `pnpm --filter @sous/api build`.

## Development

- **Start**: `pnpm run dev` (Port 4000)
- **Database**: Migrations are managed via `drizzle-kit`.

## Tech Stack

- NestJS
- Drizzle ORM
- PostgreSQL
- TypeScript
- Socket.io

## Related ADRs

- [ADR 010: Backend API Architecture](../../.gemini/docs/ADRs/010-backend-api-strategy.md)
- [ADR 005: Platform Domains & Tenancy](../../.gemini/docs/ADRs/005-platform-domains-and-tenancy.md)
