# ADR 011: Hybrid WSL2-Windows Android Development

## Status
Proposed

## Context
The codebase resides in WSL2 (Ubuntu) for performance and consistency with the backend/CLI environment. However, Android Emulators and physical device USB drivers perform significantly better or are only available on the Windows host. We need a way to build Android apps (Tauri and Wear OS) inside WSL2 while debugging on Windows-hosted emulators or physical devices.

## Decision
We will adopt a "Hybrid Bridge" approach:
1.  **Build Environment:** All compilation (Gradle, Rust/Tauri) occurs inside WSL2 to avoid cross-OS filesystem overhead.
2.  **SDKs:** Android SDK and JDK 17+ must be installed inside WSL2.
3.  **ADB Bridge:** WSL2 will be configured to use the Windows host's ADB server via a symlink to `adb.exe`. This allows `adb devices` in WSL2 to see emulators running on Windows.
4.  **IDE:** Android Studio on Windows will open projects via `\wsl$` paths.
5.  **Physical Devices:** Use `usbipd-win` to attach USB devices from Windows to WSL2.
6.  **Resource Management:** A `.wslconfig` file will be mandated on the host to manage RAM allocation.

## Consequences
- **Pros:** Near-native build speeds inside Linux; high-performance hardware-accelerated emulators on Windows.
- **Cons:** Requires manual setup of the ADB bridge and `usbipd-win`.
- **Complexity:** Developers must maintain dual SDK components (Windows for Emulator/Studio, WSL2 for CLI builds).
