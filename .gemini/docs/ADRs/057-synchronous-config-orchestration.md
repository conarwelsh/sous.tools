# ADR 057: Synchronous Configuration and CLI-Driven Environment Injection

## Status

Proposed

## Context

The `@sous/config` package originally contained asynchronous logic to fetch secrets from Infisical at runtime. This introduced several problems:

1.  **Startup Latency**: Every application had to wait for a network request to Infisical before it could start.
2.  **Complexity**: Asynchronous configuration is harder to use in NestJS modules, React components, and other contexts where synchronous access is preferred.
3.  **Security**: Runtime secret fetching requires every application to have Infisical credentials and network access to the secret manager.
4.  **Inconsistency**: Different apps might resolve configuration differently or at different times.

## Decision

We will move to a **CLI-Driven Environment Injection** model:

1.  **Synchronous `@sous/config`**: The package will be strictly synchronous. It will ONLY read from `process.env`. It will NOT perform any network requests or async initialization.
2.  **CLI Orchestrator**: The `@sous/cli` will provide a `sous env exec` command. This command is responsible for:
    - Parsing local `.env` for Infisical bootstrap credentials.
    - Fetching secrets from the Infisical vault for the target environment.
    - Injecting those secrets into `process.env`.
    - Spawning the target application process.
3.  **Elimination of Async Aliases**: All legacy async exports like `resolveConfig()` and `configPromise` will be removed.
4.  **Strict Validation**: `@sous/config` will use Zod to validate the environment at startup, ensuring all required secrets are present before the app logic begins.

## Consequences

- **Improved Performance**: Applications start instantly once spawned by the CLI.
- **Simplified Code**: No more `await configPromise` or `registerAsync` for simple configuration.
- **Centralized Management**: All environment logic is in the CLI, making it easier to audit and update.
- **Workflow Change**: Developers must now use `sous env exec -- <command>` (or `pnpm dev` which should wrap it) to run applications with secrets.
- **Production Safety**: In production, secrets can be injected by the CI/CD pipeline or container orchestrator, bypassing the need for Infisical if desired, while still using the same synchronous config logic.
