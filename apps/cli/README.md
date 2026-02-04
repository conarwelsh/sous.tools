# @sous/cli

The command-line orchestrator for the `sous.tools` platform.

## Features
- **Development Orchestration**: `sous dev` (launches Zellij with all services).
- **Log Management**: `sous logs tail` and `sous logs wipe`.
- **Infrastructure Setup**: `sous install` (manages environment dependencies).
- **Quality Checks**: `sous check` (lint, typecheck, test, build).
- **Maintenance**: `sous housekeep` (clean workspace artifacts).

## Installation & Setup

### Shell Customization (Recommended)
To align your terminal with the `sous.tools` brand and enable productivity aliases, run:
```bash
pnpm sous install shell
```
This will configure your ZSH environment with brand-aligned prompts and useful shortcuts.

## Standard Aliases
When the `@sous` shell customization is installed, the following aliases are available:

### Platform Commands
| Alias | Command | Description |
|---|---|---|
| `sous` | `pnpm -w sous` | Run the CLI from any subdirectory |
| `sd` | `sous dev` | Start development environment |
| `sl` | `sous logs tail` | Tail centralized logs |
| `sw` | `sous logs wipe` | Wipe centralized logs |
| `sc` | `sous check` | Run full platform health check |
| `si` | `sous install` | Run installation wizard |

### Productivity Shortcuts
| Alias | Command | Description |
|---|---|---|
| `c` | `clear` | Clear terminal |
| `ls` | `ls -lah` | List all files with details and sizes |
| `ni` | `pnpm install` | Quick install |
| `nx` | `pnpm exec` | Quick execute |
| `..` | `cd ..` | Go up one level |
| `...` | `cd ../..` | Go up two levels |

## Tech Stack
- NestJS (Nest Commander)
- TypeScript
- Zellij (Multiplexer)
- Ink (TUI - Planned)

## Related ADRs
- [ADR 008: CLI Orchestrator Strategy](../../.gemini/docs/ADRs/008-cli-orchestrator-strategy.md)
- [ADR 039: CLI-Driven ZSH Customization](../../.gemini/docs/ADRs/039-cli-zsh-customization.md)