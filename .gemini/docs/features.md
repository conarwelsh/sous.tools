# Features

## Initial Setup

- **Monorepo Structure**: TurboRepo with pnpm workspaces.
- **Web-First Architecture**: Standard Next.js + Shadcn UI + Tailwind.
- **Apps**:
  - `@sous/web`: Next.js Universal Web App / PWA / Mobile (via Capacitor).
  - `@sous/api`: NestJS application using **Drizzle ORM**.
  - `@sous/cli`: NestJS CLI tool.
  - `@sous/docs`: Centralized documentation hub and design lab.
  - `@sous/wearos`: Native Wear OS app for hands-free operations.
- **Packages**:
  - `@sous/client-sdk`: Generated client-server SDK.
  - `@sous/config`: Centralized configuration (Infisical + Zod).
  - `@sous/logger`: Centralized logging (Pino).
  - `@sous/ui`: Standard React UI component library (Shadcn pattern).
  - `@sous/features`: Shared business logic and "Organisms".
- **Shared Ingestion Engine (Spec 013)**:
  - **Document Capture**: Multi-source support (Camera/Upload) with pre-processing.
  - **Smart Mapping**: Fuzzy-matching and automated alias learning for catalog items.
  - **Verification Flow**: Split-screen reviewer for AI extraction results.

## CLI Capabilities (@sous/cli)

- **Development**: `sous dev` (Interactive Ink TUI), `sous install`.
- **Configuration**: `sous env config`, `sous env branding`.
- **Logging**: `sous env logs` (Centralized log tailing).
- **Maintenance**: `sous maintenance housekeep` (Build artifact cleanup).

## Deployment Targets

| Platform            | Strategy                          | Status          |
| :------------------ | :-------------------------------- | :-------------- |
| **Web / Admin**     | Vercel (Next.js)                  | ✅ Stable       |
| **Android / iOS**   | Capacitor Shell (Flavor: tools)   | ✅ Stable       |
| **KDS / POS**       | Capacitor Shell (Flavor: kds/pos) | ✅ Stable       |
| **Signage Node**    | Android OS (Flavor: signage)      | ✅ Stable       |
| **Signage Simulator** | Redroid (Docker)                | ✅ Stable       |
| **Wear OS**         | Native Android (Kotlin/Compose)   | ✅ Functional  |
| **Dev Bridge**      | WSL-Windows Health Recovery       | ✅ Stable       |
| **Backend**         | Render (NestJS)                   | ✅ Stable       |

## Infrastructure & Domains

- **Database**: Postgres 16 with Row-Level Security (RLS).
- **Real-time**: Socket.io for instant updates.
- **Hardware Simulation**: Dockerized Android OS (Redroid) for signage verification.
- **Domains**: IAM, Procurement, Culinary, Intelligence, Accounting, Presentation, Hardware, Integrations.
