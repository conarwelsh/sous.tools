# @sous/config

The centralized configuration and environment management package.

## Responsibilities

- **Single Source of Truth**: Sole package allowed to access `process.env`.
- **Validation**: Enforces runtime safety using Zod schemas.
- **Environment Driven**: Relies on external injection (Infisical, Vercel, etc.) rather than manual fetching.

## Functionality List

- [x] Zod-validated configuration schema.
- [x] Static exports for `server` (secrets) and `client` (public only).
- [x] Zero-dependency runtime (no manual SDK fetching).

## Installation & Setup

1. Requires secrets to be injected into the environment (e.g., via `infisical run`).
2. `pnpm install`.

## Usage

```typescript
// Server-side (includes secrets)
import { server } from "@sous/config";
console.log(server.db.url);

// Client-side (public variables only)
import { client } from "@sous/config";
console.log(client.api.url);
```

## Related ADRs

- [ADR 002: Centralized Configuration Strategy](../../.gemini/docs/ADRs/002-config-package-strategy.md)
