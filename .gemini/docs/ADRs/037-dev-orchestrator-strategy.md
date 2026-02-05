# ADR 037: Robust Dev Orchestrator Strategy

## Status
Proposed

## Date
2026-02-04

## Context
The current `sous dev` command relies on external terminal multiplexers which are difficult to manage programmatically, lead to ghost processes, and lack interactive "dashboard" capabilities (like buttons for common tasks). We need a development environment that is "absurdly robust."

## Decision
We will replace the multiplexer-based orchestration with a custom **TUI (Terminal User Interface) Dashboard** built using **React Ink**.

### 1. The Core: Process Management
- **Library:** We will use **`concurrently`** or a custom wrapper around `child_process.spawn` to manage child processes.
- **Robustness:** 
    - **Auto-Restart:** Optional "Watch" mode that restarts a process if it crashes with a non-zero exit code.
    - **Cleanup:** A mandatory `process.on('exit')` hook that ensures all SIGKILLs are sent to child process groups to prevent "ghost processes."

### 2. The UI: React Ink Dashboard
- **Layout:**
    - **Sidebar:** Live list of all apps/packages AND **Docker Compose Services** with status indicators (Running, Stopped, Crashing, Building).
    - **Main View:** A "God-View" log aggregator.
    - **Footer:** Interactive key-mappings (Buttons).
- **Interactive "Buttons" (Hotkeys):**
    - `r`: Restart highlighted process (App or Docker).
    - `s`: Stop/Start highlighted process.
    - `d`: Trigger `sous db reset`.
...
### 3. Integrated Log Management
- Instead of raw piping, the dashboard will consume JSON logs from `@sous/logger` and **stream logs from Docker Compose** to provide a unified experience.
- **Remote RPi Logs:** For devices on the local network (e.g., Raspberry Pi), the orchestrator will support SSH-based log tailing, allowing RPi logs to appear alongside local application logs in the "God-View."

### 4. Edge Development Orchestration
To support physical hardware development, the orchestrator will include:
- **One-Click RPi Start:** A specialized action that handles `pnpm sous dev sync` to the RPi and initiates the dev process on the remote device in a single step.
- **Remote Management:** Start/Stop/Restart commands issued from the TUI to the RPi via the Real-time Gateway or SSH.

## Consequences
- **Positive:**
    - **Developer Experience:** A single, interactive, and beautiful terminal dashboard.
    - **Reliability:** No more manual terminal session cleaning.
    - **Extensibility:** Easy to add new "Buttons" or status checks as the monorepo grows.
- **Negative:**
    - **Complexity:** Building a custom TUI requires more upfront development than a layout file.
    - **Performance:** React Ink has a small CPU overhead compared to raw shell scripts.
