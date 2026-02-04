# Spec 003: Robust Dev Orchestrator (Ink TUI)

## Objective
Implement a robust, interactive Terminal User Interface (TUI) for the `sous dev` command using **React Ink**. This replaces the fragile Zellij/Tmux orchestration with a centrally managed, auto-restarting, and interactive dashboard.

## Features
- **Fullscreen Dashboard:** Occupies the entire terminal buffer (alt-screen) for a clean, distraction-free view.
- **Central Process Management:** Start, stop, and restart all 8 apps (`web`, `api`, `docs`, `native`, `headless`, `kds`, `pos`, `wearos`).
- **Auto-Start Core:** `api`, `web`, and `docs` start automatically on launch.
- **Docker Orchestration:** Real-time status indicators and start/stop controls for Docker Compose services.
- **Interactive Terminal Panel:** A dedicated area for running one-off shell commands without leaving the orchestrator.
- **Visual Status "Traffic Lights":** Use brand-aligned icons (●) with OKLCH-mapped colors (Green/Red/Yellow).
- **RPi Edge Integration:** One-click "Sync and Start" for Raspberry Pi nodes.
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
