# Spec 003: Robust Dev Orchestrator (Ink TUI)

## Objective
Implement a robust, interactive Terminal User Interface (TUI) for the `sous dev` command using **React Ink**. This replaces the fragile Zellij/Tmux orchestration with a centrally managed, auto-restarting, and interactive dashboard.

## Features
- **Central Process Management:** Start, stop, and restart apps (`web`, `api`, `native`, `docs`) from one view.
- **Docker Orchestration:** Real-time status indicators and start/stop controls for Docker Compose services (Postgres, Redis, etc.).
- **RPi Edge Integration:** One-click "Sync and Start" for Raspberry Pi nodes on the local network, including SSH-based log aggregation.
- **Interactive Hotkeys:** 
...
### 1. The `ProcessManager` Service
A core TypeScript class in `@sous/cli` that:
- Uses `tree-kill` to ensure process groups are terminated.
- Uses the `docker-compose` Node.js wrapper to query and control local infrastructure.
- Uses `ssh2` or a similar library to tail logs and issue commands to RPi nodes.
- Maintains a `status` state for each process.

### 2. The TUI Components (React Ink)
- `<Dashboard />`: Top-level layout.
- `<Sidebar />`: Lists apps and their current status (Green/Red indicators).
- `<LogView />`: Scrollable, filtered log window.
- `<StatusBar />`: Displays available hotkeys and global system health.

## Implementation Plan

### Step 1: Dependencies
Add required libraries to `@sous/cli`:
```bash
pnpm --filter @sous/cli add ink react tree-kill concurrently chalk
```

### Step 2: Core Manager
Implement `src/commands/dev/process-manager.service.ts` to handle the logic of spawning and killing app groups.

### Step 3: TUI Implementation
Implement the React components in `src/commands/dev/ui/` using Ink.

### Step 4: CLI Integration
Update `src/commands/dev/dev.command.ts` to initialize the `ProcessManager` and render the Ink `<Dashboard />`.

## Free-Tier Considerations
- None. This is a local DX improvement.
