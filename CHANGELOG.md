# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-13

### Added
- **Core Architecture:**
    - Unified Web-First Monorepo structure (`@sous/web`, `@sous/api`).
    - Domain-Driven Design (DDD) backend architecture.
    - Role-Based Access Control (RBAC) with `ScopesGuard`.
- **Features:**
    - **Culinary Intelligence:** AI Recipe Ingestion (Google Drive), Real-time Costing, Smart Scaling.
    - **Procurement:** Vendor Management, Low Stock Alerts (Email), PO Generation.
    - **Inventory:** Real-time Stock Ledger, Par-level monitoring.
    - **POS:** Financial Ledger, "Item" to "Product" global standardization.
    - **Integrations:** OAuth2 Identity Provider, Square & Google Drive drivers.
    - **Hardware:** mDNS-based Zero-Config Discovery, Edge Node fallback.
    - **Commercial:** 3-tier SaaS pricing model (Commis, Chef de Partie, Executive Chef) with dynamic plans API.
- **Infrastructure:**
    - Centralized Configuration (`@sous/config`) with Zod validation.
    - Secure Secret Management via Infisical.
    - BullMQ background job processing (Emails, Ingestion, Support).
    - Standalone Drizzle Seeder (`sous db reset`).
- **Tooling:**
    - `@sous/cli` for environment and workflow orchestration.
    - E2E Testing with Playwright.
    - Docker Compose setup for Postgres & Redis.

### Changed
- **Refactor:** Removed legacy Native/Tauri bridges in favor of Capacitor.
- **Database:** Migrated to domain-specific schemas (e.g., `pos_orders`, `stock_ledger`).
- **UI:** Replaced custom styles with `@sous/ui` (Shadcn/Tailwind) design system.
- **Naming:** Global migration from "Item" to "Product" in POS and catalog domains.
- **Web:** Migrated marketing landing page to Next.js Server Components with dynamic data fetching.

### Fixed
- Resolved circular dependencies in NestJS modules.
- Fixed `SyntaxError` in CLI Asset Forge command.
- Corrected mDNS broadcast hostnames to match Spec 009.
- Fixed missing `CurrentUser` and `GqlAuthGuard` in API.
- Resolved build failures in `@sous/features` and `@sous/emails` caused by unsupported component props.
- Cleaned up duplicated project structure inside `apps/cli`.
