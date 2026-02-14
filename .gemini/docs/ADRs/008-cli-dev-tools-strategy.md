# ADR 008: CLI Dev Tools Strategy (@sous/cli)

## Status

Accepted

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

### 2. Visuals & Branding

- **Banner:** Every command starts with an ASCII art banner of the `sous.tools` logo.
- **Color Coding:**
  - The CLI will use the brand colors defined in `@sous/ui` (via ANSI escape codes).
  - Environment-specific output colors (Success/Green for Dev, Warning/Orange for Staging).

### 3. Safety Mechanisms

- **Confirmations:** Destructive commands (e.g., `db reset`) in non-development environments will require explicit user confirmation.
- **Bypass:** A `-y` or `--yes` flag will be provided for programmatic/CI usage.

### 4. Command List (Status Map)

#### **Development (`sous dev`) [ACTIVE]**

- `sous dev`: Starts the interactive development dashboard (Ink TUI).
- `sous dev install`: Platform installation wizard (Ubuntu/WSL2).
- `sous dev sync`: Hardware/Schema synchronization.

#### **Environment (`sous env`) [ACTIVE]**

- `sous env dashboard`: Infrastructure health dashboard (Spec 004).
- `sous env config`: Secret management (Infisical integration).
- `sous env export`: Inject secrets into shell commands (Spec 019).
- `sous env context`: Identity and target switching (whoami).

#### **Hardware (`sous hardware`) [PLANNED]**

- `sous hardware list`: Paired device overview.
- `sous hardware reboot`: Remote node control.
- `sous hardware logs`: Tail remote RPi logs.

#### **Integrations (`sous integrations`) [PLANNED]**

- `sous integrations sync`: Trigger provider data pulls (Square/Google).

#### **Quality (`sous quality`) [ACTIVE]**

- `sous quality check`: Full platform health check (lint, typecheck, test, build).
- `sous quality test`: Test runner wrapper.

#### **Maintenance (`sous maintenance`) [ACTIVE]**

- `sous maintenance housekeep`: monorepo artifact cleanup.
- `sous maintenance db reset`: database factory reset and seeding.

### 5. Implementation Strategy: The "Wrapper" Pattern

Wherever possible, the CLI will not reimplement logic. It will invoke the corresponding `package.json` script in the target package.
_Example:_ `sous maintenance db reset` -> `pnpm --filter @sous/cli run start -- maintenance db reset`.

## Consequences

- **Positive:**
  - Standardized DX across the team.
  - Prevents accidental production data loss.
  - Extremely fast onboarding for new developers (`git clone` -> `pnpm install` -> `sous dev`).
- **Negative:**
  - **Process Management Complexity:** Ensuring 100% cleanup of ghost processes across different OS environments.

## Research & Implementation Plan

### Research

- **Nest Commander:** Provides a familiar NestJS dependency injection system for building CLI commands.
- **Ink (React):** Evaluated for creating interactive TUI dashboards without external dependencies.

### Implementation Plan

1. **Core CLI:** Initialize `@sous/cli` with `nest-commander`.
2. **Orchestrator Command:** Implement `sous dev` with an interactive Ink-based dashboard.
3. **Housekeeping:** Implement cleanup commands for `node_modules` and caches.
4. **Interactive DB Tools:** Create the `sous maintenance db` command suite for resets and seeding.
