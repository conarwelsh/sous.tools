#!/bin/bash

# Developer Installation Script
# This script is maintained automatically per Mandate 10.

echo "👨‍💻 Starting Developer Environment Setup..."

# 0. Fix ARM64 Sources if needed
if [[ $(dpkg --print-architecture) == "arm64" ]] && grep -q "archive.ubuntu.com" /etc/apt/sources.list; then
  echo "⚠️ Detected arm64 architecture with archive.ubuntu.com sources. Switching to ports.ubuntu.com..."
  sudo sed -i 's|http://archive.ubuntu.com/ubuntu/|http://ports.ubuntu.com/ubuntu-ports/|g' /etc/apt/sources.list
  sudo sed -i 's|http://security.ubuntu.com/ubuntu/|http://ports.ubuntu.com/ubuntu-ports/|g' /etc/apt/sources.list
fi

# 1. Update & Build Tools
sudo apt update && sudo apt install -y build-essential curl git wget unzip

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

# 6. Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
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

# 9. Android Development (Hybrid WSL2 Bridge)
echo "🤖 Setting up Android Development environment..."
sudo apt install -y openjdk-17-jdk

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

# ADB Bridge: Link to Windows ADB if available
WINDOWS_ADB="/mnt/c/platform-tools/adb.exe" # Adjust if custom path
if [ -f "$WINDOWS_ADB" ]; then
  echo "Linking WSL adb to Windows adb.exe..."
  sudo ln -sf "$WINDOWS_ADB" /usr/local/bin/adb
fi

# Add to shell config if not present
setup_shell_config() {
  local config_file=$1
  if [ -f "$config_file" ]; then
    if ! grep -q "ANDROID_HOME" "$config_file"; then
      echo "Configuring $config_file..."
      echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> "$config_file"
      echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> "$config_file"
      echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> "$config_file"
      echo 'export TAURI_DEV_HOST=0.0.0.0' >> "$config_file"
    fi
  fi
}

setup_shell_config "$HOME/.bashrc"
setup_shell_config "$HOME/.zshrc"

# 10. IDE Wrappers
echo "🖥️ Setting up Android Studio wrapper..."
mkdir -p $HOME/.local/bin
cat > "$HOME/.local/bin/Android Studio" << 'EOF'
#!/bin/bash
"/mnt/c/Program Files/Android/Android Studio/bin/studio64.exe" "$@" &
EOF
chmod +x "$HOME/.local/bin/Android Studio"

echo "✅ Developer environment ready. Please restart your shell or run 'source ~/.zshrc' (or ~/.bashrc)."
