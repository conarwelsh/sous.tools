# Phase Rollout Plan: sous.tools

This document provides a summary of the implementation steps for the `sous.tools` platform, derived from the Research & Implementation Plans in ADRs 001-030.

## Phase 1: Foundation & Infrastructure

### Phase 1.1: Scaffolding & Initial Deployment
**Goal:** Establish the monorepo and verify deployment pipelines.
- [x] **Monorepo Init:** Initialize `pnpm-workspace.yaml`, `turbo.json`, and **Husky** (with `development` branch exemptions).
- [x] **App Scaffolding:** Create "Hello World" skeletons for all apps:
  - `@sous/web`, `@sous/api`, `@sous/cli`, `@sous/docs` (Next.js/NestJS).
  - `@sous/native-headless`, `@sous/native-kds`, `@sous/native-pos`, `@sous/native` (Tauri).
  - `@sous/wearos` (Compose for Wear OS).
- [ ] **App Verification:** Verify all apps load in development environment (Web/Docs/API verified, Native/WearOS pending).
- [x] **Deployment:** Configure Render (API) and Vercel (Web/Docs) for automated staging/prod deployments.
- [x] **Local Test Guide:** Create `.gemini/docs/dev-device-installation.md` for hardware verification.

### Phase 1.2: Core Utilities
**Goal:** Build the system "Backbone."
- [x] **@sous/config:** Zod schemas + Infisical integration. Supports environment-specific retrieval.
- [x] **@sous/logger:** Pino + Better Stack + AsyncLocalStorage context.
- [x] **@sous/cli:** NestJS-based `sous dev`, `sous db`, and **`sous config`** orchestrators.

### Phase 1.3: Universal UI
**Goal:** Establish the design system.
- [x] **@sous/ui:** React Native Web + NativeWind v4 setup.
- [x] **Design Tokens:** Define shared theme (colors, typography, spacing).
- [x] **Core Atoms:** Build Button, Input, Card, and Text components.

### Phase 1.4: Native Foundation
**Goal:** Bridging JS and Hardware.
- [x] **@sous/native-bridge:** Rust-based Tauri plugin for metrics, network discovery, and BLE.

### Phase 1.5: Testing Suites
**Goal:** Ensure reliability and prevent regressions.
- [ ] **Unit Tests:** Implement comprehensive unit tests for core logic (Config, Utils).
- [ ] **E2E Tests:** Implement End-to-End tests for critical flows (CLI commands, API endpoints).
- [ ] **Pipeline Integration:** Configure CI pipeline to run tests on every commit/PR.
- [ ] **Mandate Enforcement:** Enforce testing requirements for all new features and bug fixes.

## Phase 2: Identity & Signage MVP

### Phase 2.1: Security & Multi-Tenancy
- [ ] **IAM:** JWT authentication and RBAC roles (User, Admin, SuperAdmin).
- [ ] **Tenancy:** PostgreSQL RLS policies and Drizzle middleware for automated isolation.

### Phase 2.2: Signage Workflow
- [ ] **Displays Domain:** Assignment logic for Web URLs vs. Hardware Ports.
- [ ] **Headless App:** Multi-window orchestration and pairing workflow on RPi.
- [ ] **Layout Manager:** Basic JSON-based layout editor and block rendering.

## Phase 3: Culinary Intelligence

### Phase 3.1: Catalog & Invoices
- [ ] **Invoices Domain:** AI-powered extraction from scans and PDFs.
- [ ] **Catalog:** Normalization logic and price history ledger.

### Phase 3.2: Recipes
- [ ] **Recipe Engine:** Scaling math, Bakers Percentages, and container-based yield.
- [ ] **AI Ingestion:** Processing recipes from Drive, URLs, and scans.
- [ ] **Dynamic Costing:** Real-time margin calculation linked to Catalog prices.

## Phase 4: Operational Execution

### Phase 4.1: Kitchen & Sales
- [ ] **POS App:** High-speed order entry, cart logic, and offline sync.
- [ ] **KDS App:** Real-time order grid, aging indicators, and HACCP monitoring.
- [ ] **Labels Domain:** Visual designer and print routing to thermal printers.

### Phase 4.2: Inventory
- [ ] **Virtual Inventory:** Theoretical depletion engine (Sales - Waste = Stock).
- [ ] **Alerts:** Automated "Need to Order" par-level notifications.

## Phase 5: Financial Intelligence

### Phase 5.1: Accounting & Ingredients
- [ ] **Accounting Domain:** P&L reporting and "Stars/Dogs" menu engineering.
- [ ] **Ingredients Domain:** "Vendor Wars" matrix and profitability alerts.
- [ ] **Order Manager:** Collaborative procurement lists and invoice reconciliation.

## Phase 6: Ecosystem Expansion

### Phase 6.1: Wearables & Integrations
- [ ] **Wear OS App:** Timer sync, haptic alerts, and Google Assistant voice actions.
- [ ] **Integrations Domain:** Driver-based adapters for Square, Toast, and Google Drive.
- [ ] **Branding Lab:** Interactive design tools in `@sous/docs`.
