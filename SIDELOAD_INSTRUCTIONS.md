# Sideloading Guide for Sous Tools

## 1. Download Artifacts

Go to the **Actions** tab in the GitHub repository, select the latest successful run of the **Build All Native Flavors** workflow (Staging), and download the artifact corresponding to your target device:

- `signage-apk` (Digital Signage / TV)
- `pos-apk` (Point of Sale / Tablet)
- `kds-apk` (Kitchen Display System / Touch Screen)
- `wearos-apk` (Watch)

## 2. Connect Device

Ensure **USB Debugging** is enabled on your Android device (Settings > Developer Options).

**Via USB:**
Connect the device to your PC.

**Via Network (ADB):**

```bash
adb connect <DEVICE_IP>:5555
```

## 3. Install

Run the following command for the downloaded APK. The `-r` flag ensures it upgrades existing installations without losing data, and `-d` allows downgrading if necessary.

```bash
# Signage
adb install -r -d app-signage-debug.apk

# POS
adb install -r -d app-pos-debug.apk

# KDS
adb install -r -d app-kds-debug.apk

# WearOS
adb install -r -d wearos-debug.apk
```

## 4. Troubleshooting

If installation fails with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, uninstall the old version first:

```bash
# Signage
adb uninstall com.sous.tools.signage

# POS
adb uninstall com.sous.tools.pos

# KDS
adb uninstall com.sous.tools.kds
```
