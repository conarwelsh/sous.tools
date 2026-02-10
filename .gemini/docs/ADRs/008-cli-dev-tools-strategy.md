# ADR 008: CLI Dev Tools Strategy (@sous/cli)

## Status

Proposed

## Date

2026-02-03

## Context

As a complex monorepo with multiple apps (Web, API, CLI, Native) and shared packages, we need a unified "Orchestrator" to manage development workflows, database tasks, and cloud operations.

- **Goal:** Minimize the cognitive load for developers by providing a single entry point: `sous`.
- **Requirements:**
  - Domain-Driven subcommand structure.
  - Safety guards for destructive production tasks.
  - Advanced development environment orchestration (Multiplexing).
  - Proper process management to avoid "ghost processes."

## Decision

### 1. Framework & Structure

- **Core:** Built using **NestJS** + **nest-commander** to maintain consistency with the rest of the backend stack.
- **Pattern:** Deeply nested subcommands following a DDD approach.
- **Mandate: Command Aggregation:** Every operational task defined in any package or app's `package.json` MUST be aggregated here. `@sous/cli` serves as the single source of truth for developer operations.
- **Delegation:** The CLI will act as a wrapper around `pnpm` workspace commands.
  - _Example:_ `sous db wipe` executes `pnpm --filter @sous/api run db:wipe`.

### 2. Visuals & Branding

- **Banner:** Every command starts with an ASCII art banner of the `sous.tools` logo.
- **Color Coding:**
  - The CLI will use the brand colors defined in `@sous/ui` (via ANSI escape codes).
  - Environment-specific output colors (Success/Green for Dev, Warning/Orange for Staging).

### 3. Safety Mechanisms

- **Confirmations:** Destructive commands (e.g., `db wipe`) in non-development environments will require explicit user confirmation.
- **Bypass:** A `-y` or `--yes` flag will be provided for programmatic/CI usage.

### 4. Planned Command List (Brainstorming)

This is a living list of commands to be implemented in `@sous/cli`.

#### **Maintenance (`sous maintenance`)**

- `sous maintenance housekeep`: Deep cleans the monorepo by deleting all `node_modules`, `.next`, `dist`, and `.turbo` folders.
- `sous maintenance cache-clear`: Clears all TurboRepo and package manager caches.
- `sous maintenance dead-code`: Scans the monorepo for unused exports and files.
- `sous maintenance unused-packages`: Scans `package.json` files for dependencies that are not imported anywhere in the code.
- `sous maintenance unused-css`: Scans for CSS classes or styles that are defined but never applied in components.

#### **Development (`sous dev`)**

- `sous dev`: Starts the interactive development dashboard (Ink TUI).
  - **Panels:** `@sous/api`, `@sous/web`, `gemini-cli`.
  - **Auto-Restart:** Automatically restarts services on crash or file change.
  - **Integrated Logs:** Centralized "God View" log aggregation.

#### **Database (`sous db`)**

- `sous db migrate`: Runs pending migrations.
- `sous db seed`: Seeds essential system data.
  - **Flags:** `--sampleData` (Adds robust mock data for dev/staging).
- `sous db wipe`: **DESTRUCTIVE**. Drops all tables. Requires confirmation or `-y`.
- `sous db reset`: Convenience command for `wipe` + `migrate` + `seed`.

#### **Logs (`sous logs`)**

- `sous logs`: Tails remote or local logs.
  - **Flags:** `--env=[prod|staging|dev]`.

#### **Cloud & Deployment (`sous cloud`)**

- `sous cloud deploy`: Triggers deployment pipelines.
- `sous cloud status`: Checks the health/status of cloud services (Vercel, Render, Supabase).

### 5. Implementation Strategy: The "Wrapper" Pattern

Wherever possible, the CLI will not reimplement logic. It will invoke the corresponding `package.json` script in the target package.
_Example:_ `sous db wipe` -> `pnpm --filter @sous/api run db:wipe`.

## Consequences

- **Positive:**
  - Standardized DX across the team.
  - Prevents accidental production data loss.
  - Extremely fast onboarding for new developers (`git clone` -> `pnpm install` -> `sous dev`).
- **Negative:**
  - **Process Management Complexity:** Ensuring 100% cleanup of ghost processes across different OS environments can be challenging.

## Research & Implementation Plan

### Research

- **Nest Commander:** Provides a familiar NestJS dependency injection system for building CLI commands.
- **Ink (React):** Evaluated for creating interactive TUI dashboards without external dependencies.

### Implementation Plan

1. **Core CLI:** Initialize `@sous/cli` with `nest-commander`.
2. **Orchestrator Command:** Implement `sous dev` which:
   - Starts the backend infra (Postgres, Redis).
   - Launches an interactive Ink-based dashboard with integrated logs and service management.
3. **Housekeeping:** Implement cleanup commands for `node_modules` and caches.
4. **Interactive DB Tools:** Create the `sous db` command suite for migrations and seeding.
