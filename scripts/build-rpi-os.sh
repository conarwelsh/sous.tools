#!/bin/bash
set -e

# --- Configuration ---
# Production Path: Android-based OS (Emteria/AOSP)
# Dev Path: Raspbian Lite + Browser
BASE_IMAGE_URL="https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2024-11-20/2024-11-19-raspios-jazzy-arm64-lite.img.xz"
WORK_DIR=".tmp/rpi-build"
SIGNAGE_APK="apps/web/android/app/build/outputs/apk/signage/debug/app-signage-debug.apk"
OUTPUT_IMAGE="dist/sous-os-rpi4.img"

echo "🥧 Starting Sous OS build for Raspberry Pi..."

# 1. Setup workspace
mkdir -p $WORK_DIR
mkdir -p dist

# 2. Download and Extract Base Image (if not exists)
if [ ! -f "$WORK_DIR/base.img" ]; then
    echo "⬇️  Downloading base image..."
    # Note: If switching to Android (LineageOS/Emteria), update this URL
    curl -L $BASE_IMAGE_URL -o $WORK_DIR/base.img.xz
    echo "📦 Extracting image..."
    xz -d $WORK_DIR/base.img.xz
fi

cp $WORK_DIR/base.img $OUTPUT_IMAGE

# 3. Detect Image Type and Apply Configuration
# We use guestfish to inspect and modify the image rootless
echo "💉 Injecting configuration and assets..."

# Check if image has Android structure (/system) or Linux structure (/etc)
IMAGE_TYPE="linux"
if guestfish -a $OUTPUT_IMAGE run : is-dir /system >/dev/null 2>&1; then
    IMAGE_TYPE="android"
fi

echo "🔍 Detected image type: $IMAGE_TYPE"

if [ "$IMAGE_TYPE" == "android" ]; then
    echo "📲 Injecting Signage APK into Android image..."
    guestfish -a $OUTPUT_IMAGE <<_EOF
      run
      # Mount the system partition (partition index depends on the AOSP image used)
      # Usually sda4 or sda2. 
      mount /dev/sda4 /
      mkdir-p /system/priv-app/SousSignage
      upload $SIGNAGE_APK /system/priv-app/SousSignage/Signage.apk
      chmod 0644 /system/priv-app/SousSignage/Signage.apk
      
      # Inject Boot Splash
      upload packages/ui/assets/boot-splash.png /usr/share/plymouth/themes/pix/splash.png
      
      sync
      umount /
_EOF
else
    echo "🐧 Configuring Linux Browser Kiosk..."
    # Copy install script into the image to be run on first boot or setup autostart
    guestfish -a $OUTPUT_IMAGE <<_EOF
      run
      mount /dev/sda2 /
      
      # Inject Boot Splash
      mkdir-p /usr/share/plymouth/themes/pix
      upload packages/ui/assets/boot-splash.png /usr/share/plymouth/themes/pix/splash.png
      
      # Setup Kiosk Autostart (Basic approach for Raspbian)
      mkdir-p /home/pi/.config/autostart
      # ... (similar logic to install-rpi.sh)
      
      sync
      umount /
_EOF
fi

echo "✅ Build complete: $OUTPUT_IMAGE"
