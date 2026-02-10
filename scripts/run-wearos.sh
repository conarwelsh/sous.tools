#!/bin/bash
# Wrapper to run WearOS app from WSL targeting a Windows emulator

# 1. Setup Environment
WIN_IP=$(ip route show default | awk '{print $3}')
export ANDROID_HOME=$HOME/Android/Sdk
export ADBHOST=$WIN_IP
export ADB_SERVER_SOCKET=tcp:$WIN_IP:5037

# 2. Fix PATH
export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "mnt/c" | tr "\n" ":")

echo "🚀 Building WearOS app..."
# Handle being called from root or package dir
if [[ "$PWD" != *"/apps/wearos" ]]; then
  cd apps/wearos || exit 1
fi
./gradlew assembleDebug

AGENT_URL="http://$WIN_IP:4040"
PKG_ID="com.sous.wearos"
ACTIVITY=".MainActivity"
SERIAL=${ANDROID_SERIAL}
if [ -z "$SERIAL" ]; then
  echo "❌ Error: ANDROID_SERIAL not set. Aborting."
  exit 1
fi
echo "📲 Deploying to $SERIAL via Agent..."

# Helper to call agent
call_agent() {
  local cmd=$1
  local args=$2
  local payload=$(python3 -c "import json; print(json.dumps({'command': '$cmd', 'args': '$args'}))")
  curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$AGENT_URL"
}

# Force uninstall via agent
echo "🗑️ Uninstalling $PKG_ID from $SERIAL..."
call_agent "adb" "-s $SERIAL uninstall $PKG_ID"

# WIPE DATA
echo "🧹 Wiping app data ($PKG_ID) on $SERIAL..."
call_agent "adb" "-s $SERIAL shell pm clear $PKG_ID"

# Manual install via agent - Using RAW string in Python to prevent unicodeescape error
APK_PATH="\\\\wsl.localhost\\Ubuntu-22.04\\home\\conar\\sous.tools\\apps\\wearos\\build\\outputs\\apk\\debug\\wearos-debug.apk"
echo "🏗️ Installing APK ($APK_PATH) via agent..."
PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'adb', 'args': r'-s $SERIAL install -r \"$APK_PATH\"'}))")
curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL"

sleep 5

echo "🚀 Starting app via agent ($PKG_ID/$ACTIVITY)..."
call_agent "adb" "-s $SERIAL shell am start -n $PKG_ID/$ACTIVITY"

# Force window position
(
  sleep 10
  echo "🪟 Positioning Wear OS window..."
  PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'position-window', 'title': 'Wear OS', 'x': 1400, 'y': 100, 'width': 400, 'height': 400}))")
  curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL"
) &
