# Project Context: @sous tools

## Overview
This is a monorepo for the `@sous` suite of tools, managed using TurboRepo. It contains a web frontend, a backend API, a CLI tool, and several shared internal packages.

## Tech Stack
- **Monorepo Manager:** TurboRepo
- **Package Manager:** pnpm
- **Frontend:** Next.js 16 (React)
- **Backend:** NestJS
- **CLI:** NestJS (standalone app)
- **Language:** TypeScript

## Directory Structure
- **`apps/`**
  - `@sous/web`: Next.js application.
  - `@sous/api`: NestJS application.
  - `@sous/cli`: NestJS-based CLI tool.
- **`packages/`**
  - `@sous/config`: **CRITICAL**. The only place allowed to access `process.env`.
  - `@sous/logger`: **CRITICAL**. The only allowed logger (no `console.log`).
  - `@sous/ui`: Shared UI components (Universal via React Native Reusables & NativeWind).
  - `@sous/features`: Shared "Organisms" and business logic (The Shell Pattern).
  - `@sous/client-sdk`: Generated API client.
  - `@sous/eslint-config`: Shared linting rules.
  - `@sous/typescript-config`: Shared TSConfig.

## Coding Mandates & Conventions
1.  **Environment Variables:** NEVER access `process.env` directly in apps or other packages. Always define and export them from `@sous/config`. The use of `.env` files within applications is FORBIDDEN; all configuration (including ports for Next.js and Vite) MUST be centralized in `@sous/config`.
2.  **Logging:** NEVER use `console.log`, `console.error`, etc. Always import and use the logger from `@sous/logger`.
3.  **Namespace:** All internal packages are scoped under `@sous/` (e.g., `@sous/ui`).
4.  **Documentation:** The `.gemini/docs/` folder tracks features, architecture, and ADRs.
5.  **Free Tier:** ALL infrastructure must run on service free tiers.
6.  **"use client" Directive:** Only use `"use client"` in components that interact with the DOM or Browser APIs; always prefer Server Components.
7.  **Nested DDD:** Use strategic umbrella folders (e.g., `src/domains/procurement/invoices/`) to group related features.
8.  **The Shell Pattern:** Apps like `@sous/web` and `@sous/native` are thin shells; all feature logic and views live in `@sous/features`.
9.  **CLI Command Aggregation:** All operational scripts in `package.json` files must be aggregated into and accessible via `@sous/cli`.
10. **Build Exclusion:** Internal docs and `@.gemini/` files must be excluded from all production build artifacts.

## Platform Domain Model (ADR 005)
The application is a **Multi-Tenant SaaS** for restaurant management.
- **Tenancy:** Row-level security via `Organization` (Tenant) and `Location` (Store).
- **Core Domains:**
  - **IAM:** Identity, Roles, Organizations.
  - **Procurement:** Suppliers, Invoices, Price Tracking, Order Management.
  - **Culinary:** Recipes, Menus, Prep.
  - **Inventory:** Stock, Wastage, Purchase Orders.
  - **Intelligence:** Real-time costing engine, price trends, margin analysis, data pruning.
  - **Accounting:** Historical financial ledger, statutory reporting, P&L, COGS.
  - **Hardware:** Devices (BLE, Printers), Telemetry, Offline Safety Mode.
  - **Presentation:** Digital Screens, Layouts, Labels, Media Management.
  - **Integrations:** Third-party ecosystem (POS, Drive).

## Infrastructure & Constraints (ADRs 007, 028, 029, 034, 035)
- **Free Tier:** ALL infrastructure must run on service free tiers.
- **Local Cloud:** Docker Compose mocks for Postgres, Redis, MailDev (Resend), and Minio (Supabase Storage).
- **Media:** Stateless management via Supabase Storage (1GB) with grayscale/WebP downsampling.
- **Retention:** Mandatory pruning of telemetry (7 days) and job history (48h).
- **Safety:** Offline-first capability for POS/KDS via local SQLite bridge.
- **Efficiency:** Real-time data throttling (60s batching) to stay within Upstash limits.

## Branding & UI (brand-identity.md)
- **Visuals:** High-contrast, industrial minimal, deep kitchen slate background.
- **I18n:** Global-ready with code-split translations and RTL/LTR support.
- **Quality:** Multi-layered pyramid (Unit, RTL, E2E, HITL Simulation).

## CLI Orchestrator (ADR 008, 037, 038)
- **Entry Point:** `sous` command.
- **Pattern:** DDD-based subcommands (e.g., `sous db wipe`, `sous env dashboard`).
- **Dev Workflow:** `sous dev` manages a custom Ink TUI with dedicated panels for local apps and Docker infra.
- **Monitoring:** `sous env dashboard` provides animated, real-time platform metrics across environments.
- **Safety:** Interactive prompts for destructive actions unless `-y` is passed.

## Security & Auth (ADR 009)
- **Tenancy:** Strictly enforced Row-Level Security (RLS) in PostgreSQL.
- **Roles:** `user`, `admin`, `superadmin`.
- **Auth:** JWT-based for Web/Mobile; API Keys for apps/CLI.
- **Sessions:** Centralized termination via Redis; logout from one app logs out of all apps.
- **Protocols:** Unified auth across REST, GraphQL, and authenticated WebSockets.

## Backend API & Communication (ADR 010)
- **Hybrid API:** REST (Scalar docs) + GraphQL (Subscriptions + GraphiQL).
- **Queues:** BullMQ + Redis for background jobs (Costing, Emails).
- **Real-time:** WebSockets (Socket.io) for live updates.
- **Email:** Resend (React Email) sending from `@sous.tools`.
- **Branding:** Branded documentation portals across all environments.

## Current State (as of 2026-02-03)
- Initial scaffold complete.
- Apps created (Web, API, CLI, Native Suite).
- Packages operational: `@sous/config` (Infisical SDK v4), `@sous/logger`, `@sous/ui`, etc.
- CLI Features: Development orchestration (`sous dev`), Log management (`sous logs`), Config management (`sous config`), Quality checks (`sous test`, `sous check`), Maintenance (`sous housekeep`).
- Strict linting/build pipeline configured via Turbo.
