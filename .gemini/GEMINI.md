# Gemini Context & Mandates

## Mandates

### 1. Documentation Maintenance (CRITICAL)
**Rule:** You MUST automatically update the documentation in `.gemini/docs/` whenever you make changes to the codebase, add features, or modify architecture.
- **Action:** Before marking a task as complete, review the files in `.gemini/docs/` (e.g., `features.md`, `architecture.md`, `history.md`) and update them to reflect the latest state of the project.
- **ADRs:** When a significant architectural decision is made, create a NEW file in `.gemini/docs/ADRs/` (e.g., `002-decision-name.md`) following the standard ADR format (Status, Context, Decision, Consequences).
- **Trigger:** Any code change, feature addition, or architectural decision.
- **Method:** Use `read_file` to check current docs, then `write_file` or `replace` to update them. Do not wait for user instruction.

### 2. Logging
**Rule:** NO raw `console.log`, `console.error`, or `console.warn` is allowed in production code.
- **Action:** All logging must go through the `@sous/logger` package.
- **Exception:** Temporary debugging during a session is allowed, but must be removed before completion.

### 3. Environment Variables
**Rule:** Direct access to `process.env` is restricted.
- **Action:** Only the `@sous/config` package is allowed to access `process.env`.
- **Usage:** All other packages/apps must import configuration values from `@sous/config`.

### 4. Code Quality & Standards
- Follow the project's established conventions (ESLint, Prettier).
- Ensure all new features are tested.
- Use `turbo run lint` and `turbo run build` to verify changes.

### 5. Infrastructure: Free Tier Restriction (MANDATE)
**Rule:** Everything built for this infrastructure MUST be compatible with the **FREE TIER** of the respective services (Vercel, Render, Supabase, Upstash, Redis Cloud, Infisical, etc.).
- **Action:** Before suggesting or implementing a new service or feature that incurs infrastructure costs, verify it fits within the free limits of our providers.
- **Optimization:** Architect for efficiency to stay within these limits (e.g., aggressive caching, serverless-friendly logic, minimal cold starts).

## Documentation Index
- `docs/ADRs/`: Folder containing Architectural Decision Records (one file per decision).
- `docs/architecture.md`: High-level system architecture.
- `docs/context-for-llm.md`: Context for external LLM sessions (stack, conventions, etc.).
- `docs/deployment.md`: Deployment strategies.
- `docs/features.md`: Complete feature list.
- `docs/hardware.md`: List of hardware in use.
- `docs/history.md`: Project history and "memories" (difficult bugs, key decisions).

## Project Structure
- **Namespace:** `@sous`
- **Apps:**
  - `@sous/web` (Next.js 16)
  - `@sous/api` (NestJS)
  - `@sous/cli` (NestJS CLI)
- **Packages:**
  - `@sous/client-sdk`: Generated client SDK.
  - `@sous/config`: Centralized configuration.
  - `@sous/eslint-config`: Shared ESLint config.
  - `@sous/logger`: Centralized logger.
  - `@sous/typescript-config`: Shared TS config.
  - `@sous/ui`: UI component library.
