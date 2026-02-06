# sous.tools

The unified operational platform for the modern culinary industry.

## Project Structure

This is a monorepo managed by **TurboRepo** and **pnpm workspaces**.

### Applications (`apps/`)
- **[@sous/api](./apps/api)**: Centralized NestJS API & Drizzle ORM.
- **[@sous/web](./apps/web)**: primary Next.js 16 administrative interface.
- **[@sous/cli](./apps/cli)**: Command-line orchestrator & developer tools.
- **[@sous/native](./apps/native)**: Universal mobile app (Tauri).
- **[@sous/signage](./apps/signage)**: Kiosk/Signage host (Raspberry Pi).
- **[@sous/native-kds](./apps/native-kds)**: Kitchen Display System touch terminal.
- **[@sous/native-pos](./apps/native-pos)**: high-speed Point of Sale terminal.
- **[@sous/wearos](./apps/wearos)**: Native Wear OS companion app.
- **[@sous/docs](./apps/docs)**: Documentation hub & Branding lab.

### Packages (`packages/`)
- **[@sous/ui](./packages/ui)**: Universal UI library (React Native Web + NativeWind).
- **[@sous/features](./packages/features)**: Shared business logic & Nested DDD.
- **[@sous/config](./packages/config)**: Centralized environment management.
- **[@sous/logger](./packages/logger)**: Centralized Pino logging.
- **[@sous/client-sdk](./packages/client-sdk)**: Generated API client.
- **[@sous/native-bridge](./packages/native-bridge)**: Shared Rust hardware core.

## Getting Started

### 1. Requirements
- Node.js 22+
- pnpm 10+
- Docker (for local infra)
- Infisical CLI (for secrets)

### 2. Secrets & Configuration
The platform uses **Infisical** for secret management. You must provide the bootstrap credentials in a root `.env` file (copied from `.env.example`):
```bash
cp .env.example .env
# Edit .env with your INFISICAL_CLIENT_ID, etc.
```

### 3. Installation
```bash
pnpm install
pnpm sous dev install
```

### 4. Development
```bash
pnpm sous dev
```
This will launch the **Ink TUI Dashboard** with the API, Web, and Docs servers running.

## Architecture & Mandates
The project is governed by strict mandates found in [.gemini/GEMINI.md](./.gemini/GEMINI.md).
- **Nested DDD**: Strategic umbrellas for feature organization.
- **Server-Side First**: Prefer Next.js Server Components and Actions.
- **Centralized Everything**: Config and Logging must be imported from shared packages.

## Documentation
Full documentation, ADRs, and implementation specs are available in [.gemini/docs/](./.gemini/docs/).
- [Architecture Guide](./.gemini/docs/architecture.md)
- [Deployment Strategy](./.gemini/docs/ADRs/007-deployment-strategy.md)
- [Brand Identity](./.gemini/docs/brand-identity.md)
