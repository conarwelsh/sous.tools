#!/bin/bash
set -e

# --- Configuration ---
BASE_IMAGE_URL="https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2024-11-20/2024-11-19-raspios-jazzy-arm64-lite.img.xz"
WORK_DIR=".tmp/rpi-build"
SIGNAGE_APK="apps/web/android/app/build/outputs/apk/signage/debug/app-signage-debug.apk"
OUTPUT_IMAGE="dist/sous-os-rpi4.img"

echo "🥧 Starting Sous OS build for Raspberry Pi..."

# 1. Setup workspace
mkdir -p $WORK_DIR
mkdir -p dist

# 2. Download and Extract Base Image
if [ ! -f "$WORK_DIR/base.img" ]; then
    echo "⬇️  Downloading base Raspberry Pi OS image..."
    curl -L $BASE_IMAGE_URL -o $WORK_DIR/base.img.xz
    echo "📦 Extracting image..."
    xz -d $WORK_DIR/base.img.xz
fi

cp $WORK_DIR/base.img $OUTPUT_IMAGE

# 3. Mount and Inject APK
echo "💉 Injecting Signage APK..."
# Note: This requires 'kpartx' and 'mount' or 'guestfish'
# In CI (Ubuntu), we use guestfish for rootless image manipulation
guestfish -a $OUTPUT_IMAGE <<_EOF
  run
  # Mount the system partition (usually partition 4 in LineageOS RPi images)
  mount /dev/sda4 /
  # Create directory if missing
  mkdir-p /system/priv-app/SousSignage
  # Upload the APK
  upload $SIGNAGE_APK /system/priv-app/SousSignage/Signage.apk
  # Set permissions
  chmod 0644 /system/priv-app/SousSignage/Signage.apk
  # Inject Boot Splash
  upload packages/ui/assets/boot-splash.png /usr/share/plymouth/themes/pix/splash.png
  
  # --- WiFi Pre-configuration (Optional) ---
  # To preset WiFi, we would mount the data partition (usually sda5)
  # and inject WifiConfigStore.xml or a setup script.
  # mount /dev/sda5 /data
  # upload scripts/rpi/WifiConfigStore.xml /data/misc/wifi/WifiConfigStore.xml
  # chown 1000 1000 /data/misc/wifi/WifiConfigStore.xml
  # chmod 0600 /data/misc/wifi/WifiConfigStore.xml
  # umount /data

  sync
  umount /
_EOF

echo "✅ Build complete: $OUTPUT_IMAGE"
