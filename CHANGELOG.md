# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Signage GraphQL Subscriptions**: Implemented backend support for real-time signage updates via GraphQL Subscriptions in `PresentationResolver` and `PresentationService`.
- **Culinary GraphQL**: Added missing `products` and `categories` queries to `CulinaryResolver`, enabling POS and Kiosk data fetching.
- **Resilient Data Parsing**: Implemented defensive JSON parsing in `PresentationService` to prevent server crashes during screen layout updates.
- Real-time GraphQL Subscriptions for KDS and POS status updates.
- Framer Motion animations for KDS ticket layout and POS category transitions.
- ADR 003: Real-time GraphQL Subscriptions.
- Descriptive JSDoc blocks for core POS and KDS logic.

### Fixed

- **API/IAM**: Fixed a critical crash in `JwtAuthGuard` caused by a broken relative import path for `HardwareAuthGuard`.
- **API/IAM**: Resolved `TypeError: context.getHandler is not a function` in `GqlAuthGuard` by providing a complete `ExecutionContext` mock to the base class, ensuring compatibility with GraphQL requests and decorator-based logic.

### Changed

- **CLI/Dev Tools:** Updated `ecosystem.config.js` to include all native app targets (POS, KDS, Signage, Kiosk, Tools) with correct emulator mappings.
- **Native Experience:** Renamed `POS_Android` to just `POS` for a cleaner UI.
- **Infrastructure Stabilization:** Decommissioned the deprecated Windows Agent (port 4040) in favor of direct Windows-WSL interop.
- **CLI/Scripts:** Updated `device-manager.ts` and `run-android.sh` to use absolute Windows paths and enforced a strict 60s timeout for all interop calls to prevent hangs.
- **Dashboard UI:** Added scrolling support to the service sidebar and namespace markers for native applications.
- Restored the main marketing page to the industrial design version, reverting recent layout changes.
- Standardized CLI build to pure ESM/CJS based on environment stability.
- Refactored `ecosystem.config.js` to support direct dev server execution.
- Updated project documentation and README files.

### Fixed

- **Signage Persistence**: Fixed a `TypeError` (value.toISOString is not a function) when saving signage layouts by hardening `PresentationService` to strip immutable timestamp fields before database updates.
- **API Build Stability**: Resolved syntax errors and truncated code in `PresentationResolver` that were blocking incremental compilation.
- Fixed `ReferenceError: apiUrl is not defined` in `useHardware` hook by moving declaration outside of `try` block.
- Fixed `ReferenceError: localConfig is not defined` in `DevicePairingFlow` component.
- Added missing `kiosk` device type to `device_type` enum in database and updated `DevicePairingFlow` to support `kiosk`, `gateway`, and `watch` flavors.
- Fixed `SupportService` configuration access.
- Restored `MetricsModule` to API module graph.
- Resolved PM2 crash loop caused by CLI artifact mismatches.

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
