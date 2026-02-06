# Android Device & Emulator Installation

This guide covers the "Hybrid" setup required to build Android apps (Tauri, Wear OS) inside WSL2 while running emulators and hardware on the Windows host.

## Prerequisites
- **Host OS:** Windows 11 with WSL2 (Ubuntu).
- **Android Studio:** Installed on Windows.
- **usbipd-win:** Installed on Windows (`winget install --interactive usbipd-win`).

## 1. WSL2 Setup
Run the project's install script to set up Java and the Android SDK inside WSL2:
```bash
./scripts/install-dev.sh
```

## 2. ADB Bridge (Automated)
The platform now handles the ADB bridge automatically. For it to work, you must ensure the Windows ADB server is listening on all interfaces:

**Windows (Command Prompt):**
```cmd
adb -a nodaemon server start
```
*Note: You may need to allow this through the Windows Firewall.*

The `@sous/cli` will detect your Windows IP and connect WSL2 to this server via the `ADB_SERVER_SOCKET` environment variable.

## 3. Emulator Management
The orchestrator (`sous dev`) will automatically launch the preferred emulator if none are detected. You can configure the AVD name in `apps/cli/src/commands/dev/process-manager.service.ts`.

## 4. Path Sanitization
To avoid collisions with the Windows "Android Studio" directory, the CLI automatically strips `/mnt/c/` from the `$PATH` during Android builds. You do not need to do this manually.

## 4. Physical Device Setup (Hardware)
1. On your Android device, go to **Settings > About Phone**.
2. Find **Build Number** and tap it **7 times**. You will see a toast notification: "You are now a developer!".
3. Go back to **Settings > System > Developer Options**.
4. Enable **USB Debugging**.
5. When you connect the device to your computer, accept the RSA key fingerprint prompt.

## 5. Connecting Physical Devices
1. **Windows (PowerShell Admin):**
   ```powershell
   usbipd list
   usbipd bind --busid <BUSID>
   usbipd attach --wsl --busid <BUSID>
   ```
2. **WSL2:**
   ```bash
   lsusb
   ```

## 6. IDE Setup (Single Window Monorepo)
The project is configured for a **"Single Project"** approach. Instead of opening each app separately, you can open the entire monorepo in one Android Studio window.

1. Open **Android Studio** on Windows.
2. Select **Open**.
3. Paste the WSL path to the **root** of the project: `\\wsl$\Ubuntu\home\<user>\sous.tools`
4. Android Studio will detect the root `settings.gradle.kts` and load all initialized Android modules (Native, WearOS, etc.) into the same window.
5. Modules are grouped under `:apps` (e.g., `:apps:native`).

> **Note on Gradle JVM Warning:** If you see a warning about "Project JDK is invalid or not defined," this is normal for the first sync. The project is pre-configured in `.idea/gradle.xml` to use the **Embedded JDK (JetBrains Runtime)**, which is the recommended approach for Android Studio projects to ensure consistency between WSL and Windows.

## 7. Tauri Android Commands
To run the Tauri app on the emulator:
```bash
cd apps/native
# First time setup
pnpm tauri android init
# Run on emulator
pnpm tauri android dev
```

## 8. Wear OS Setup
The Wear OS app is a native Kotlin project.
1. Use the **Single Window** approach (Section 6) to access the Wear OS module.
2. Ensure a "Wear OS" emulator is created in the Windows Device Manager.
3. Click "Run" in Android Studio and select the `:apps:wearos` module.

## 9. WSL2 GUI Rendering Fixes (Mesa/WebKit Overrides)

If you experience "Blank/White Screen" issues or `MESA-LOADER` errors when running Tauri applications (like `@sous/native-headless`) in WSL2, you must apply the following environment variables. These disable hardware acceleration and the WebKit sandbox, which are often incompatible with the WSL2 GPU bridge.

Add these to your `~/.zshrc` (or they are automatically managed in `~/.sous/shell/zshrc`):

```bash
# Force software rendering and disable hardware acceleration for WSL2 compatibility
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export LIBGL_ALWAYS_SOFTWARE=1

# Disable WebKit Sandbox to prevent startup crashes in containerized environments
export WEBKIT_FORCE_SANDBOX=0

# High-DPI Fix (Ensures UI isn't tiny on Windows High-DPI displays)
export GDK_SCALE=1
export GDK_DPI_SCALE=1
```
