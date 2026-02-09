# @sous/cli

The command-line orchestrator for the `sous.tools` platform.

## Strategic Umbrellas

The CLI is organized into strategic domains following the **Nested DDD** mandate:

### 1. Development (`sous dev`)

Manages the local development lifecycle and hardware integration.

- `sous dev`: Launches the interactive multi-service dev dashboard (Ink TUI).
- `sous dev install`: Runs the platform installation wizard.
- `sous dev sync`: Synchronizes local schemas and hardware state.

### 2. Infrastructure (`sous env`)

Manages environment variables, secrets, and logs.

- `sous env config`: View or add environment configurations (Infisical).
- `sous env logs`: View or wipe centralized platform logs.

### 3. Quality (`sous quality`)

Enforces code standards and runs validation suites.

- `sous quality test`: Runs the unit and integration test suites.
- `sous quality check`: Runs a full health check (lint, typecheck, test, build).

### 4. Maintenance (`sous maintenance`)

Handles system cleanup and workspace health.

- `sous maintenance housekeep`: Deep cleans build artifacts and caches.
- `sous maintenance db push`: Pushes schema changes to the database.

## Installation & Setup

### Shell Customization (Recommended)

To align your terminal with the `sous.tools` brand and enable productivity aliases, run:

```bash
pnpm sous dev install shell
```

This will configure your ZSH environment with brand-aligned prompts and useful shortcuts.

## Standard Aliases

When the `@sous` shell customization is installed, the following aliases are available:

### Platform Commands

| Alias  | Target Command               | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| `sous` | `pnpm -w sous`               | Run the CLI from any subdirectory |
| `sd`   | `sous dev`                   | Start development environment     |
| `si`   | `sous dev install`           | Run installation wizard           |
| `ss`   | `sous dev sync`              | Sync schemas/hardware             |
| `st`   | `cd ~/sous.tools`            | Quick jump to project root        |
| `sl`   | `sous env logs tail`         | Tail centralized logs             |
| `sw`   | `sous env logs wipe`         | Wipe centralized logs             |
| `sq`   | `sous quality check`         | Run full health check             |
| `sm`   | `sous maintenance housekeep` | Deep clean workspace              |
| `smdb` | `sous maintenance db push`   | Push schema to database           |

### Productivity Shortcuts

| Alias | Command                | Description                 |
| ----- | ---------------------- | --------------------------- |
| `c`   | `clear`                | Clear terminal              |
| `ls`  | `ls -lah --color=auto` | List all files with details |
| `ni`  | `pnpm install`         | Quick install               |
| `nx`  | `pnpm exec`            | Quick execute               |
| `..`  | `cd ..`                | Go up one level             |
| `...` | `cd ../..`             | Go up two levels            |

## Tech Stack

- NestJS (Nest Commander)
- TypeScript
- Ink (Interactive TUI)

## Related ADRs

- [ADR 008: CLI Orchestrator Strategy](../../.gemini/docs/ADRs/008-cli-orchestrator-strategy.md)
- [ADR 039: CLI-Driven ZSH Customization](../../.gemini/docs/ADRs/039-cli-zsh-customization.md)
