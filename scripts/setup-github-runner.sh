#!/bin/bash
set -e

REPO="conarwelsh/sous.tools"
RUNNER_DIR="$HOME/actions-runner"

echo "🚀 Setting up Local GitHub Runner for $REPO..."

# 1. Create directory
mkdir -p $RUNNER_DIR
cd $RUNNER_DIR

# 2. Download runner if not present
if [ ! -f "config.sh" ]; then
    echo "⬇️  Downloading GitHub Runner..."
    # Determine latest version (simplification for script)
    VERSION="2.321.0" 
    ARCH="x64"
    if [[ $(uname -m) == "aarch64" ]]; then ARCH="arm64"; fi
    
    curl -o actions-runner-linux-$ARCH-$VERSION.tar.gz -L https://github.com/actions/runner/releases/download/v$VERSION/actions-runner-linux-$ARCH-$VERSION.tar.gz
    tar xzf ./actions-runner-linux-$ARCH-$VERSION.tar.gz
    rm ./actions-runner-linux-$ARCH-$VERSION.tar.gz
fi

# 3. Get Registration Token via GitHub CLI
echo "🔑 Fetching registration token..."
TOKEN=$(gh api --method POST -H "Accept: application/vnd.github+json" /repos/$REPO/actions/runners/registration-token | node -e "const fs = require('fs'); const data = fs.readFileSync(0, 'utf8'); console.log(JSON.parse(data).token);")

# 4. Configure Runner
if [ ! -f ".runner" ]; then
    echo "⚙️  Configuring runner..."
    ./config.sh --url https://github.com/$REPO --token $TOKEN --name "$(hostname)-local" --unattended --replace --work "_work"
else
    echo "✅ Runner already configured."
fi

echo "🏁 Setup complete. Runner is ready to be started via PM2."
