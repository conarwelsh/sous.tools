# Features

## Initial Setup
- **Monorepo Structure**: TurboRepo with pnpm workspaces.
- **Apps**:
  - `@sous/web`: Next.js Universal Web App / PWA (Full suite management).
  - `@sous/native`: React Native Universal Mobile App (Full suite management).
  - `@sous/api`: NestJS application using **Drizzle ORM**.
  - `@sous/cli`: NestJS CLI tool.
  - `@sous/signage`: Tauri app for digital signage and hardware gateway.
  - `@sous/native-kds`: Tauri app for Kitchen Display System.
  - `@sous/native-pos`: Tauri app for Point of Sale.
  - `@sous/wearos`: Native Wear OS app for hands-free operations.
  - `@sous/docs`: Centralized documentation hub and design lab.
    - **Responsive Design**: Full mobile support with animated drawer.
    - **Collapsible Sidebar**: Desktop mini-mode for maximized reading space.
    - **Structured Navigation**: Automatic categorization of ADRs, Specs, and Guides.
    - **Prose Optimization**: Custom typography system for technical reading.
    - **Branding Lab**: Living style guide with interactive variant switching, size controls, and dynamic wordmark overrides (e.g., `sous.api`, `sous.docs`).
- **Packages**:
  - `@sous/client-sdk`: Generated client-server SDK.
  - `@sous/config`: Centralized configuration (Infisical + Zod).
  - `@sous/logger`: Centralized logging (Pino).
  - `@sous/ui`: Universal UI component library (React Native Web + NativeWind).
  - `@sous/native-bridge`: Shared Rust core for native hardware/BLE interactions.
  - `@sous/eslint-config`: Shared ESLint standards.
  - `@sous/typescript-config`: Shared TypeScript configurations.

## CLI Capabilities (@sous/cli)
- **Development**: `sous dev` (Interactive Ink TUI with real-time logs, process management, and `[c]` to clear active panel), `sous install`.
- **Configuration**: `sous config --env [env]`, `sous config add` (Infisical integration).
- **Logging**: `sous logs tail` (Local combined logs), `sous logs wipe`.
- **Sync**: `sous sync` (Database/Schema sync).
- **Quality**: `sous test` (Run test suite), `sous check` (Full health check: lint, type, test, build).
- **E2E Testing**: Playwright integration for critical path flows (e.g. Pairing process).
- **Maintenance**: `sous housekeep` (Deep clean artifacts: node_modules, .next, dist).

## Development Status
| Application | Environment | Status | Verification Date |
| :--- | :--- | :--- | :--- |
| `@sous/web` | Web / PWA | ✅ Stable | 2026-02-06 |
| `@sous/docs` | Web | ✅ Stable | 2026-02-06 |
| `@sous/api` | NestJS | ✅ Stable | 2026-02-06 |
| `@sous/native` | Android Emulator | ✅ Stable | 2026-02-06 |
| `@sous/signage` | Linux / WSL2 | ✅ Stable | 2026-02-06 |
| `@sous/wearos` | Android | ✅ Scaffolded | 2026-02-06 |

## Infrastructure & Domains
- **Database**: Postgres 16 with Row-Level Security (RLS) policies.
- **Docker Suite**: Traefik, Postgres (with RLS init), Redis, MailDev, Minio, GitHub Runner, Ubuntu Sandbox.
- **Core Domains**:
  - **IAM**: Identity, Roles, Organizations.
  - **Procurement**: Suppliers, Invoices, Order Manager.
  - **Culinary**: Recipes, Ingredients.
  - **Intelligence**: Costing Engine (BullMQ), Price Trends.
  - **Inventory**: Stock Ledger, Depletion Logic.
  - **Accounting**: General Ledger, P&L Reports.
  - **Presentation**: Editor/Renderer, Digital Signage.
  - **Hardware**: Pairing, Telemetry, Remote Config.
  - **Integrations**: Driver-based sync (Square/Toast).
