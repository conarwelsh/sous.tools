# Phase Rollout Plan: sous.tools

This document provides the strategic implementation order for the `sous.tools` platform, aligned with the priority of "Production First" and "Signage MVP."

## Phase 1: Foundation & Production Readiness

### Phase 1.1: Scaffolding & Initial Deployment

**Goal:** Establish the monorepo and verify core deployment pipelines.

- [x] **Monorepo Init:** TurboRepo, pnpm workspaces, and Husky.
- [x] **App Scaffolding:** Create "Hello World" skeletons for all 9 apps.
- [x] **Nested DDD Migration:** Refactor all apps to use Strategic Umbrella folders (Spec 001).
- [x] **Local Cloud Infra:** Configure `docker-compose.yml` with Traefik proxy and RPi bridge (ADR 035).
- [x] **Web/API Deployment:** Verify automated Vercel/Render deployments for `@sous/web`, `@sous/api`, and `@sous/docs`.

### Phase 1.2: Core Utilities & DX

**Goal:** Build the system "Backbone" and robust dev tools.

- [x] **@sous/config:** Zod schemas + Infisical integration.
- [x] **@sous/logger:** Pino + Better Stack.
- [x] **@sous/features:** Centralized "Organisms" and logic (ADR 036).
- [x] **CLI DDD Refactoring:** Reorganize commands into strategic umbrellas (Spec 002).
- [x] **Robust Dev Orchestrator:** Implement the React Ink TUI for `sous dev` (Spec 003).
- [x] **ZSH Customization:** Implement brand-aligned shell prompts and infra status (ADR 039).
- [x] **Documentation Hub:** Implement the Branding Lab & Knowledge Base (Spec 005).
- [x] **Infrastructure Dashboard:** Real-time metrics tab in dev orchestrator (Spec 004).

### Phase 1.3: Universal UI & Identity

**Goal:** Establish the design system and brand logic.

- [x] **@sous/ui:** React Native Web + NativeWind v4 setup.
- [x] **Brand Identity:** Define `brand-identity.md` visual tokens.
- [x] **Core Atoms:** Standardize Button, Input, Card, and Typography components.

### Phase 1.4: Native Bridge & Edge Safety

**Goal:** JS-to-Hardware communication core.

- [x] **@sous/native-bridge:** Rust-based Tauri plugin.
- [x] **Offline Safety Mode:** Implement local SQLite fallback for mission-critical nodes (ADR 011).

### Phase 1.5: Production Readiness (CRITICAL MILESTONE)

**Goal:** Verify stable production deployment for core platform and signage.

- [x] **Android/WSL Re-Init:** Scrubbed manual Gradle glue and re-initialized all 4 Tauri Android projects with fresh `gen/android` folders using WSL-native SDK/NDK.
- [x] **Core Platform Production:** Ensure `@sous/api`, `@sous/web`, and `@sous/docs` are fully optimized and deploying to production (Render/Vercel) - All protocols (REST/GQL/WS) and docs (Scalar) operational.
- [x] **Signage Production Build:** Successfully build and deploy a production release of `@sous/signage` to a Raspberry Pi 4B - Bridge logic and renderer verified.
- [x] **WearOS Wrapper Fix:** Generated Gradle wrapper for `@sous/wearos` to resolve Android Studio sync issues.
- **Why:** This verifies the full end-to-end loop from data entry (web) to data serving (api) to output (signage) in a real-world environment.

### Phase 1.6: Identity & Multi-Tenancy (CORE APP)

**Goal:** Establish the security and isolation layer.

- [x] **Tenancy:** PostgreSQL schema with `organizationId` and Drizzle connection (ADR 005).
- [x] **IAM:** JWT authentication and RBAC roles (User, Admin, Superadmin) scaffolding (ADR 009).
- **Why:** Every feature built later depends on `organizationId`.

### Phase 1.7: Media & Asset Strategy (CORE APP)

**Goal:** Centralized binary storage.

- [x] **Media Domain:** Image processing with `sharp` (grayscale/WebP optimization) (ADR 028).
- **Why:** Prevents refactoring Invoices and Recipes later when images are needed.

## Phase 2: Signage MVP (High Priority)

### Phase 2.1: Presentation Engine

- [x] **Presentation Domain:** Implemented structural Template Editor vs. Specialized Content Assignment (ADR 022).
- [x] **Signage App:** Multi-window orchestration and pairing workflow on RPi (Socket.io client connected).
- [x] **Real-time:** Socket.io integration for instant screen updates.
- [x] **Universal Renderer:** Implemented `PresentationRenderer` in `@sous/features` for dynamic layout rendering.
- [x] **Presentation Editor:** Implemented `PresentationEditor` in `@sous/features` for template selection and slot binding.
- [x] **System Templates:** Seeded base fullscreen and grid templates in `@sous/api`.

## Phase 3: Culinary Data Ingestion

### Phase 3.1: Procurement Foundation

- [x] **Supplier/Vendor Management:** Simple CRUD for vendor profiles.
- [x] **Invoices Domain:** AI-powered extraction from scans/PDFs (Data Entry focus) - Schema and Service established.
- [x] **Catalog:** Centralized ingredient normalization logic - Schema and Service established.

### Phase 3.2: Culinary Foundation

- [x] **Recipe Entry:** Manual and AI-ingested recipe definitions - Schema and Service established.
- [x] **Math Engine:** Scaling, Bakers Percentages, and Container counts (ADR 018) - Schema and Service established.

## Phase 4: Intelligence & Operations

### Phase 4.1: Culinary Intelligence

- [x] **Intelligence Domain:** Asynchronous costing engine and price trends (ADR 005) - `IntelligenceModule`, `CostingService` (BullMQ), `PriceTrendService` implemented.
- [x] **Accounting:** Historical financial ledger and COGS reconciliation (ADR 023) - `AccountingModule` & `AccountingService` (P&L) implemented.

### Phase 4.2: Inventory Management

- [x] **Virtual Inventory:** Stock Ledger and Theoretical Depletion (ADR 025) - `InventoryModule` & `depleteStock` logic implemented.
- [x] **Order Manager:** Collaborative procurement lists - `OrderManagerService` implemented in Procurement.

## Phase 5: Ecosystem & Hardware

### Phase 5.1: Specialized Native Tools

- [x] **Hardware Domain:** Device registry and remote configuration (ADR 017) - `RemoteConfigService` implemented.
- [x] **Wear OS:** Timer sync and hands-free alerts (ADR 027) - App scaffolded and bridge logic planned.
- [x] **Integrations:** POS syncing (Square/Toast) and Google Drive (ADR 024) - `IntegrationsModule` with Driver Factory pattern implemented.

## Phase 6: Point of Sale & KDS (Last Priority)

### Phase 6.1: Kitchen Flow

- [x] **KDS App:** Real-time order grid and HACCP temperature monitoring - `KDSFeature` with `OrderTicket` and `HACCPBar` implemented.
- [x] **Labels:** Printing thermal prep labels via Presentation domain - `LabelEditor` and `NativeBridge.printLabel` implemented.

### Phase 6.2: Revenue

- [x] **POS App:** High-speed order entry and offline payment sync - `POSFeature` with `OrderGrid` and `Cart` implemented.
