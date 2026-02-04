# ADR 008: CLI Orchestrator Strategy (@sous/cli)

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
    - `sous db [wipe|migrate|seed|reset]`
    - `sous dev [--multiplexer=zellij|tmux]`
    - `sous logs [--env=prod|staging|dev]` (Reference ADR 003)
    - `sous cloud [deploy|status]`
- **Delegation:** The CLI will act as a wrapper around `pnpm` workspace commands. 
    - *Example:* `sous db wipe` executes `pnpm --filter @sous/api run db:wipe`.

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

#### **General**
- `sous`: Displays the brand ASCII banner and a welcome message.
- `sous housekeeping`: Deep cleans the monorepo by deleting all `node_modules`, `.next`, `dist`, and `.turbo` folders.
- `sous cache clear`: Clears all TurboRepo and package manager caches.

#### **Development (`sous dev`)**
- `sous dev`: Starts the multiplexed (Zellij/Tmux) development environment.
  - **Flags:** `--multiplexer=[zellij|tmux]`.
  - **Panels:** `@sous/api`, `@sous/web`, `gemini-cli`.
  - **Suspended Panels:** `ios`, `android` (opt-in).

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
*Example:* `sous db wipe` -> `pnpm --filter @sous/api run db:wipe`.

## Consequences
- **Positive:**
    - Standardized DX across the team.
    - Prevents accidental production data loss.
    - Extremely fast onboarding for new developers (`git clone` -> `pnpm install` -> `sous dev`).
- **Negative:**
    - **Multiplexer Dependency:** Requires users to have Zellij or Tmux installed on their local machine.
    - **Process Management Complexity:** Ensuring 100% cleanup of ghost processes across different OS environments can be challenging.

## Research & Implementation Plan

### Research
- **Nest Commander:** Provides a familiar NestJS dependency injection system for building CLI commands.
- **Zellij/Tmux:** Evaluated Zellij as the modern, Rust-based alternative for terminal multiplexing in dev.

### Implementation Plan
1. **Core CLI:** Initialize `@sous/cli` with `nest-commander`.
2. **Orchestrator Command:** Implement `sous dev` which:
    - Checks for dependencies (Docker, Zellij).
    - Starts the backend infra (Postgres, Redis).
    - Launches a Zellij session with tabbed panes for each app.
3. **Housekeeping:** Implement cleanup commands for `node_modules` and caches.
4. **Interactive DB Tools:** Create the `sous db` command suite for migrations and seeding.
