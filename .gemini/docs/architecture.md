# Architecture

## Overview

This project is a monorepo managed by TurboRepo, following a **"Web-First"** architecture.

## Components

- **Frontend**: Next.js (@sous/web) - The primary application serving all targets (Web, Mobile via Capacitor, and Kiosk via FullPageOS).
- **Documentation**: Next.js (@sous/docs) - Centralized intelligence hub and component lab.
- **Backend**: NestJS (@sous/api) - Hybrid REST (Scalar) and GraphQL (Apollo) architecture.
- **CLI**: NestJS (@sous/cli) - Sous Dev Tools.
- **Watch**: Native Wear OS (@sous/wearos) - Specialized hands-free extension.
- **Shared Libraries**: Standard React/TypeScript packages in `packages/`.

## The "Universal Web" Strategy

Instead of using fragile cross-platform bridges like React Native Web, the platform utilizes a single, high-performance web codebase:

1.  **Web**: Standard Next.js deployment.
2.  **Mobile**: Capacitor shell wrapping the `@sous/web` build, providing access to native APIs.
3.  **Kiosk/Signage**: Raspberry Pi nodes running **Android (Emteria/AOSP)**. Development uses **Redroid** in Docker. The app is a specialized Capacitor flavor of `@sous/web`.

## Domains

The platform is organized by **Business Domain** using Nested Strategic Umbrellas. Following Mandate 14, each domain maintains its own **`.schema.ts`** definition, ensuring strict isolation and modularity.

- **IAM**: Identity, Authentication (JWT), Multi-tenancy, and **Scope-Based Access Control (SBAC)** for tiered pricing plans.
- **Core**: Cross-cutting utilities like the Unified Tag Engine and centralized Database services.
- **Procurement**: Suppliers, Invoices, and Order Management.
- **Culinary**: Recipes, Ingredients, and Unit Conversions.
- **Intelligence**: Async Costing (BullMQ), Price Trends, and Data Pruning.
- **Accounting**: General Ledger, COGS Reconciliation, and Statutory Reporting (P&L).
- **Presentation**: Polymorphic engine for Digital Signage, Web Pages, and Thermal Labels. Features a unified JSON layout structure and recursive visual editor.
- **Hardware**: Node Registry, Telemetry, and Remote Configuration.
- **Integrations**: Adapter-based syncing with third-party providers.
- **Support**: User feedback, bug reporting, and GitHub/Email orchestration.

## Component Strategy (The Shell Pattern)

High-level applications (`@sous/web`, `@sous/native`) are treated as thin **Shells** (Mandate 15). All business logic, hooks, and complex UI "Organisms" reside in the **`@sous/features`** package. Apps are responsible only for:
- Routing and Platform-specific initialization.
- Mapping Feature components to routes.
- Handling native platform capabilities (via Capacitor).

## Constraints

- **Environment Variables**: Only `@sous/config` can access `process.env`. The package is strictly **synchronous**; all secrets must be injected via the CLI (`sous env exec`) or host environment (Mandate 3, ADR 057).
- **Database**: The `DatabaseService` uses **Reader/Writer separation** to scale with high traffic. Writes and transactions go to the primary pool, while reads are distributed to one or more replicas (Spec 035).
- **Logging & Observability**: All logging must use `@sous/logger`, which integrates **OpenTelemetry** and **HyperDX** for distributed tracing and centralized log aggregation (Spec 033).
- **UI Architecture**: Standard Shadcn UI patterns (Radix UI + Tailwind CSS).
