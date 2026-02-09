#!/bin/bash
# Wrapper to run Capacitor Android from WSL targeting a Windows emulator

# 1. Setup Environment
WIN_IP=$(ip route show default | awk '{print $3}')
export ANDROID_HOME=$HOME/Android/Sdk
export ADBHOST=$WIN_IP
export ADB_SERVER_SOCKET=tcp:$WIN_IP:5037

# 2. Fix PATH (remove Windows paths to avoid gradle conflicts if any)
export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "mnt/c" | tr "\n" ":")

# 3. Run Command
cd apps/web || exit 1
FLAVOR_ARG=""
if [ ! -z "$2" ]; then
  FLAVOR_ARG="--flavor $2"
fi

# Set Live Reload URL to WSL IP so emulator can reach it
WSL_IP=$(hostname -I | awk '{print $1}')
# Ensure we don't use 127.0.0.1
if [ "$WSL_IP" == "127.0.0.1" ] || [ -z "$WSL_IP" ]; then
  WSL_IP=$(ip route get 1 | awk '{print $7;exit}')
fi
export CAPACITOR_LIVE_RELOAD_URL="http://$WSL_IP:${PORT:-3000}"

echo "🚀 Running Capacitor Android on target $1 with flavor ${2:-default}..."
echo "🔗 Live Reload URL: $CAPACITOR_LIVE_RELOAD_URL"

# Inject Host IP into strings.xml for native code to use
STRINGS_FILE="android/app/src/main/res/values/strings.xml"
if [ ! -f "$STRINGS_FILE" ]; then
  echo "⚠️ Warning: $STRINGS_FILE not found, skipping IP injection."
else
  if grep -q "sous_host_ip" "$STRINGS_FILE"; then
    sed -i "s|<string name=\"sous_host_ip\">.*</string>|<string name=\"sous_host_ip\">$WSL_IP</string>|" "$STRINGS_FILE"
  else
    sed -i "s|</resources>|    <string name=\"sous_host_ip\">$WSL_IP</string>\n</resources>|" "$STRINGS_FILE"
  fi
fi

NPX_EXE="/home/conar/.nvm/versions/node/v25.2.1/bin/npx"
PNPM_EXE="/home/conar/.local/share/pnpm/pnpm"

# CRITICAL: Use a global lock for BOTH assets AND building because all flavors share the same android/ folder
LOCK_FILE="/tmp/sous-android-build.lock"

(
  echo "⏳ [$2] Waiting for build lock..."
  flock -x 200 || exit 1
  echo "🔐 [$2] Lock acquired."

  # Generate Assets (Icons, Splash)
  if [ -d "assets" ]; then
    echo "🎨 [$2] Generating assets..."
    $NPX_EXE capacitor-assets generate --android
  else
    echo "⚠️ [$2] 'apps/web/assets' directory not found. Skipping icon/splash generation."
  fi

  # Clean and Sync
  echo "🔄 [$2] Cleaning and Syncing Capacitor..."
  rm -rf android/app/src/main/assets/public
  rm -rf android/app/src/main/assets/capacitor.config.json
  
  # Ensure the config uses the correct port and IP
  export PORT=${PORT:-3000}
  export WSL_IP=$WSL_IP
  $NPX_EXE cap sync android

  # Force a fresh APK build
  FLAVOR_CAP=$(echo "${2:-default}" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
  echo "🏗️ Building fresh APK for flavor $FLAVOR_CAP..."
  cd android && export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" && ./gradlew clean "assemble${FLAVOR_CAP}Debug" && cd ..

  echo "📄 Verifying generated config..."
  cat android/app/src/main/assets/capacitor.config.json
  
  echo "🔓 [$2] Releasing lock."
) 200>$LOCK_FILE

echo "📲 Reinstalling and clearing data..."
WIN_IP=$(ip route show default | awk '{print $3}')
AGENT_URL="http://$WIN_IP:4040"

# Map flavor to package ID and Activity
PKG_ID="com.sous.${2:-tools}"
ACTIVITY="com.sous.tools.MainActivity"
if [ "${2:-default}" == "default" ] || [ "${2:-default}" == "tools" ]; then PKG_ID="com.sous.tools"; fi

# Helper to call agent
call_agent_json() {
  local payload=$1
  curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$AGENT_URL"
}

# Force uninstall via agent
echo "🗑️ Force uninstalling old app ($PKG_ID) from $1..."
PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'adb', 'args': f'-s $1 uninstall $PKG_ID'}))")
call_agent_json "$PAYLOAD"

# WIPE DATA to be sure (in case uninstall fails to clear some cache)
echo "🧹 Wiping app data ($PKG_ID) on $1..."
PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'adb', 'args': f'-s $1 shell pm clear $PKG_ID'}))")
call_agent_json "$PAYLOAD"

sleep 2

# Manual install via agent - Using RAW string in Python
APK_PATH="\\\\wsl.localhost\\Ubuntu-22.04\\home\\conar\\sous.tools\\apps\\web\\android\\app\\build\\outputs\\apk\\${2:-tools}\\debug\\app-${2:-tools}-debug.apk"
echo "🏗️ Manually installing fresh APK ($APK_PATH) via agent..."
PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'adb', 'args': r'-s $1 install -r \"$APK_PATH\"'}))")
call_agent_json "$PAYLOAD"

sleep 5

echo "🚀 Starting app via agent ($PKG_ID/$ACTIVITY)..."
# Pass the CAPACITOR_LIVE_RELOAD_URL as an extra string to force WebView if the baked config is stuck
PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'adb', 'args': f'-s $1 shell am start -n $PKG_ID/$ACTIVITY --es url \"$CAPACITOR_LIVE_RELOAD_URL\"'}))")
call_agent_json "$PAYLOAD"

# Force window to foreground after a short delay
(
  sleep 10
  echo "🪟 Bringing $1 to foreground..."
  PAYLOAD=$(python3 -c "import json; print(json.dumps({'command': 'position-window', 'title': '$1', 'x': 100, 'y': 100, 'width': 1280, 'height': 800}))")
  call_agent_json "$PAYLOAD"
) &

sleep 5
exit 0