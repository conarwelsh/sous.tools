#!/bin/bash

# Developer Installation Script
# This script is maintained automatically per Mandate 10.

echo "👨‍💻 Starting Developer Environment Setup..."

# 0. Fix ARM64 Sources if needed
# Standard mirrors don't have arm64. If arm64 is primary or foreign, we need ports.ubuntu.com
if dpkg --print-architecture | grep -q "arm64" || dpkg --print-foreign-architectures | grep -q "arm64"; then
  if ! grep -q "ports.ubuntu.com" /etc/apt/sources.list && ! ls /etc/apt/sources.list.d/*.list 2>/dev/null | xargs grep -q "ports.ubuntu.com"; then
    echo "⚠️  Detected arm64 architecture but no ports.ubuntu.com sources. Fixing..."
    sudo tee /etc/apt/sources.list.d/arm64-ports.list << 'EOF'
deb [arch=arm64] http://ports.ubuntu.com/ubuntu-ports/ jammy main restricted universe multiverse
deb [arch=arm64] http://ports.ubuntu.com/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb [arch=arm64] http://ports.ubuntu.com/ubuntu-ports/ jammy-security main restricted universe multiverse
EOF
    # Also tag existing sources as amd64 to avoid ambiguity (if not already tagged)
    sudo sed -i 's/deb http/deb [arch=amd64] http/g' /etc/apt/sources.list
    sudo sed -i 's/\[arch=amd64\] \[arch=amd64\]/\[arch=amd64\]/g' /etc/apt/sources.list
  fi
fi

# 1. Update & Build Tools
sudo apt update && sudo apt install -y build-essential curl git wget unzip zsh pkg-config libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libxdo-dev jq

# 1.1 Setup ZSH & Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  echo "Installing Oh My Zsh..."
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Install custom plugins
ZSH_CUSTOM=${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
fi
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions
fi

# Set ZSH as default shell if not already
if [ "$SHELL" != "$(which zsh)" ]; then
  echo "Changing default shell to zsh..."
  sudo chsh -s $(which zsh) $USER
fi

# 2. Node.js (via NVM)
if ! command -v nvm &> /dev/null; then
  echo "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi
nvm install 22
nvm use 22

# 3. PNPM
if ! command -v pnpm &> /dev/null; then
  echo "Installing PNPM..."
  curl -fsSL https://get.pnpm.io/install.sh | sh - 
fi

# 4. Docker
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  rm get-docker.sh
fi

# 5. GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "Installing GitHub CLI..."
  (type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y
fi

# 6. Vercel & Render CLI
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

if ! command -v render &> /dev/null; then
  echo "Installing Render CLI..."
  curl https://render.com/install-cli.sh | s_sh=1 sh
fi

# 7. Infisical CLI
if ! command -v infisical &> /dev/null; then
  echo "Installing Infisical CLI..."
  curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
  sudo apt-get update && sudo apt-get install -y infisical
fi

# 8. Rust (for Tauri)
if ! command -v cargo &> /dev/null; then
  echo "Installing Rust..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source $HOME/.cargo/env
fi
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# 9. Android Development (Hybrid WSL2 Bridge)
echo "🤖 Setting up Android Development environment..."
sudo apt install -y openjdk-21-jdk

# Create Android SDK directory if it doesn't exist
export ANDROID_HOME=$HOME/Android/Sdk
mkdir -p $ANDROID_HOME

# Install Command Line Tools if missing
if [ ! -d "$ANDROID_HOME/cmdline-tools" ]; then
  echo "Downloading Android Command Line Tools..."
  wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip
  unzip /tmp/cmdline-tools.zip -d $ANDROID_HOME/temp
  mkdir -p $ANDROID_HOME/cmdline-tools/latest
  mv $ANDROID_HOME/temp/cmdline-tools/* $ANDROID_HOME/cmdline-tools/latest/
  rm -rf $ANDROID_HOME/temp /tmp/cmdline-tools.zip
fi

# 10. Shell Customization
echo "🐚 Configuring @sous shell..."
pnpm run sous dev install shell

# 11. IDE Wrappers
echo "🖥️ Setting up Android Studio wrapper..."
mkdir -p $HOME/.local/bin
cat > "$HOME/.local/bin/Android Studio" << 'EOF'
#!/bin/bash
"/mnt/c/Program Files/Android/Android Studio/bin/studio64.exe" "$@" &
EOF
chmod +x "$HOME/.local/bin/Android Studio"

echo "✅ Developer environment ready. Please restart your shell or run 'source ~/.zshrc' (or ~/.bashrc)."
