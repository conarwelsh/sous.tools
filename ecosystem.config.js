const { localConfig } = require("./packages/config/dist/index");
const path = require("path");

module.exports = {
  apps: [
    // --- Core Apps ---
    {
      name: "sous-api",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts api",
      env: {
        NODE_ENV: "development",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-web",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts web",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-docs",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts docs",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
        FORCE_COLOR: "1"
      }
    },

    // --- Mobile / Flavor Apps (Serving via @sous/web + Capacitor) ---
    {
      name: "sous-kds",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts web",
      env: {
        NODE_ENV: "development",
        PORT: 1423,
        FLAVOR: "kds",
        DIST_DIR: ".next-kds",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-pos",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts web",
      env: {
        NODE_ENV: "development",
        PORT: 1424,
        FLAVOR: "pos",
        DIST_DIR: ".next-pos",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-signage",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts web",
      env: {
        NODE_ENV: "development",
        PORT: 1425,
        FLAVOR: "signage",
        DIST_DIR: ".next-signage",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-signage-android",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts signage-android",
      autorestart: false,
      env: {
        NODE_ENV: "development",
        FLAVOR: "signage",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-kds-android",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts kds-android",
      autorestart: false,
      env: {
        NODE_ENV: "development",
        FLAVOR: "kds",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-pos-android",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts pos-android",
      autorestart: false,
      env: {
        NODE_ENV: "development",
        FLAVOR: "pos",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-tools-android",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts tools-android",
      autorestart: false,
      env: {
        NODE_ENV: "development",
        FLAVOR: "tools",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "sous-wearos",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts wearos",
      autorestart: false,
      env: {
        NODE_ENV: "development",
        FORCE_COLOR: "1"
      }
    },
    // The 5th mobile app could be the standard consumer app (mobile web/capacitor)
    {
      name: "sous-mobile-web",
      script: "pnpm tsx /home/conar/sous.tools/scripts/dev-tools.ts web",
      env: {
        NODE_ENV: "development",
        PORT: 3002,
        DIST_DIR: ".next-mobile",
        FORCE_COLOR: "1"
      }
    },

    // --- Infrastructure ---
    {
      name: "sous-github-runner",
      script: "./run.sh",
      cwd: path.join(process.env.HOME, "actions-runner"),
      autorestart: true
    }
  ]
};
