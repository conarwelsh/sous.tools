# Spec 020: Windows Agent Integration

## Status: Completed
## Strategic Umbrella: Tooling & DX

## 1. Context & Problem Statement
The Windows Agent handles the WSL-to-Windows bridge (ADB, Emulators, Window Management). Currently, it is manually installed and updated via copy-paste, which is brittle and slow.

## 2. Goals & Objectives
- **Zero-Manual-Install**: Automate the setup of the Windows Agent from the `@sous/cli`.
- **Live Updates**: Instead of copying files, the agent should ideally reference the files on the WSL partition (`/mnt/c/`) so changes in WSL are instantly reflected in the running Windows process.
- **Deeper Automation**: Expand features to include system metrics, clipboard sync, and more robust window positioning.

## 3. Architecture

### 3.1 CLI-Managed Lifecycle
- `sous dev install agent`:
    - Create a startup shortcut in Windows (`shell:startup`).
    - Configure the Windows firewall to allow the agent port (4040).
    - Set up the bridge to use `/mnt/c/` paths for scripts and assets.

### 3.2 Feature Expansion
- **Clipboard Sync**: Automatically sync the WSL clipboard with the Windows host for easier debugging.
- **ADB Automation**: Integrated "Emulator Doctor" that can detect and fix common ADB hang issues on the Windows host.
- **Host Metrics**: Feed Windows host CPU/GPU/RAM metrics back into the Sous Dev Tools "Infra" tab.
- **Proxying**: Ability to route traffic through the Windows host if certain local network resources are only reachable from the Windows side.
- **Auto-Update**: The agent checks for hash changes in the WSL source files and restarts itself if necessary.

## 4. Proposed Features
- **Remote Screenshot**: Ability to capture a screenshot of a specific Android Emulator window and save it to the monorepo's `.tmp` folder for AI analysis.
- **Input Injection**: Inject keyboard or touch events into emulators via the agent API.

## 5. Implementation Plan
1. **Automated Installer**: Create a PowerShell script triggered by `@sous/cli` that handles the Windows-side setup.
2. **Path Mapping**: Update the agent to look for its source files in `/mnt/c/home/conar/sous.tools/...` to ensure live updates.
3. **Tray Application**: Enhance the PowerShell tray script (`sous-tray.ps1`) to provide more status feedback.
