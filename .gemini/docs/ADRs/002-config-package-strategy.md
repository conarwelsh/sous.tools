# ADR 002: Centralized Configuration Strategy

## Status

Proposed

## Date

2026-02-03

## Context

Applications currently lack a unified way to handle environment variables and configuration.

- We need to support multiple environments: Development, Staging, Production.
- "Magic strings" (undeclared config values) scattered throughout codebases lead to fragility.
- Accessing `process.env` directly is unsafe and untyped.
- We need to share configuration schemas with external tools (like the Gemini App context).

## Decision

We will strictly enforce a **Centralized Configuration** strategy using the `@sous/config` package.

### Key Components

1.  **Single Source of Truth:**
    - The `@sous/config` package will be the **ONLY** place in the monorepo allowed to access `process.env`.
    - All apps and packages must import configuration from `@sous/config`.

2.  **Secrets Management (Infisical):**
    - We will use **Infisical** to manage secrets and environment variables across all environments (Dev, Staging, Prod).
    - The config package will fetch these values (at build or runtime, depending on nature) to populate the config object.

3.  **Validation & Schema (Zod):**
    - We will use **Zod** to define schemas for all configuration.
    - This ensures runtime validation: the app will fail fast (crash) on startup if required config is missing or invalid.
    - Zod schemas will be exported to allow generating documentation or sharing context with LLMs.

4.  **Static & Typed:**
    - The package will export a **static configuration object** (or singleton class).
    - Full TypeScript support is mandatory. Consumers must get autocomplete for all config keys.

### Implementation Plan (High Level)

- Define Zod schemas for `ServerConfig`, `WebConfig`, `SharedConfig`.
- Integrate Infisical SDK to load values into these schemas.
- Export a typed `config` object:
  ```typescript
  import { config } from "@sous/config";
  console.log(config.api.port); // Typed access
  ```

## Consequences

- **Positive:**
  - **Security:** Secrets are managed by a dedicated tool, not scattered in `.env` files.
  - **Reliability:** App crashes immediately if config is invalid (fail-fast).
  - **DX:** Autocomplete and type safety for all config values.
  - **Maintainability:** No magic strings.
- **Negative:**
  - Adds a runtime dependency on the config package initialization.
  - Requires setup of Infisical for local development.

  ## Research & Implementation Plan

  ### Research
  - **Infisical:** Selected for its CLI-based secret injection and robust API. It allows us to keep `.env` files out of the repository.
  - **Zod:** Chosen for its type inference and runtime validation. It ensures that if an environment variable is missing, the app fails immediately with a clear error.

  ### Implementation Plan
  1. **Define Schema:** Create `src/schema.ts` in `@sous/config` using Zod to define all required variables.
  2. **Infisical Setup:** Configure the Infisical CLI to inject variables into the local environment during `pnpm dev`.
  3. **Validation Logic:** Implement an initializer that parses `process.env` against the Zod schema and exports a frozen, typed `config` object.
  4. **Integration:** Update all apps to import `config` from `@sous/config` and remove any direct `process.env` calls.
