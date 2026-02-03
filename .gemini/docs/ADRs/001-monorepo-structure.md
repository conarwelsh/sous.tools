# ADR 001: Monorepo Structure and Tech Stack

## Status
Accepted

## Date
2026-02-03

## Context
We need a scalable and efficient structure for developing multiple related applications (Web, API, CLI) and shared libraries. The project requires strict boundaries for environment variable access and logging.

## Decision
We have decided to use a Monorepo structure managed by **TurboRepo**.

### Key Technology Choices:
- **Package Manager:** pnpm (via workspaces)
- **Frontend:** Next.js 16 (React) - `@sous/web`
- **Backend:** NestJS - `@sous/api`
- **CLI:** NestJS - `@sous/cli`
- **Build System:** TurboRepo

### Shared Packages Strategy:
- **`@sous/config`**: EXCLUSIVE access to `process.env`. All other apps/packages must consume config via this package.
- **`@sous/logger`**: EXCLUSIVE logging utility. Raw `console.log` is forbidden.
- **`@sous/ui`**: Shared UI component library ("atoms").
- **`@sous/client-sdk`**: Generated SDK for client-server communication.
- **`@sous/eslint-config`** & **`@sous/typescript-config`**: Shared standards.

## Consequences
- **Positive:** centralized dependency management, shared code reuse, unified build pipeline, enforced architectural constraints (config/logging).
- **Negative:** Increased initial complexity in setting up the build pipeline and workspace configuration.
