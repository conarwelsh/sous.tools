#!/bin/bash
# Wrapper to run WearOS app from WSL targeting a Windows emulator via Windows Agent

# 1. Setup Environment
WIN_IP=$(ip route show default | awk '{print $3}')
AGENT_URL="http://$WIN_IP:4040"
PKG_ID="com.sous.wearos"
ACTIVITY=".MainActivity"

echo "🚀 Building WearOS app..."
# Handle being called from root or package dir
if [[ "$PWD" != *"/apps/wearos" ]]; then
  cd apps/wearos || exit 1
fi
./gradlew assembleDebug

# Helper to call agent
call_agent() {
  local cmd=$1
  local args=$2
  local payload=$(python3 -c "import json, sys; print(json.dumps({'command': sys.argv[1], 'args': sys.argv[2]}))" "$cmd" "$args")
  curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$AGENT_URL"
}

# Helper to get stdout from agent adb call (handles \r\n)
call_agent_adb_stdout() {
  local args=$1
  local payload=$(python3 -c "import json, sys; print(json.dumps({'command': 'adb', 'args': sys.argv[1]}))" "$args")
  curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$AGENT_URL" | python3 -c "import json, sys; print(json.load(sys.stdin).get('stdout', ''))" | tr -d '\r'
}

# 3. Resolve Serial
# Check if $1 is provided, else check ANDROID_SERIAL
if [ ! -z "$1" ]; then
  export ANDROID_SERIAL=$1
fi

if [ -z "$ANDROID_SERIAL" ]; then
  echo "🔍 Attempting to resolve Wear OS device via Agent..."
  
  FOUND_SERIAL=""
  
  # Discovery function
  find_wear_device() {
    # Match lines like "emulator-5562	device"
    local devices=$(call_agent_adb_stdout "devices" | grep -w "device" | cut -f1)
    for s in $devices; do
      if [ -z "$s" ]; then continue; fi
      local model=$(call_agent_adb_stdout "-s $s shell getprop ro.product.model")
      echo "   Checking device $s (Model: $model)" >&2
      if [[ "$model" == *"sdk_gwear"* ]] || [[ "$model" == *"Wear"* ]]; then
        echo "$s"
        return 0
      fi
    done
    return 1
  }

  FOUND_SERIAL=$(find_wear_device)

  if [ -z "$FOUND_SERIAL" ]; then
    echo "⚠️ No running Wear OS emulator found. Launching 'Wear_OS_Large_Round' via Agent..."
    
    # Launch via agent
    PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'launch-emulator', 'avd': 'Wear_OS_Large_Round', 'port': 5562}))")
    curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL"
    
    echo "⏳ Waiting for emulator process to start..."
    sleep 20
    
    # Retry finding device loop
    for i in {1..30}; do
      FOUND_SERIAL=$(find_wear_device)
      if [ ! -z "$FOUND_SERIAL" ]; then
        break
      fi
      echo "   Waiting for device ($i/30)..."
      sleep 5
    done
  fi
  
  if [ -z "$FOUND_SERIAL" ]; then
    echo "❌ Failed to find or launch Wear OS emulator."
    exit 1
  fi
  
  export ANDROID_SERIAL=$FOUND_SERIAL
fi

SERIAL=${ANDROID_SERIAL}
echo "✅ Using device: $SERIAL"
echo "📲 Deploying to $SERIAL via Agent..."

# Helper to call agent with response log
call_agent_logged() {
  local cmd=$1
  local args=$2
  local payload=$(python3 -c "import json, sys; print(json.dumps({'command': sys.argv[1], 'args': sys.argv[2]}))" "$cmd" "$args")
  local resp=$(curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$AGENT_URL")
  echo "   Agent Response: $resp"
}

# Force uninstall via agent
echo "🗑️ Uninstalling $PKG_ID from $SERIAL..."
call_agent_logged "adb" "-s $SERIAL uninstall $PKG_ID"

# WIPE DATA
echo "🧹 Wiping app data ($PKG_ID) on $SERIAL..."
call_agent_logged "adb" "-s $SERIAL shell pm clear $PKG_ID"

# Manual install via agent
APK_PATH="\\\\wsl.localhost\\Ubuntu-22.04\\home\\conar\\sous.tools\\apps\\wearos\\build\\outputs\\apk\\debug\\wearos-debug.apk"
echo "🏗️ Installing APK via agent..."
PAYLOAD=$(python3 -c "import json, sys; print(json.dumps({'command': 'adb', 'args': f'-s $SERIAL install -r \"{sys.argv[1]}\"'}))" "$APK_PATH")
RESP=$(curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL")
echo "   Install Response: $RESP"

sleep 5

echo "🚀 Starting app via agent ($PKG_ID/$ACTIVITY)..."
call_agent_logged "adb" "-s $SERIAL shell am start -n $PKG_ID/$ACTIVITY"

# Force window position
(
  sleep 10
  echo "🪟 Positioning Wear OS window..."
  PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'position-window', 'title': 'Emulator', 'x': 1400, 'y': 100, 'width': 400, 'height': 400}))")
  curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL"
) &

sleep 2
exit 0
