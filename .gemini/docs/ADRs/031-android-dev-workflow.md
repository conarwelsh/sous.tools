# ADR 031: Hybrid WSL2-Windows Android Development

## Status

Decided

## Date

2026-02-05

## Context

The codebase resides in WSL2 (Ubuntu) for performance and consistency with the backend/CLI environment. However, Android Emulators and physical device USB drivers perform significantly better or are only available on the Windows host. We need a way to build Android apps (Tauri and Wear OS) inside WSL2 while debugging on Windows-hosted emulators or physical devices.

### Identified Problems:

1. **Binary/Path Collision**: Tauri discovery logic searches for "Android Studio" but finds the Windows directory instead of a binary, throwing `Permission Denied`.
2. **Network Isolation**: WSL2 cannot see Windows-hosted emulators (localhost:5037) without an explicit socket bridge.
3. **ADB Version Mismatch**: Conflicts between Linux and Windows ADB daemons cause crashes.

## Decision

We will adopt an **Automated Hybrid Bridge** approach managed by `@sous/cli`:

1.  **Build Environment:** All compilation (Gradle, Rust/Tauri) occurs inside WSL2 to avoid cross-OS filesystem overhead.
2.  **SDKs:** Android SDK and JDK 17+ are installed inside WSL2.
3.  **Global ADB Bridge:** WSL2 is configured to use the Windows host's ADB server as the master socket via `ADB_SERVER_SOCKET=tcp:$WIN_IP:5037`. This requires the Windows ADB server to be started with `-a` (e.g., `adb -a nodaemon server start`).
4.  **Path Sanitization:** The CLI dev tools (`sous dev`) automatically strips Windows `/mnt/c/` paths from the environment during Android-target builds to prevent "Android Studio" folder collisions.
5.  **Automated Emulator Management:** The CLI automatically detects if an emulator is running on the host. If not, it launches the Windows-native `emulator.exe` and waits for it to become available before starting the build.
6.  **Centralized Configuration:** All bridge settings (WIN_IP, ADB_SERVER_SOCKET) are managed via `~/.sous/shell/zshrc`.

## Consequences

- **Pros:**
  - Zero manual path cleaning required for developers.
  - Near-native build speeds inside Linux.
  - High-performance hardware-accelerated emulators on Windows.
- **Cons:**
  - Requires ADB server on Windows to be reachable (firewall/all interfaces).
- **Complexity:** CLI must maintain exact paths to Windows emulator binaries (configurable).
