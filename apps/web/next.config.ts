import type { NextConfig } from "next";
import path from "path";
import { execSync } from "child_process";

// Detect WSL IP for development
let hostIp = "localhost";
try {
  hostIp = execSync("hostname -I").toString().split(" ")[0].trim();
} catch (e) {
  // Fallback
}

const nextConfig: NextConfig = {
  distDir: process.env.DIST_DIR || ".next",
  // @ts-expect-error - Custom property used by dev server
  allowedDevOrigins: [`http://${hostIp}:3000`, `http://localhost:3000`],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "localhost:4000", 
        `${hostIp}:3000`,
        `${hostIp}:4000`,
        "web.sous.localhost", 
        "api.sous.localhost", 
        "docs.sous.localhost"
      ],
    },
  },
  transpilePackages: ["@sous/ui", "@sous/features", "@sous/config"],
  // Explicitly set the output file tracing root to the monorepo root
  outputFileTracingRoot: path.join(__dirname, "../../"),
  turbopack: {
    // Resolve the monorepo root for Turbopack
    root: path.join(__dirname, "../../"),
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@infisical/sdk": false,
        dotenv: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
