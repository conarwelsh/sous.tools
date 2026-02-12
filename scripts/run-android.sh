#!/bin/bash
# Wrapper to run Capacitor Android from WSL targeting a Windows emulator via Windows Agent

# 1. Setup Environment
WIN_IP=$(ip route show default | awk '{print $3}')
AGENT_URL="http://$WIN_IP:4040"

# 2. Fix PATH (remove Windows paths to avoid gradle conflicts)
export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "mnt/c" | tr "\n" ":")

# 3. Run Command
cd apps/web || exit 1
FLAVOR=${2:-default}
FLAVOR_CAP=$(echo "$FLAVOR" | awk '{print toupper(substr($0,1,1))substr($0,2)}')

# Set Live Reload URL to WSL IP so emulator can reach it
WSL_IP=$(hostname -I | awk '{print $1}')
if [ "$WSL_IP" == "127.0.0.1" ] || [ -z "$WSL_IP" ]; then
  WSL_IP=$(ip route get 1 | awk '{print $7;exit}')
fi
export CAPACITOR_LIVE_RELOAD_URL="http://$WSL_IP:${PORT:-3000}"

echo "🚀 Running Capacitor Android on target $1 with flavor $FLAVOR..."
echo "🔗 Live Reload URL: $CAPACITOR_LIVE_RELOAD_URL"

# Inject Host IP into strings.xml
STRINGS_FILE="android/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_FILE" ]; then
  if grep -q "sous_host_ip" "$STRINGS_FILE"; then
    sed -i "s|<string name=\"sous_host_ip\">.*</string>|<string name=\"sous_host_ip\">$WSL_IP</string>|" "$STRINGS_FILE"
  else
    sed -i "s|</resources>|    <string name=\"sous_host_ip\">$WSL_IP</string>\n</resources>|" "$STRINGS_FILE"
  fi
fi

NPX_EXE="/home/conar/.nvm/versions/node/v25.2.1/bin/npx"
LOCK_FILE="/tmp/sous-android-build.lock"

(
  echo "⏳ [$FLAVOR] Waiting for build lock..."
  flock -x 200 || exit 1
  echo "🔐 [$FLAVOR] Lock acquired."

  if [ -d "assets" ]; then
    $NPX_EXE capacitor-assets generate --android
  fi

  rm -rf android/app/src/main/assets/public
  rm -rf android/app/src/main/assets/capacitor.config.json
  
  export PORT=${PORT:-3000}
  export WSL_IP=$WSL_IP
  $NPX_EXE cap sync android

  echo "🏗️ Building fresh APK for flavor $FLAVOR_CAP..."
  cd android && export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" && ./gradlew clean "assemble${FLAVOR_CAP}Debug" && cd ..
  
  echo "🔓 [$FLAVOR] Releasing lock."
) 200>$LOCK_FILE

# Deployment via Agent
PKG_ID="com.sous.$FLAVOR"
if [ "$FLAVOR" == "default" ] || [ "$FLAVOR" == "tools" ]; then PKG_ID="com.sous.tools"; fi
ACTIVITY="com.sous.tools.MainActivity"

# Helper to call agent
call_agent() {
  local cmd=$1
  local args=$2
  local payload=$(python3 -c "import json, sys; print(json.dumps({'command': sys.argv[1], 'args': sys.argv[2]}))" "$cmd" "$args")
  curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$AGENT_URL"
}

echo "📲 Reinstalling $PKG_ID on $1 via Agent..."

# Uninstall
echo "🗑️  Uninstalling..."
call_agent "adb" "-s $1 uninstall $PKG_ID"

# Clear (Ignore error as uninstall might have removed it already)
echo "🧹 Wiping data..."
call_agent "adb" "-s $1 shell pm clear $PKG_ID" > /dev/null 2>&1

sleep 2

# Install
# Note: APK path uses flavor-specific folder. POS -> posDebug
APK_DIR=$(echo "$FLAVOR" | tr '[:upper:]' '[:lower:]')
APK_PATH="\\\\wsl.localhost\\Ubuntu-22.04\\home\\conar\\sous.tools\\apps\\web\\android\\app\\build\\outputs\\apk\\$APK_DIR\\debug\\app-$APK_DIR-debug.apk"

echo "🏗️  Installing APK from $APK_PATH..."
PAYLOAD=$(python3 -c "import json, sys; print(json.dumps({'command': 'adb', 'args': f'-s $1 install -r \"{sys.argv[1]}\"'}))" "$APK_PATH")
curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL"

sleep 5

echo "🚀 Starting app..."
call_agent "adb" "-s $1 shell am start -n $PKG_ID/$ACTIVITY --es url \"$CAPACITOR_LIVE_RELOAD_URL\""

# Foreground
(
  sleep 10
  # Try various titles for the emulator window
  echo "🪟 Bringing $1 to foreground..."
  # Common emulator titles: "Android Emulator - <serial>", "<avd_name>", etc.
  # We try to use the serial as a fallback in the title check
  PAYLOAD=$(python3 -c "import json, sys; print(json.dumps({'command': 'position-window', 'title': sys.argv[1], 'x': 100, 'y': 100, 'width': 1280, 'height': 800}))" "$1")
  curl -s -X POST -H 'Content-Type: application/json' -d "$PAYLOAD" "$AGENT_URL" > /dev/null 2>&1
) &

sleep 2
exit 0
