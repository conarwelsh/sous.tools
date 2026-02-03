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
  - `@sous/ui`: Shared UI components.
  - `@sous/client-sdk`: Generated API client.
  - `@sous/eslint-config`: Shared linting rules.
  - `@sous/typescript-config`: Shared TSConfig.

## Coding Mandates & Conventions
1.  **Environment Variables:** NEVER access `process.env` directly in apps or other packages. Always define and export them from `@sous/config`.
2.  **Logging:** NEVER use `console.log`, `console.error`, etc. Always import and use the logger from `@sous/logger`.
3.  **Namespace:** All internal packages are scoped under `@sous/` (e.g., `@sous/ui`).
4.  **Documentation:** The `.gemini/docs/` folder tracks features, architecture, and ADRs.
5.  **Free Tier:** ALL infrastructure must run on service free tiers.

## Platform Domain Model (ADR 005)
The application is a **Multi-Tenant SaaS** for restaurant management.
- **Tenancy:** Row-level security via `Organization` (Tenant) and `Location` (Store).
- **Core Domains:**
  - **IAM:** Users, Roles, Auth, Organizations.
  - **Catalog:** Ingredients, Vendors, Invoices (Supply Chain).
  - **Culinary:** Recipes, Menus, Costing (The "Product").
  - **IoT:** BLE Thermometers, Digital Menu Screens.

## Deployment & Infrastructure (ADR 007)
- **Production:** `https://sous.tools` (Vercel, Render, Supabase, Upstash).
- **Staging:** `https://staging.sous.tools` (Vercel, Render, Supabase, Redis Cloud).
- **Visual Mandate:** App Icons MUST match the environment color:
  - **Dev:** Success (Green)
  - **Staging:** Warning (Orange)
  - **Prod:** Primary (Brand)

## CLI Orchestrator (ADR 008)
- **Entry Point:** `sous` command.
- **Pattern:** DDD-based subcommands (e.g., `sous db wipe`, `sous logs --env=prod`).
- **Dev Workflow:** `sous dev` manages a Zellij/Tmux session with dedicated panels for API, Web, and Gemini-CLI.
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
- Apps created but barebones.
- Packages created but empty (placeholders).
- Strict linting/build pipeline configured via Turbo.
