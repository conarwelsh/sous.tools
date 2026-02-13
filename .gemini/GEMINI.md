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

### 3. Environment Variables & Configuration

**Rule:** Direct access to `process.env` is strictly forbidden. The use of `.env` files within applications is FORBIDDEN; all configuration MUST be centralized.

- **Action:** Only the `@sous/config` package is allowed to access `process.env` or external secret managers (Infisical).
- **Usage:** All packages and apps (including Next.js and Vite apps) MUST import configuration values (including ports, URLs, and secrets) from `@sous/config`.
- **Enforcement:** Service ports must not be hardcoded in `package.json` scripts, Vite configs, Next configs, or `.env` files; they must be resolved programmatically via the config package.

### 4. Code Quality & Standards

- Follow the project's established conventions (ESLint, Prettier).
- Ensure all new features are tested.
- Use `turbo run lint` and `turbo run build` to verify changes.

### 6. Automated Documentation (READMEs)

**Rule:** Every package and app MUST maintain a comprehensive `README.md` that is updated **autonomously** with any code change.

- **Action:** When making changes to functionality, dependencies, or setup procedures, you MUST update the corresponding `README.md` immediately and without being prompted by the user.
- **Content Requirements:**
  - Description & Responsibilities.
  - Installation & Setup (including 3rd party platforms).
  - Functionality List.
  - Tech Stack/Tools used.
  - Links to related ADRs/docs.
- **Trigger:** Any code modification that affects the above categories.

### 7. Server-Side Data Fetching (MANDATE)

**Rule:** Applications MUST prioritize server-side data fetching and processing.

- **Action:** Use **Next.js Server Components** for data fetching and **Server Actions** for mutations whenever possible.
- **Goal:** Minimize client-side JavaScript, improve SEO, and ensure data security by performing sensitive operations on the server.

### 8. Local Development Branch (MANDATE)

**Rule:** All local development MUST occur on the `development` branch.

- **Action:** Before performing any code modifications or task implementations, you MUST verify the current git branch. If the current branch is not `development`, you must inform the user and switch to (or create) the `development` branch before proceeding.

### 9. Centralized Scripts Folder (MANDATE)

**Rule:** All bash/shell scripts MUST be located in the `scripts/` directory at the project root.

- **Action:** Do not co-locate scripts within apps or packages. Use the root `scripts/` folder for all automation, installation, and orchestration scripts to ensure visibility and maintainability.

### 10. Automated Install Script Maintenance (MANDATE)

**Rule:** The `scripts/install-dev.sh` script MUST be kept up to date automatically.

- **Action:** Whenever a new tool, CLI, or system-level dependency is added to the project's requirements (e.g., a new cloud provider CLI or a docker image), you MUST update the installation script to include it. This ensures "Zero to Dev" capability for new environments.

### 11. Feature-Based Folder Structure (MANDATE)

**Rule:** Code within applications (especially `@sous/cli` and `@sous/api`) MUST be organized by Feature or Domain, NOT by technical role.

- **Action:** Do NOT dump files into a flat `src/` directory. Create subdirectories for each major feature/command (e.g., `src/commands/config/`, `src/domains/orders/`).
- **Goal:** Scalability and maintainability through Domain-Driven Design (DDD) principles.

### 12. Comprehensive Testing (MANDATE)

**Rule:** All new features and bug fixes MUST include appropriate tests.

- **Action:**
  - **New Features:** Write unit tests for core logic and, where applicable, E2E tests for critical user flows.
  - **Bug Fixes:** Write a regression test that fails before the fix and passes after.
  - **Pipeline:** Ensure all tests pass via `turbo run test` before considering a task complete.
- **Goal:** Zero regressions and high code confidence.

### 13. Strict "use client" Usage (MANDATE)

**Rule:** The `"use client"` directive MUST ONLY be used when a component requires DOM/Browser APIs or React hooks.

- **Action:** Prioritize Next.js Server Components. Only add `"use client"` if the component uses `useState`, `useEffect`, `useContext`, or interacts with browser globals like `window` or `document`.
- Goal: Reduce client-side bundle size and leverage server-side rendering benefits.

### 14. Nested Domain-Driven Design (MANDATE)

**Rule:** Applications MUST organize source code using "Strategic Umbrellas" within a `domains/` directory.

- **Action:** Instead of flat folders, group related tactical features under strategic themes (e.g., `src/domains/procurement/invoices/`).
- File Types: Each tactical folder should contain its own `.module.ts`, `.service.ts`, `.controller.ts`, and `.schema.ts` (Drizzle).
- **Goal:** Improve code discoverability, encapsulation, and scalability as the platform grows.

### 15. The Shell Pattern & Shared Features (MANDATE)

**Rule:** High-level applications (`@sous/web`, `@sous/native`) MUST be treated as thin "Shells."

- **Action:**
  - Move all complex UI ("Organisms"), business logic (Hooks), and Server Actions into the `@sous/features` package.
  - Organize `@sous/features` using the Nested DDD mandate.
  - Apps should only contain Routing, Platform-specific Glue, and Initialization logic.
- **Goal:** Achieve 90%+ code reuse and maintain feature parity across platforms.

### 16. CLI Command Aggregation (MANDATE)

**Rule:** ALL management, maintenance, and operational scripts MUST be provided in the respective `package.json` of apps/packages and aggregated into `@sous/cli`.

- **Action:**
  - Apps and packages must define granular scripts (e.g., `db:migrate`, `cache:clear`).
  - `@sous/cli` must provide a corresponding subcommand that acts as a wrapper for these granular scripts using `pnpm --filter`.
- **Goal:** Provide a single entry point (`sous`) for all developer operations and ensure all tasks are documented and accessible via the CLI.

### 17. Build Artifact Exclusion (MANDATE)

**Rule:** Documentation, context files, and internal development tools (specifically `@.gemini/**`) MUST be excluded from all production build artifacts, Docker images, and published packages.

- **Action:**
  - Maintain `.dockerignore` files to exclude `@.gemini/` and `.git/`.
  - Use the `files` field in `package.json` to explicitly white-list only necessary runtime files.
  - Ensure CI/CD pipelines do not bundle these directories into deployable units.
- Goal: Minimize artifact size and prevent the leakage of internal architectural context or developer "memories" to production.

### 18. Development Branch Isolation (MANDATE)

**Rule:** The `development` branch MUST NEVER be deployed to any cloud providers (Vercel, Render, Supabase, etc.) for staging or production.

- **Action:**
  - Configure cloud provider settings to ONLY trigger builds from `main` or `staging` branches.
  - Development work should be merged into `staging` or `main` only after full local verification.
- **Goal:** Conserve build minutes and prevent unstable code from interrupting staging or production workflows.

### 19. Specification & ADR Adherence (MANDATE)

**Rule:** Implementations MUST strictly adhere to the technical specifications and Architectural Decision Records (ADRs) defined in the project.

- **Action:** Before starting any implementation, verify the presence of a corresponding spec file in `.gemini/specs/` and any relevant ADRs in `.gemini/docs/ADRs/`. The final code must closely reflect the logic, structure, and constraints outlined in these documents.
- **Goal:** Maintain architectural integrity and ensure that high-level designs are correctly translated into code.

### 20. App Template Synchronization (MANDATE)

**Rule:** All application templates MUST be kept in sync with their canonical implementations.

- **Action:**
  - Any time a structural fix, configuration update, or dependency upgrade is applied to a live app that is derived from a template (e.g., `@sous/web`), you MUST apply the same change to the corresponding template in `packages/templates/`.
  - This ensures that newly generated applications inherit the latest best practices and fixes.
- **Goal:** Prevent drift between the "ideal" app structure and new apps.

### 22. Headless CLI Mandate (MANDATE)

**Rule:** ALL commands in `@sous/cli` MUST support a headless mode (e.g., `--json` or `--raw` flag) that produces machine-readable output.

- **Action:**
  - When creating or refactoring a CLI command, ensure it can output data in a format suitable for consumption by an AI agent or automated script without the need for an interactive TUI.
  - The `ProcessManager` and other core services should be queryable via the CLI in a non-interactive way.
- **Goal:** Ensure the AI agent and the developer use the exact same toolchain to manage the system, ensuring synchronization and consistency.

### 23. Non-Streaming Logs Mandate (MANDATE)

**Rule:** ALL `pm2 logs` commands MUST include the `--nostream` flag.

- **Action:** When inspecting logs, never use the default streaming mode. Always use `pm2 logs --nostream` or `pm2 logs <app> --nostream` along with `--lines <number>` if necessary.
- **Goal:** Prevent the agent from getting stuck in a long-running tail process and ensure predictable tool termination.

### 25. Next.js Conventions Mandate (MANDATE)

**Rule:** Applications MUST utilize Next.js standard files for state management and user experience.

- **Action (Loading):** Every page or route group MUST provide a `loading.tsx` file that implements a visual skeleton or loading state.
- **Exception:** `loading.tsx` is an exception to the Controller-View pattern; it is acceptable to build the UI directly within this file to ensure fast, low-overhead initial paints.
- **Action (Not Found):** Every route that uses dynamic parameters (e.g., `[id]`) MUST utilize `not-found.tsx`. Controllers should trigger this via `notFound()` from `next/navigation` if a requested resource does not exist.
- **Goal:** Provide a consistent, high-fidelity user experience with instant feedback and graceful error handling.

### 26. Design System Adherence (MANDATE)

**Rule:** ALL UI components and views MUST strictly adhere to the established design system tokens and conventions defined in `@sous/ui`.

- **Action (Semantic Colors):** Hardcoding Tailwind color scales (e.g., `bg-blue-500`, `text-zinc-400`) is FORBIDDEN. Use semantic tokens ONLY (e.g., `bg-primary`, `text-muted-foreground`, `border-border`).
- **Action (Radius):** Hardcoding specific pixel or fixed Tailwind radius values (e.g., `rounded-[10px]`, `rounded-xl`) is FORBIDDEN. Use standardized tokens (`rounded-lg`, `rounded-md`, `rounded-sm`) which map to the global `--radius` variable.
- **Action (Fonts):** Font variable names MUST NOT be hardcoded as strings. Use the centralized constants exported from `@sous/ui` (e.g., `FONT_SANS_VAR`, `FONT_BRAND_VAR`).
- **Action (Icons):** Icons MUST use semantic color classes and consistent sizing tokens (`size-4`, `size-5`) to maintain visual harmony.
- **Goal:** Ensure the UI remains modern, visually consistent, and 100% themeable via centralized variables in `@sous/ui`.

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
  - `@sous/cli` (NestJS CLI / Dev Tools)
  - `@sous/wearos` (Native Wear OS)
  - `@sous/docs` (Next.js Documentation)
- **Packages:**
  - `@sous/client-sdk`: Generated client SDK.
  - `@sous/config`: Centralized configuration.
  - `@sous/eslint-config`: Shared ESLint config.
  - `@sous/logger`: Centralized logger.
  - `@sous/typescript-config`: Shared TS config.
  - `@sous/ui`: UI component library.
