# Spec 003: Robust Dev Orchestrator (Ink TUI)

## Objective
Implement a robust, interactive Terminal User Interface (TUI) for the `sous dev` command using **React Ink**. This replaces the fragile Zellij/Tmux orchestration with a centrally managed, auto-restarting, and interactive dashboard.

## Features
- **Fullscreen Dashboard:** Occupies the entire terminal buffer (alt-screen).
- **Tabbed Navigation:** Use `Tab` or Mouse Click to switch between views:
    - **Dashboard (Apps):** Individual service status and logs.
    - **God View:** Aggregated, real-time log stream from ALL services (Apps + Docker).
    - **Infra:** Docker Compose service management (Postgres, Redis, etc.).
    - **RPi:** Remote Raspberry Pi node management and log tailing.
- **Filterable God View:** Press `/` to search/filter the aggregated log stream in real-time.
- **Mouse Interaction:** Support clicking on Tabs and Panels to focus or select.
- **Central Process Management:** Start, stop, and restart all 8 apps.
- **Interactive Terminal Panel:** Dedicated area for one-off commands (Cmd + K or `:`).
- **Visual "Traffic Lights":** OKLCH-mapped status icons (●).
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
