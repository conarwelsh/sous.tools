#!/bin/bash
set -e

echo "Starting entrypoint script..."
echo "REPO_URL: ${REPO_URL:-not set}"
echo "RUNNER_TOKEN: ${RUNNER_TOKEN:+[REDACTED]}"

# The runner MUST be configured and run from its installation directory
cd /home/runner

# If REPO_URL and RUNNER_TOKEN are provided, configure the runner
if [ -n "$REPO_URL" ] && [ -n "$RUNNER_TOKEN" ]; then
    if [ ! -f ".runner" ]; then
        echo "Configuring GitHub Runner..."
        ./config.sh --url "$REPO_URL" --token "$RUNNER_TOKEN" --unattended --replace
    else
        echo "GitHub Runner already configured. Skipping configuration."
    fi
else
    echo "Warning: REPO_URL or RUNNER_TOKEN not set. Configuration might fail if not already configured."
fi

# Run the runner
echo "Starting GitHub Runner..."
exec ./run.sh
