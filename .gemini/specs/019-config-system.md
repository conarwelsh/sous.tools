# Spec 019: Centralized Config System (@sous/config)

## Status: Proposed
## Strategic Umbrella: Infrastructure & Security

## 1. Context & Problem Statement
Currently, configuration is scattered, and while `@sous/config` exists, it still relies on a mix of `process.env` and manual Infisical CLI calls. This leads to inconsistencies across environments (Dev, Staging, Prod) and makes local development harder when switching targets.

## 2. Goals & Objectives
- **Complete Abstraction**: No other part of the system should interact with `process.env` or Infisical directly.
- **Environment Detection**: Automatically detect the current environment (Local, WSL, Vercel, Render).
- **Static & Typed**: Provide a Zod-validated, deeply typed config object.
- **Seamless Injection**: Provide a CLI command (`sous env export --env=... -- <command>`) to inject environment variables into any shell command.
- **Universal Targeting**: Allow a developer to run local commands against Staging or Production configurations by passing a flag.

## 3. Architecture

### 3.1 The Config Engine
- **Zod Schema**: Definitive schema for all platform settings (API URLs, Ports, Database Strings, Third-party keys).
- **Runtime Detection**: Determine if running on a Client (Browser), Server (Node), or Mobile (Capacitor) environment.
- **Provider Layer**:
    - **Bootstrap**: Loads Infisical credentials from `@sous/config/.env`.
    - **Vault**: Fetches ALL application secrets from Infisical (Dev, Staging, Prod).
    - **System**: Uses pre-existing environment variables (CI/CD) when available.

### 3.2 Infisical Abstraction
- The package handles authentication and fetching internally using the bootstrap credentials.
- No other environment variables should be stored in .env files.
- Secrets are cached during a session to prevent excessive API calls.

### 3.3 CLI Integration (`@sous/cli`)
- `sous env export --env <env> -- <cmd>`: Wrapper that fetches secrets for the specified environment and spawns the command with those variables.
- `sous env list`: Show current resolved configuration (with secrets masked).

## 4. Mandates
- **No Direct Access**: Direct usage of `process.env` in applications is forbidden. Use `import { config } from '@sous/config'`.
- **Validation**: If a required configuration variable is missing, the application must fail-fast with a clear Zod error.

## 5. Implementation Plan
1. **Refactor @sous/config**: Move from "bootstrap" logic to a more robust SDK-based approach where possible.
2. **Environment Injection**: Implement the `env export` command in `@sous/cli`.
3. **Validation Layer**: Tighten the Zod schema to include all known service requirements.
