#!/bin/bash
set -e

# Test script for the Sous installation workflow using Docker
# This script runs against the 'install-tester' container defined in docker-compose.yml

CONTAINER_NAME="sous-install-tester"

echo "🧪 Starting Installation Workflow Test..."

# 1. Ensure container is running
if [ "$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME 2>/dev/null)" != "true" ]; then
    echo "🚀 Starting install-tester container..."
    docker compose up -d install-tester
fi

# 2. Prepare the container (minimal baseline)
echo "📦 Preparing container baseline..."
docker exec -it $CONTAINER_NAME bash -c "apt update && apt install -y curl git sudo"

# 3. Run the installation process inside the container
echo "🏗️  Running pnpm install inside container..."
docker exec -it $CONTAINER_NAME bash -c "pnpm install"

echo "🚀 Running 'pnpm sous dev install' inside container..."
# We use -e to simulate a non-interactive environment
docker exec -it $CONTAINER_NAME bash -c "export DEBIAN_FRONTEND=noninteractive && pnpm sous dev install"

# 4. Verify results
echo "🔍 Verifying installation artifacts..."

# Check .env creation
if docker exec $CONTAINER_NAME bash -c "[ -f packages/config/.env ]"; then
    echo "✅ packages/config/.env created successfully."
else
    echo "❌ packages/config/.env was NOT created."
    exit 1
fi

# Check Docker installation (client)
if docker exec $CONTAINER_NAME bash -c "command -v docker >/dev/null"; then
    echo "✅ Docker CLI installed."
else
    echo "❌ Docker CLI missing."
    exit 1
fi

# Check Node.js
if docker exec $CONTAINER_NAME bash -c "node -v | grep v22"; then
    echo "✅ Node.js 22 installed."
else
    echo "❌ Node.js 22 missing or wrong version."
    exit 1
fi

# Check Infisical
if docker exec $CONTAINER_NAME bash -c "command -v infisical >/dev/null"; then
    echo "✅ Infisical CLI installed."
else
    echo "❌ Infisical CLI missing."
    exit 1
fi

echo "🎉 Installation Workflow Test PASSED!"
