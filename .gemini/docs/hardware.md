# Hardware

## Computing & Infrastructure

- **Primary Development Host**: Windows 11 Pro (WSL2 Ubuntu 22.04).
- **Staging Signage Node**: Raspberry Pi 4B (Running Emteria.OS).
- **Development Signage Node**: Redroid Docker Container (Android 11).
- **Mobile Staging Devices**:
  - Physical Android Phone (Pixel/Samsung).
  - Physical Android Tablet (KDS Staging).
  - Samsung Galaxy Watch (Wear OS Staging).

## WSL-Windows Interop

The development environment utilizes a custom **Sous Windows Agent** running on the host machine to bypass WSL interop bridge hangs.

### Firewall Configuration

The following commands must be run in **Windows PowerShell (Admin)** to allow the WSL environment to communicate with the Windows host for emulator management and ADB:

```powershell
# Allow Sous Agent communication
New-NetFirewallRule -DisplayName 'Sous Agent (TCP-In)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4040

# Allow Android ADB (Remote server access)
New-NetFirewallRule -DisplayName 'Android ADB (TCP-In)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5037
```

### Port Assignments

| Service               | Port | Environment  |
| :-------------------- | :--- | :----------- |
| Sous Agent            | 4040 | Windows Host |
| ADB Server            | 5037 | Windows Host |
| Wear OS Emulator      | 5562 | Windows Host |
| KDS Emulator          | 5560 | Windows Host |
| POS Emulator          | 5556 | Windows Host |
| Tools/Mobile Emulator | 5558 | Windows Host |
| Signage Emulator      | 5554 | Windows Host |

## Peripherals

- **Printers**: ESC/POS thermal printers (Connected via network/Bluetooth, managed via Capacitor plugins or browser Print APIs).
- **Thermometers**: BLE thermometers (Connected via Capacitor BLE plugins on mobile nodes).
