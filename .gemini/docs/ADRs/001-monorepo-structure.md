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
- **Watch:** Compose for Wear OS - `@sous/wearos`
- **Build System:** TurboRepo

### Shared Packages Strategy:
- **`@sous/config`**: EXCLUSIVE access to `process.env`. All other apps/packages must consume config via this package.
- **`@sous/logger`**: EXCLUSIVE logging utility. Raw `console.log` is forbidden.
- **`@sous/ui`**: Shared UI component library ("atoms").
- **`@sous/client-sdk`**: Generated SDK for client-server communication.
- **`@sous/eslint-config`** & **`@sous/typescript-config`**: Shared standards.

### Git Hooks & CI/CD:
- **Husky:** Used to manage git hooks for local quality enforcement.
- **Branch Strategy:** 
  - **`main` / `staging`:** Strict enforcement of `lint`, `typecheck`, and `build` on push/PR. These are the ONLY branches allowed to deploy to cloud providers.
  - **`development`:** All quality checks (lint, build, typecheck) are BYPASSED during commit/push to allow for rapid iteration and machine syncing. Deployment to cloud providers is STRICTLY FORBIDDEN.

## Consequences
- **Positive:** centralized dependency management, shared code reuse, unified build pipeline, enforced architectural constraints (config/logging).
- **Negative:** Increased initial complexity in setting up the build pipeline and workspace configuration.

## Research & Implementation Plan

### Research
- **TurboRepo:** Evaluated for its caching capabilities and task orchestration. Verified it handles `pnpm` workspaces efficiently.
- **pnpm Workspaces:** Chosen for its strict dependency management and performance.
- **Project Structure:** Standardized on `apps/` for deployable units and `packages/` for shared libraries.

### Implementation Plan
1. **Initialize Monorepo:** Setup `pnpm-workspace.yaml` and `turbo.json`.
2. **Husky Setup:** Initialize Husky and create a `pre-push` hook that checks the current branch and skips checks for `development`.
3. **Standardize Tooling:** Create `@sous/typescript-config` and `@sous/eslint-config`.
3. **Scaffold Core Packages:** Initialize `@sous/config` and `@sous/logger` as first-order dependencies.
4. **Setup Apps:** Create basic Next.js and NestJS skeletons in `apps/`.
5. **CI/CD Integration:** Configure GitHub Actions to run `turbo run build lint test` on every PR.
