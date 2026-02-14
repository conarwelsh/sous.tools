#!/bin/bash
# Wrapper to run Capacitor Android from WSL targeting a Windows emulator via Windows Agent

# 1. Setup Environment
ROOT_DIR=$(pwd)
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

ADB="/mnt/c/Users/conar/AppData/Local/Android/Sdk/platform-tools/adb.exe"

echo "🚀 Resolving target device $1..."
# Increase timeout for device manager since it may need to launch emulator
SERIAL=$(timeout 150s pnpm tsx "$ROOT_DIR/scripts/device-manager.ts" "$1" | tail -n 1)
if [ -z "$SERIAL" ] || [[ "$SERIAL" == *"Failed"* ]] || [[ "$SERIAL" == *"Usage"* ]]; then
  echo "❌ Could not resolve or start device: $1"
  echo "DEBUG: SERIAL output was: $SERIAL"
  exit 1
fi
echo "✅ Target resolved to: $SERIAL"

# 4. Fix PATH (remove Windows paths to avoid gradle conflicts)
# We do this AFTER resolving the device because device-manager needs cmd.exe/adb.exe
export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "mnt/c" | tr "\n" ":")

echo "🚀 Running Capacitor Android on target $SERIAL with flavor $FLAVOR..."
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
    echo "🏗️ Generating assets..."
    $NPX_EXE capacitor-assets generate --android || true
  fi

  rm -rf android/app/src/main/assets/public
  rm -rf android/app/src/main/assets/capacitor.config.json
  
  export PORT=${PORT:-3000}
  export WSL_IP=$WSL_IP
  echo "🏗️ Syncing Capacitor..."
  $NPX_EXE cap sync android

  echo "🏗️ Building fresh APK for flavor $FLAVOR_CAP..."
  cd android && export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" && ./gradlew clean "assemble${FLAVOR_CAP}Debug" && cd ..
  
  echo "🔓 [$FLAVOR] Releasing lock."
) 200>$LOCK_FILE

# 5. Deployment
PKG_ID="com.sous.$FLAVOR"
if [ "$FLAVOR" == "default" ] || [ "$FLAVOR" == "tools" ]; then PKG_ID="com.sous.tools"; fi
ACTIVITY="com.sous.tools.MainActivity"

echo "📲 Reinstalling $PKG_ID on $SERIAL..."

# Uninstall
echo "🗑️  Uninstalling..."
timeout 60s $ADB -s "$SERIAL" uninstall "$PKG_ID" || true

# Clear
echo "🧹 Wiping data..."
timeout 60s $ADB -s "$SERIAL" shell pm clear "$PKG_ID" || true

sleep 2

# APK Path
APK_DIR=$(echo "$FLAVOR" | tr '[:upper:]' '[:lower:]')
APK_PATH="android/app/build/outputs/apk/$APK_DIR/debug/app-$APK_DIR-debug.apk"

if [ ! -f "$APK_PATH" ]; then
  echo "❌ APK not found: $APK_PATH"
  exit 1
fi

echo "🏗️  Installing APK from $APK_PATH..."
timeout 60s $ADB -s "$SERIAL" install -r "$APK_PATH"

sleep 5

echo "🚀 Starting app..."
timeout 60s $ADB -s "$SERIAL" shell am start -a android.intent.action.MAIN -n "$PKG_ID/com.sous.tools.MainActivity" --es url "$CAPACITOR_LIVE_RELOAD_URL"

sleep 2
exit 0
