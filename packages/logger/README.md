# @sous/logger

The centralized logging package for the `sous.tools` ecosystem.

## Responsibilities
- **Structured Logging**: Provides JSON logs for production using Pino.
- **Context Propagation**: Uses `AsyncLocalStorage` to track Trace IDs across requests.
- **Remote Aggregation**: Transports logs to Better Stack (Logtail).

## Functionality List
- [x] Pretty-printed logs for development.
- [x] Structured JSON for production.
- [x] Global Trace ID injection.

## Usage
```typescript
import { logger } from '@sous/logger';
logger.info('System online');
```

## Related ADRs
- [ADR 003: Centralized Logger Strategy](../../.gemini/docs/ADRs/003-logger-strategy.md)
