# ADR 043: WSL-Windows Bridge Recovery & Health Strategy

## Status
Accepted

## Date
2026-02-08

## Context
The project relies on a WSL-to-Windows interop bridge to launch Android Emulators and execute Windows-based ADB commands. This bridge frequently hangs or becomes unresponsive, leading to "hanging" development environments where processes spawn but never return output, frustrating developers and breaking automated orchestration.

## Decision
We have implemented a "Proactive Bridge Health Check" in the development dev tools (`scripts/dev-tools.ts`).

1.  **Heartbeat Detection**: Before attempting any Windows-based command (via `/mnt/c/...`), the dev tools performs a low-overhead health check (`cmd.exe /c echo healthcheck`) with a 3-second timeout.
2.  **Graceful Abort**: If the health check fails or times out, the dev tools aborts the specific app startup (e.g., Wear OS) and logs a high-visibility error message directing the user to restart the WSL bridge (`wsl --shutdown`).
3.  **Automatic Emulator Management**: For apps requiring an emulator, the dev tools handles the launch logic internally, ensuring the bridge is healthy before spawning the detached process.

## Consequences
- **Positive**: Prevents silent hangs in the development environment. Provides actionable feedback to the developer. Centralizes the logic for Windows interop.
- **Negative**: Adds a slight delay (latency of the heartbeat check) to process startup.
