# Spec 018: Sous Dev Tools (Process Manager & Dashboard)

## Status: Completed

## Strategic Umbrella: Tooling & DX

## 1. Context & Problem Statement

The current development environment relies on a fragmented set of scripts and a prototype "orchestrator" that is often unreliable. Developers need a centralized, robust, and interactive way to manage the SOUS ecosystem (API, Web, Docs, Mobile, and Infrastructure) that persists across sessions and allows both human developers and AI agents to interact with the same process state.

## 2. Goals & Objectives

- **Rename**: Transition "Dev Orchestrator" to "Sous Dev Tools" across the codebase.
- **Unified Process Management**: Use PM2 as the single source of truth for process lifecycle.
- **Persistence**: Managed processes should continue running in the background even if the dashboard is closed.
- **Shared State**: AI agents (Gemini) and humans must be able to see and control the same PM2 instances.
- **Automated Mobile DX**: Seamlessly handle emulator launching, APK building, and installation.
- **High-Fidelity Feedback**: Real-time logs and accurate "traffic light" status indicators (including "Building/Starting" states).
- **Environment Management**: Toggle UI to monitor Health/Logs for Dev, Staging, and Production.
- **Logic Consolidation**: Migrate weight from `scripts/` folder into `@sous/cli`, using `package.json` scripts as the tactical layer.

## 3. Architecture

### 3.1 Core Process Management (PM2)

- All services are registered as PM2 processes with the prefix `sous-`.
- The CLI acts as a wrapper around the PM2 API.
- **Headless Mode Mandate**: All AI agents (e.g., Gemini-CLI) MUST interact with the headless version (`--headless`) of Sous Dev Tools. This ensures non-interactive, predictable execution and prevents "hanging" on interactive prompts.
- **Automated Cleanup**: Dev/Build commands in headless mode must ensure clean exit after task completion.

### 3.2 Mobile Integration

- Automate the Windows Agent bridge for Android emulators.
- Handle `adb` discovery and port forwarding automatically.

### 3.3 Dashboard (TUI)

- **Tabs**:
  - **Services**: Service list + filtered logs + status.
  - **Combined**: Global log stream with filtering.
  - **Infra**: System metrics + health of Dev/Staging/Prod environments.
- **Environment Switching**: UI toggle (shortcut `[e]`) to switch focus between Dev, Staging, and Production views.
- **Cloud Integration**: Incorporate `vercel logs` and `render logs` streams into the dashboard for remote environment visibility.

## 4. Proposed Features (Recommendations)

- **Dependency Awareness**: Starting a frontend service should optionally ensure the backend is running.
- **Resource Monitoring**: Display CPU and RAM usage per PM2 process.
- **Health Check Polling**: Actively poll `/health` endpoints of all environments.
- **Log Search (Regex)**: Support regular expressions in filters.

## 5. Mandates

- **AI Tool Interaction**: Gemini-CLI MUST always use the headless mode of Sous Dev Tools to avoid interactive lock-ups.
- **Script Migration**: No new logic should be added to the `scripts/` folder if it can be implemented within `@sous/cli`.

## 6. Implementation Plan

1. **Headless Refinement**: Ensure `--headless` outputs clean, terminated logs for AI consumption.
2. **Cloud Bridge**: Integrate Vercel/Render CLI for log tailing in the TUI.
3. **Environment Toggle**: Add logic to switch the "Infra" and "Log" views between remote environments.
4. **Logic Migration**: Progressively move `scripts/*.sh` logic into `ProcessManager` commands.
