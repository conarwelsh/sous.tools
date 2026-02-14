import path from "path";
import { execSync } from "child_process";

// Ensure critical public variables are set during build if their non-public counterparts exist
if (process.env.API_URL && !process.env.NEXT_PUBLIC_API_URL) {
  process.env.NEXT_PUBLIC_API_URL = process.env.API_URL;
}
if (process.env.WEB_URL && !process.env.NEXT_PUBLIC_WEB_URL) {
  process.env.NEXT_PUBLIC_WEB_URL = process.env.WEB_URL;
}
if (process.env.DOCS_URL && !process.env.NEXT_PUBLIC_DOCS_URL) {
  process.env.NEXT_PUBLIC_DOCS_URL = process.env.DOCS_URL;
}

// Detect WSL IP for development
let hostIp = "localhost";
try {
  hostIp = execSync("hostname -I").toString().split(" ")[0].trim();
} catch (_e) {
  // Fallback
}

const nextConfig = {
  distDir: process.env.DIST_DIR || ".next",
  allowedDevOrigins: [`http://${hostIp}:3000`, `http://localhost:3000`],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:4000",
        "localhost:1423",
        "localhost:1424",
        "localhost:1425",
        `${hostIp}:3000`,
        `${hostIp}:4000`,
        `${hostIp}:1423`,
        `${hostIp}:1424`,
        `${hostIp}:1425`,
        "web.sous.localhost",
        "api.sous.localhost",
        "docs.sous.localhost",
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
  webpack: (config: any, { isServer }: any) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@infisical/sdk": false,
        "@hyperdx/node-opentelemetry": false,
        dotenv: false,
        fs: false,
        path: false,
        os: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
