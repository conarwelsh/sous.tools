#!/bin/bash

# RPi Installation Script
# Installs dependencies for Browser-based Kiosk (Signage/KDS)

echo "🔧 Installing Raspberry Pi dependencies..."
sudo apt update
sudo apt install -y chromium-browser x11-xserver-utils unclutter fbi

echo "🖼️  Setting up Boot Splash..."
# For Plymouth or simple console-based splash
sudo cp packages/ui/assets/boot-splash.png /usr/share/plymouth/themes/pix/splash.png || true

echo "🖥️ Configuring Dual-Monitor Force (/boot/firmware/cmdline.txt)..."
if ! grep -q "video=HDMI-A-1" /boot/firmware/cmdline.txt; then
  sudo sed -i '$ s/$/ video=HDMI-A-1:1920x1080M@60e video=HDMI-A-2:1920x1080M@60e/' /boot/firmware/cmdline.txt
else
  echo "ℹ️ Monitor config already exists."
fi

echo "🚀 Creating Kiosk Autostart Script..."
mkdir -p $HOME/.config/autostart
cat > $HOME/kiosk.sh << 'EOF'
#!/bin/bash
# Disable Screen Saver / Energy Star
xset s noblank
xset s off
xset -dpms

# Hide Mouse
unclutter -idle 0.5 -root &

# Launch Chromium for Primary Display (HDMI-1)
chromium-browser \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --window-position=0,0 \
  --user-data-dir=$HOME/.config/chromium-display1 \
  "https://web.sous.tools/signage/default?display=1" &

# Launch Chromium for Secondary Display (HDMI-2)
# Positioned at 1920,0 assuming 1080p side-by-side
chromium-browser \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --window-position=1920,0 \
  --user-data-dir=$HOME/.config/chromium-display2 \
  "https://web.sous.tools/signage/default?display=2" &
EOF

chmod +x $HOME/kiosk.sh

# Add to LXDE-pi autostart or similar
mkdir -p $HOME/.config/lxsession/LXDE-pi
if ! grep -q "@bash $HOME/kiosk.sh" $HOME/.config/lxsession/LXDE-pi/autostart 2>/dev/null; then
  echo "@bash $HOME/kiosk.sh" >> $HOME/.config/lxsession/LXDE-pi/autostart
fi

echo "✅ Setup complete. RPi will boot into Dual-Display Kiosk mode."
