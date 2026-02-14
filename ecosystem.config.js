/**
 * Sous Dev 2.0 - Master Manifest
 * 100% Process Management via PM2
 */

const path = require('path');

module.exports = {
  apps: [
    // --- Infrastructure ---
    {
      name: "sous-db",
      script: "docker logs -f sous-postgres",
      autorestart: true,
      namespace: "infra"
    },
    {
      name: "sous-redis",
      script: "docker logs -f sous-redis",
      autorestart: true,
      namespace: "infra"
    },

    // --- Core Services ---
    {
      name: "sous-api",
      script: "node ../../apps/cli/dist/main.js env exec -- pnpm nest start --watch",
      cwd: "apps/api",
      env: {
        NODE_ENV: "development",
        PORT: 4000
      },
      namespace: "core"
    },
    {
      name: "sous-web",
      script: "node ../../apps/cli/dist/main.js env exec -- pnpm next dev --turbo",
      cwd: "apps/web",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      namespace: "core"
    },
    {
      name: "sous-docs",
      script: "node ../../apps/cli/dist/main.js env exec -- pnpm next dev --turbo",
      cwd: "apps/docs",
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      namespace: "core"
    },

    // --- Native Deployments (One-Shot) ---
    {
      name: "sous-pos",
      script: "node ./apps/cli/dist/main.js env exec -- bash -c \"SERIAL=$(pnpm tsx scripts/device-manager.ts 'Pixel_Tablet') && bash scripts/run-android.sh $SERIAL pos\"",
      cwd: ".",
      autorestart: false,
      env: {
        FLAVOR: "pos",
        PORT: 3000
      },
      namespace: "native"
    },
    {
      name: "sous-kds",
      script: "node ./apps/cli/dist/main.js env exec -- bash -c \"SERIAL=$(pnpm tsx scripts/device-manager.ts 'Medium_Desktop') && bash scripts/run-android.sh $SERIAL kds\"",
      cwd: ".",
      autorestart: false,
      env: {
        FLAVOR: "kds",
        PORT: 3000
      },
      namespace: "native"
    },
    {
      name: "sous-signage",
      script: "node ./apps/cli/dist/main.js env exec -- bash -c \"SERIAL=$(pnpm tsx scripts/device-manager.ts 'Television_1080p') && bash scripts/run-android.sh $SERIAL signage\"",
      cwd: ".",
      autorestart: false,
      env: {
        FLAVOR: "signage",
        PORT: 3000
      },
      namespace: "native"
    },
    {
      name: "sous-wearos",
      script: "node ./apps/cli/dist/main.js env exec -- bash -c \"SERIAL=$(pnpm tsx scripts/device-manager.ts 'Wear_OS_Large_Round') && bash scripts/run-wearos.sh $SERIAL\"",
      cwd: ".",
      autorestart: false,
      namespace: "native"
    }
  ]
};
