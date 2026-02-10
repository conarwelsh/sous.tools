#!/bin/bash

# Sous Developer Installation Script
# This script is maintained automatically per Mandate 10.
# It is designed to be IDEMPOTENT and works on Ubuntu (Native or WSL2).

set -e

echo "👨‍🍳 Starting Sous Developer Environment Setup..."

# 0. Environment Detection
IS_WSL=false
if grep -qi Microsoft /proc/version; then
  IS_WSL=true
  echo "💻 Detected WSL2 Environment"
fi

# 0.1 Fix ARM64 Sources if needed
if dpkg --print-architecture | grep -q "arm64" || dpkg --print-foreign-architectures | grep -q "arm64"; then
  if ! grep -q "ports.ubuntu.com" /etc/apt/sources.list && ! ls /etc/apt/sources.list.d/*.list 2>/dev/null | xargs grep -q "ports.ubuntu.com"; then
    echo "⚠️  Detected arm64 architecture but no ports.ubuntu.com sources. Fixing..."
    sudo tee /etc/apt/sources.list.d/arm64-ports.list << 'EOF'
deb [arch=arm64] http://ports.ubuntu.com/ubuntu-ports/ jammy main restricted universe multiverse
deb [arch=arm64] http://ports.ubuntu.com/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb [arch=arm64] http://ports.ubuntu.com/ubuntu-ports/ jammy-security main restricted universe multiverse
EOF
    sudo sed -i 's/deb http/deb [arch=amd64] http/g' /etc/apt/sources.list
    sudo sed -i 's/\[arch=amd64\] \[arch=amd64\]/\[arch=amd64\]/g' /etc/apt/sources.list
  fi
fi

# 1. Update & Build Tools
echo "📦 Updating system packages..."
sudo apt update -y
sudo apt install -y build-essential curl git wget unzip zsh pkg-config libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libxdo-dev jq netcat-openbsd xz-utils

# 1.1 Setup ZSH & Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  echo "🐚 Installing Oh My Zsh..."
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Install custom plugins
ZSH_CUSTOM=${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}
mkdir -p "$ZSH_CUSTOM/plugins"
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
fi
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  git clone https://github.com/zsh-users/zsh-autosuggestions.git "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
fi

# Set ZSH as default shell
if [ "$SHELL" != "$(which zsh)" ]; then
  echo "🐚 Changing default shell to zsh..."
  sudo chsh -s "$(which zsh)" "$USER"
fi

# 2. Node.js (via NVM)
if [ ! -d "$HOME/.nvm" ]; then
  echo "🟢 Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! nvm ls 22 >/dev/null 2>&1; then
  echo "🟢 Installing Node.js 22..."
  nvm install 22
fi
nvm use 22

# 3. PNPM
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing PNPM..."
  curl -fsSL https://get.pnpm.io/install.sh | sh - 
  export PATH="$HOME/.local/share/pnpm:$PATH"
fi

# 4. Docker
if ! command -v docker &> /dev/null; then
  echo "🐳 Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker "$USER"
  rm get-docker.sh
  echo "⚠️  You may need to restart your session to use docker without sudo."
fi

# 5. GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "🐙 Installing GitHub CLI..."
  sudo mkdir -p -m 755 /etc/apt/keyrings
  wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
  sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update
  sudo apt install gh -y
fi

# 6. Vercel & Render CLI
if ! command -v vercel &> /dev/null; then
  echo "▲ Installing Vercel CLI..."
  npm install -g vercel
fi

if ! command -v render &> /dev/null; then
  echo "🚀 Installing Render CLI..."
  curl https://render.com/install-cli.sh | s_sh=1 sh
fi

# 7. Infisical CLI
if ! command -v infisical &> /dev/null; then
  echo "🔐 Installing Infisical CLI..."
  curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
  sudo apt-get update && sudo apt-get install -y infisical
fi

# 8. WSL/Windows Bridge Setup
if [ "$IS_WSL" = true ]; then
  echo "🪟 Setting up Windows Agent Bridge (Live Symlinks)..."
  
  # Ensure the Windows-side tools directory exists
  powershell.exe -Command "New-Item -ItemType Directory -Force -Path C:\tools\sous-agent" > /dev/null
  
  # Create symlinks from Windows to WSL filesystem for live updates
  # We use powershell to create the links on the Windows host
  WSL_PATH="\\\\wsl.localhost\\Ubuntu-22.04\\home\\conar\\sous.tools\\scripts\\windows"
  
  powershell.exe -Command "
    \$files = @('agent.ico', 'agent.png', 'sous-agent.js', 'sous-launcher.vbs', 'sous-tray.ps1');
    foreach (\$f in \$files) {
      \$target = \"\$WSL_PATH\\\$f\";
      \$link = \"C:\\tools\\sous-agent\\\$f\";
      if (Test-Path \$link) { Remove-Item \$link -Force };
      New-Item -ItemType SymbolicLink -Path \$link -Target \$target -Force;
    }
  " > /dev/null
  
  # Firewall and Unblocking (requires admin, but we attempt)
  echo "🛡️  Configuring Windows Firewall (may prompt for admin)..."
  powershell.exe -Command "Start-Process powershell -Verb RunAs -ArgumentList 'New-NetFirewallRule -DisplayName \"Sous Agent (TCP-In)\" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4040 -ErrorAction SilentlyContinue; Unblock-File -Path C:\tools\sous-agent\sous-tray.ps1'" || echo "⚠️  Firewall config failed. Please run 'sous dev install agent' manually if emulators fail."
fi

# 9. Android Development
echo "🤖 Setting up Android Development environment..."
sudo apt install -y openjdk-21-jdk

export ANDROID_HOME="$HOME/Android/Sdk"
mkdir -p "$ANDROID_HOME"

if [ ! -d "$ANDROID_HOME/cmdline-tools" ]; then
  echo "🤖 Downloading Android Command Line Tools..."
  mkdir -p "$ANDROID_HOME/temp"
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip
  unzip -q /tmp/cmdline-tools.zip -d "$ANDROID_HOME/temp"
  mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
  mv "$ANDROID_HOME/temp/cmdline-tools/"* "$ANDROID_HOME/cmdline-tools/latest/"
  rm -rf "$ANDROID_HOME/temp" /tmp/cmdline-tools.zip
fi

# 10. IDE Wrappers
echo "🖥️  Setting up IDE wrappers..."
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/studio" << 'EOF'
#!/bin/bash
if [ -f "/mnt/c/Program Files/Android/Android Studio/bin/studio64.exe" ]; then
  "/mnt/c/Program Files/Android/Android Studio/bin/studio64.exe" "$@" &
else
  echo "Android Studio not found at default Windows path."
fi
EOF
chmod +x "$HOME/.local/bin/studio"

# 11. Finalizing
echo "🐚 Finalizing shell configuration..."
pnpm run sous dev install shell

echo ""
echo "✅ Sous Developer Environment Setup Complete!"
echo "👉 Run 'source ~/.zshrc' to apply changes."
echo "👉 Ensure you update packages/config/.env with your Infisical credentials."
