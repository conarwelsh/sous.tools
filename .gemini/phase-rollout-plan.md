# Phase Rollout Plan: sous.tools

This document provides the strategic implementation order for the `sous.tools` platform, aligned with the priority of "Production First" and "Signage MVP."

## Phase 1: Foundation & Production Readiness

### Phase 1.1: Scaffolding & Initial Deployment
**Goal:** Establish the monorepo and verify core deployment pipelines.
- [x] **Monorepo Init:** TurboRepo, pnpm workspaces, and Husky.
- [x] **App Scaffolding:** Create "Hello World" skeletons for all 9 apps.
- [ ] **Nested DDD Migration:** Refactor all apps to use Strategic Umbrella folders (Spec 001).
- [ ] **Local Cloud Infra:** Configure `docker-compose.yml` with mocks (ADR 035).
- [x] **Web/API Deployment:** Verify automated Vercel/Render deployments for `@sous/web`, `@sous/api`, and `@sous/docs`.

### Phase 1.2: Core Utilities & DX
**Goal:** Build the system "Backbone" and robust dev tools.
- [x] **@sous/config:** Zod schemas + Infisical integration.
- [x] **@sous/logger:** Pino + Better Stack.
- [x] **@sous/features:** Centralized "Organisms" and logic (ADR 036).
- [ ] **CLI DDD Refactoring:** Reorganize commands into strategic umbrellas (Spec 002).
- [ ] **Robust Dev Orchestrator:** Implement the React Ink TUI for `sous dev` (Spec 003).
- [ ] **Documentation Hub:** Implement the Branding Lab & Knowledge Base (Spec 005).

### Phase 1.3: Universal UI & Identity
**Goal:** Establish the design system and brand logic.
- [x] **@sous/ui:** React Native Web + NativeWind v4 setup.
- [x] **Brand Identity:** Define `brand-identity.md` visual tokens.
- [ ] **Core Atoms:** Standardize Button, Input, Card, and Typography components.

### Phase 1.4: Native Bridge & Edge Safety
**Goal:** JS-to-Hardware communication core.
- [x] **@sous/native-bridge:** Rust-based Tauri plugin.
- [ ] **Offline Safety Mode:** Implement local SQLite fallback for mission-critical nodes (ADR 011).

### Phase 1.5: Production Readiness (CRITICAL MILESTONE)
**Goal:** Verify "Hello World" deployment for the entire native suite.
- [ ] **Android/WSL Fix:** Resolve the ADB/Gradle synchronization issues for Tauri/Android (ADR 031).
- [ ] **Native Production Build:** Successfully build and deploy a release candidate for `@sous/native`.
- [ ] **Headless Production Build:** Deploy `@sous/native-headless` to a physical Raspberry Pi 4B.
- [ ] **WearOS Production Build:** Deploy `@sous/wearos` to a physical watch.

### Phase 1.6: Identity & Multi-Tenancy (CORE APP)
**Goal:** Establish the security and isolation layer.
- [ ] **Tenancy:** PostgreSQL RLS policies and Drizzle middleware.
- [ ] **IAM:** JWT authentication and RBAC roles (User, Admin).
- **Why:** Every feature built later depends on `organizationId`.

### Phase 1.7: Media & Asset Strategy (CORE APP)
**Goal:** Centralized binary storage.
- [ ] **Media Domain:** Stateless image management with grayscale/WebP optimization (ADR 028).
- **Why:** Prevents refactoring Invoices and Recipes later when images are needed.

## Phase 2: Signage MVP (High Priority)

### Phase 2.1: Presentation Engine
- [ ] **Presentation Domain:** Implement structural Template Editor vs. Specialized Content Assignment (ADR 022).
- [ ] **Headless App:** Multi-window orchestration and pairing workflow on RPi.
- [ ] **Real-time:** Socket.io integration for instant screen updates.

## Phase 3: Culinary Data Ingestion

### Phase 3.1: Procurement Foundation
- [ ] **Supplier/Vendor Management:** Simple CRUD for vendor profiles.
- [ ] **Invoices Domain:** AI-powered extraction from scans/PDFs (Data Entry focus).
- [ ] **Catalog:** Centralized ingredient normalization logic.

### Phase 3.2: Culinary Foundation
- [ ] **Recipe Entry:** Manual and AI-ingested recipe definitions.
- [ ] **Math Engine:** Scaling, Bakers Percentages, and Container counts (ADR 018).

## Phase 4: Intelligence & Operations

### Phase 4.1: Culinary Intelligence
- [ ] **Intelligence Domain:** Asynchronous costing engine and price trends (ADR 005).
- [ ] **Accounting:** Historical financial ledger and COGS reconciliation (ADR 023).

### Phase 4.2: Inventory Management
- [ ] **Virtual Inventory:** Stock Ledger and Theoretical Depletion (ADR 025).
- [ ] **Order Manager:** Collaborative procurement lists.

## Phase 5: Ecosystem & Hardware

### Phase 5.1: Specialized Native Tools
- [ ] **Hardware Domain:** Device registry and remote configuration (ADR 017).
- [ ] **Wear OS:** Timer sync and hands-free alerts (ADR 027).
- [ ] **Integrations:** POS syncing (Square/Toast) and Google Drive (ADR 024).

## Phase 6: Point of Sale & KDS (Last Priority)

### Phase 6.1: Kitchen Flow
- [ ] **KDS App:** Real-time order grid and HACCP temperature monitoring.
- [ ] **Labels:** Printing thermal prep labels via Presentation domain.

### Phase 6.2: Revenue
- [ ] **POS App:** High-speed order entry and offline payment sync.
