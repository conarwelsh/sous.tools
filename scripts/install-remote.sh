#!/bin/bash

# Remote Installation Bootstrapper
# Usage: ./install-remote.sh <ip>

IP=$1

if [ -z "$IP" ]; then
  echo "Error: IP address required."
  exit 1
fi

echo "🌐 Bootstrapping remote device at $IP..."

# 1. Check SSH access
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $IP exit &>/dev/null; then
  echo "❌ Error: Cannot connect to $IP via SSH. Ensure your SSH key is authorized on the target."
  exit 1
fi

# 2. Sync scripts to remote
echo "📤 Syncing automation scripts..."
ssh $IP "mkdir -p ~/sous-scripts"
scp scripts/* $IP:~/sous-scripts/

# 3. Detect environment and run appropriate installer
echo "🔍 Detecting remote environment..."
REMOTE_ENV=$(ssh $IP "bash ~/sous-scripts/detect-env.sh")
echo "📍 Remote identified as: $REMOTE_ENV"

if [ "$REMOTE_ENV" == "rpi" ]; then
  ssh $IP "bash ~/sous-scripts/install-rpi.sh"
else
  echo "⚠️ No specific installer found for $REMOTE_ENV. Defaulting to basic Linux setup."
  # Future: generic-linux setup
fi

echo "✅ Remote setup complete for $IP"
