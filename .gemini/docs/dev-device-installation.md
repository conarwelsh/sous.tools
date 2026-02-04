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

## 2. ADB Bridge (CRITICAL)
For WSL2 to "see" your Windows-hosted emulators, you must link the `adb` command to the Windows executable. The `install-dev.sh` script attempts this, but you may need to do it manually:
```bash
# Locate your Windows ADB (usually in Android SDK platform-tools)
sudo ln -sf "/mnt/c/Users/<YOUR_USER>/AppData/Local/Android/Sdk/platform-tools/adb.exe" /usr/local/bin/adb
```
Verify with: `adb devices`. You should see `emulator-5554` (if running).

## 3. Host Resource Management (.wslconfig)
Create/Edit `%USERPROFILE%\.wslconfig` in Windows:
```ini
[wsl2]
memory=16GB    # Limit WSL2 RAM so Windows has room for emulators
processors=8
```

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
