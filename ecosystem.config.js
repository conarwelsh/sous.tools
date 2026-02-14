/**
 * Sous Dev 2.0 - Master Manifest
 * 100% Process Management via PM2
 */

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

    // --- Core Services (Injected) ---
    {
      name: "sous-api",
      script: "pnpm sous infra exec pnpm --filter @sous/api run dev",
      cwd: ".",
      env: {
        NODE_ENV: "development",
        PORT: 4000
      },
      namespace: "core"
    },
    {
      name: "sous-web",
      script: "pnpm sous infra exec pnpm --filter @sous/web run dev",
      cwd: ".",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      namespace: "core"
    },
    {
      name: "sous-docs",
      script: "pnpm sous infra exec pnpm --filter @sous/docs run dev",
      cwd: ".",
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      namespace: "core"
    },

    // --- Native Applications ---
    {
      name: "sous-pos",
      script: "bash ./scripts/run-android.sh Wear_OS_Large_Round pos",
      cwd: ".",
      autorestart: false,
      namespace: "native"
    },
    {
      name: "sous-kds",
      script: "bash ./scripts/run-android.sh sdk_gpc_x86_64 kds",
      cwd: ".",
      autorestart: false,
      namespace: "native"
    },
    {
      name: "sous-signage",
      script: "bash ./scripts/run-android.sh sdk_google_atv_x86 signage",
      cwd: ".",
      autorestart: false,
      namespace: "native"
    },
    {
      name: "sous-kiosk",
      script: "bash ./scripts/run-android.sh Pixel_Tablet kiosk",
      cwd: ".",
      autorestart: false,
      namespace: "native"
    },
    {
      name: "sous-wearos",
      script: "bash ./scripts/run-android.sh Wear_OS_Large_Round wearos",
      cwd: ".",
      autorestart: false,
      namespace: "native"
    }
  ]
};
