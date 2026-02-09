# ADR 002: Centralized Configuration & Infisical Abstraction

## Status

Decided (Updated Feb 9, 2026)

## Date

2026-02-03 (Initial)

## Context

Applications currently lack a unified way to handle environment variables and configuration.

- We need to support multiple environments: Development, Staging, Production.
- "Magic strings" (undeclared config values) scattered throughout codebases lead to fragility.
- Accessing `process.env` directly is unsafe and untyped.
- We use **Infisical** as the single source of truth for secrets and variables.
- Direct interaction with Infisical or `process.env` outside of a centralized package leads to architectural leakage and makes the system harder to test and maintain.
- We need to safely provide a subset of configuration to the frontend without leaking secrets.

## Decision

We will strictly enforce a **Centralized Configuration** strategy using the `@sous/config` package.

### Key Components

1.  **Exclusive Access (The "Gatekeeper" Pattern):**
    - The `@sous/config` package is the **ONLY** place in the monorepo allowed to access `process.env` or import `@infisical/sdk`.
    - All other apps and packages (including the CLI) MUST import configuration from `@sous/config`.
    - Usage of `process.env.[KEY]` anywhere else is strictly forbidden and should be caught by linting.

2.  **Infisical Abstraction:**
    - Infisical is an implementation detail of the config package.
    - No other part of the system should know *how* secrets are fetched. This allows us to swap secret providers in the future with zero impact on the rest of the codebase.

3.  **Client-Safe Split:**
    - The package provides two primary typed exports:
        - `server`: The full configuration object, including sensitive secrets. **MUST NEVER** be imported into client-side code.
        - `client`: A filtered, public-safe subset of configuration. This includes variables prefixed with `NEXT_PUBLIC_` or `VITE_`.
    - Next.js Webpack configuration will explicitly mock server-only dependencies (like the Infisical SDK) to prevent them from leaking into the browser bundle.

4.  **Validation & Schema (Zod):**
    - We use **Zod** to define the shape of our configuration.
    - **Fail-Fast:** The application will crash on startup with a detailed error report if the configuration does not match the schema or if required values are missing.

5.  **Static & Typed:**
    - The package exports static configuration objects.
    - Full TypeScript support is mandatory, providing developers with autocomplete and compile-time checks for all configuration keys.

## Implementation Details

- **Local Dev:** The package uses the Infisical CLI or SDK to populate the environment during its internal bootstrap phase.
- **Production:** Secrets are typically injected by the hosting provider (Vercel/Render) or fetched at runtime via the SDK, but always internal to `@sous/config`.

## Consequences

- **Positive:**
  - **Security:** Secrets are abstracted and managed by a dedicated tool.
  - **Reliability:** App crashes immediately if config is invalid (fail-fast).
  - **DX:** Autocomplete and type safety for all config values.
  - **Zero Leakage:** The secrets provider implementation is hidden from the rest of the stack.
- **Negative:**
  - Requires updating the Zod schema in `@sous/config` when adding new variables.
  - Runtime dependency on the bootstrap process.

  ## Research & Implementation Plan

  ### Research
  - **Infisical:** Selected for its CLI-based secret injection and robust API. It allows us to keep `.env` files out of the repository.
  - **Zod:** Chosen for its type inference and runtime validation.

  ### Implementation Plan
  1. **Define Schema:** Maintain `src/schema.ts` in `@sous/config` using Zod.
  2. **Bootstrap Logic:** Implement synchronous population of `process.env` from Infisical CLI/SDK during module initialization.
  3. **Refactor System:** Remove direct Infisical SDK usage from `@sous/cli` and other apps, delegating to `@sous/config`.
  4. **Linting:** (Future) Add an ESLint rule to forbid direct `process.env` access outside of `@sous/config`.