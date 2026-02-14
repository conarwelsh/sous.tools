#!/bin/bash
# Wrapper to run WearOS app from WSL targeting a Windows emulator

# 1. Setup Environment
ROOT_DIR=$(pwd)
PKG_ID="com.sous.wearos"
ACTIVITY=".MainActivity"

echo "🚀 Building WearOS app..."
# Handle being called from root or package dir
if [[ "$PWD" != *"/apps/wearos" ]]; then
  cd apps/wearos || exit 1
fi
./gradlew assembleDebug

# 3. Resolve Serial
AVD_NAME=${1:-"Wear_OS_Large_Round"}
echo "🚀 Resolving target device $AVD_NAME..."
SERIAL=$(pnpm tsx "$ROOT_DIR/scripts/device-manager.ts" "$AVD_NAME" | tail -n 1)

if [ -z "$SERIAL" ] || [[ "$SERIAL" == *"Failed"* ]]; then
  echo "❌ Could not resolve or start device: $AVD_NAME"
  exit 1
fi

echo "✅ Using device: $SERIAL"
echo "📲 Deploying to $SERIAL..."
ADB="/mnt/c/Users/conar/AppData/Local/Android/Sdk/platform-tools/adb.exe"

# Force uninstall
echo "🗑️ Uninstalling $PKG_ID from $SERIAL..."
timeout 60s $ADB -s "$SERIAL" uninstall "$PKG_ID" || true

# WIPE DATA
echo "🧹 Wiping app data ($PKG_ID) on $SERIAL..."
timeout 60s $ADB -s "$SERIAL" shell pm clear "$PKG_ID" || true

# Manual install
APK_PATH="build/outputs/apk/debug/wearos-debug.apk"
echo "🏗️ Installing APK..."
timeout 60s $ADB -s "$SERIAL" install -r "$APK_PATH"

sleep 5

echo "🚀 Starting app ($PKG_ID/$ACTIVITY)..."
timeout 60s $ADB -s "$SERIAL" shell am start -n "$PKG_ID/$ACTIVITY"

sleep 2
exit 0
