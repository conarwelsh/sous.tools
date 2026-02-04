# @sous/config

The centralized configuration and environment management package.

## Responsibilities
- **Single Source of Truth**: Sole package allowed to access `process.env`.
- **Validation**: Enforces runtime safety using Zod schemas.
- **Secret Management**: Integrates with Infisical for secure variable injection.

## Functionality List
- [x] Zod-validated configuration schema.
- [x] Environment-specific defaults (dev, test, production).
- [x] Infisical SDK v4 integration.

## Installation & Setup
1. Requires Infisical CLI for secret injection.
2. `pnpm install`.
3. Use `sous config` to manage values.

## Usage
```typescript
import { localConfig } from '@sous/config';
console.log(localConfig.api.port); // Type-safe access
```

## Related ADRs
- [ADR 002: Centralized Configuration Strategy](../../.gemini/docs/ADRs/002-config-package-strategy.md)
