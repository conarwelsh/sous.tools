# Architecture

## Overview
This project is a monorepo managed by TurboRepo.

## Components
- **Frontend**: Next.js (@sous/web)
- **Backend**: NestJS (@sous/api)
- **CLI**: NestJS (@sous/cli)
- **Shared Libraries**: Located in `packages/`.

## Constraints
- **Environment Variables**: Only `@sous/config` can access `process.env`. The use of `.env` files in applications is strictly forbidden; all config (including ports) must be resolved via `@sous/config`.
- **Logging**: All logging must use `@sous/logger`.