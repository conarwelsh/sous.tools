#!/bin/bash

# Environment Detection Script
# Detects if running on Raspberry Pi, Android (via termux/adb), or standard Linux

if [ -f /etc/rpi-issue ] || grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
  echo "rpi"
elif [ -d "/system/app" ] && [ -d "/data/data" ]; then
  echo "android"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  echo "macos"
else
  echo "unknown"
fi
