# Architecture

## Overview
This project is a monorepo managed by TurboRepo.

## Components
- **Frontend**: Next.js (@sous/web), React Native (@sous/native), Tauri (@sous/signage, @sous/kds, @sous/pos).
- **Backend**: NestJS (@sous/api) - Hybrid REST (Scalar) and GraphQL (Apollo) architecture.
- **CLI**: NestJS (@sous/cli)
- **Shared Libraries**: Located in `packages/`.
- **Templates**: Located in `packages/templates/`. Specifically, `packages/templates/native-app` is the source of truth for all Tauri-based native applications.

## Domains
The platform is organized by **Business Domain** using Nested Strategic Umbrellas:
- **IAM**: Identity, Authentication (JWT/Bcrypt), and Multi-tenancy.
- **Procurement**: Suppliers, Invoices, and Order Management.
- **Culinary**: Recipes, Ingredients, and Unit Conversions.
- **Intelligence**: Async Costing (BullMQ), Price Trends, and Data Pruning.
- **Accounting**: General Ledger, COGS Reconciliation, and Statutory Reporting (P&L).
- **Presentation**: Digital Menus (Signage), Label Templates, and Layout Editor.
- **Hardware**: Node Registry, Telemetry, and Remote Configuration.
- **Integrations**: Adapter-based syncing with third-party providers.

## Constraints
- **Environment Variables**: Only `@sous/config` can access `process.env`. The use of `.env` files in applications is strictly forbidden; all config (including ports) must be resolved via `@sous/config`.
- **Logging**: All logging must use `@sous/logger`.

## Application Templates
- **Native App Template**: The directory `packages/templates/native-app` contains the canonical implementation of a `@sous` native application (Tauri + React).
    - **Mandate**: Any structural bug fixes, configuration updates, or dependency changes applied to `@sous/native` or derived apps MUST also be applied to this template to ensure future applications inherit these improvements.
