#!/bin/bash

# RPi Installation Script
# Installs dependencies for @sous/native-headless

echo "🔧 Installing Raspberry Pi dependencies..."
sudo apt update
sudo apt install -y libgtk-3-dev libwebkit2gtk-4.1-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev labwc

echo "🖥️ Configuring Dual-Monitor Force (/boot/firmware/cmdline.txt)..."
if ! grep -q "video=HDMI-A-1" /boot/firmware/cmdline.txt; then
  sudo sed -i '$ s/$/ video=HDMI-A-1:1920x1080M@60e video=HDMI-A-2:1920x1080M@60e/' /boot/firmware/cmdline.txt
  echo "✅ Monitor config added. Please reboot for changes to take effect."
else
  echo "ℹ️ Monitor config already exists."
fi

echo "🚀 Setup complete for @sous/native-headless"
