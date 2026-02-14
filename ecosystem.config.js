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
    }
  ]
};
