# ADR 003: Centralized Logger Strategy

## Status
Proposed

## Date
2026-02-03

## Context
We need a unified logging solution for the entire monorepo (`@sous/*`).
- **Consistency:** All apps and packages must log in a standardized format.
- **Context:** Logs must identify the source package (`@sous/ui`) and ideally the initiating application (`@sous/web`).
- **Aesthetics:** Local development logs should be readable and branded (colors).
- **Remote Access:** We need to aggregate logs from Development, Staging, and Production (using **Better Stack**) and allow the `@sous/cli` to tail them.
- **Management:** Development logs should be ephemeral; Production logs must be persisted and searchable.

## Decision
We will build `@sous/logger` as a wrapper around **Pino**.

### Key Technology Choices
- **Core Engine:** `pino` (Low overhead, JSON structure).
- **Remote Transport:** `@logtail/pino` (Better Stack integration).
- **Pretty Printing:** `pino-pretty` with a custom formatter for brand colors.
- **Context Propagation:** Node.js `AsyncLocalStorage`.

### implementation Details

#### 1. Context Awareness
The logger will support two layers of context:
- **Static Context (Package Level):**
  - Consumers invoke a factory function: `createLogger({ name: '@sous/package-name' })`.
  - This creates a pinned child logger that always tags logs with the package name.
- **Dynamic Context (Request/Execution Level):**
  - We will use `AsyncLocalStorage` to track a "Correlation ID" and "Origin App".
  - *Example:* `@sous/web` starts a request. It sets the storage context. When `@sous/web` calls a function in `@sous/config` or `@sous/ui`, those packages (using their own namespaced loggers) will automatically include the `trace_id` from the active storage context.

#### 2. Visuals & Branding
- **Local Dev:**
  - We will implement a custom `pino-pretty` configuration.
  - Colors will eventually be sourced from `@sous/ui` tokens (passed as hex codes or ANSI codes).
  - Output format: `[Timestamp] [OriginApp] [Package] [Level]: Message`.

#### 3. Remote Management (Better Stack)
- **Production/Staging:** Logs are streamed directly to Better Stack via the `@logtail/pino` transport.
- **Environment:** Defined by `@sous/config` (API keys).

#### 4. CLI Integration (`@sous/cli`)
- **Local Tailing:** The CLI's `dev` command will pipe output through the pretty printer. It will also handle cleaning up old log files on startup.
- **Remote Tailing:** The CLI will implement a `logs` command (e.g., `sous logs --env=production`).
  - This command will query the Better Stack API to stream live logs to the terminal, applying the same pretty-printing logic used locally.

## Consequences
- **Positive:**
  - Unified structured logging (JSON) suitable for machine parsing.
  - "Distributed tracing" style context via `AsyncLocalStorage`.
  - Centralized visibility via Better Stack.
- **Negative:**
  - `AsyncLocalStorage` introduces slight complexity in setting up the "root" context in apps (middleware required).
  - Dependency on Better Stack for remote viewing.
  
  ## Research & Implementation Plan
  
  ### Research
  - **Pino:** Benchmark-proven low overhead. Excellent support for "pretty" dev logs and structured JSON prod logs.
  - **Better Stack (Logtail):** Provides a seamless Pino transport and a high-quality dashboard for log aggregation.
  - **AsyncLocalStorage:** Native Node.js module used to propagate request-level context (trace IDs) without manual prop drilling.
  
  ### Implementation Plan
  1. **Core Logger:** Build the base Pino configuration in `@sous/logger`.
  2. **Transports:** Configure `pino-pretty` for development and `@logtail/pino` for production.
  3. **Context Middleware:** Create a NestJS interceptor and Next.js middleware to initialize `AsyncLocalStorage` with unique trace IDs for every request.
  4. **Branding:** Implement custom `pino-pretty` coloring that matches the `@sous/ui` design system.
  
