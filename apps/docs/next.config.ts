import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {},
  outputFileTracingRoot: "/home/conar/sous.tools",
  transpilePackages: ["@sous/ui", "@sous/features", "@sous/config"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@infisical/sdk": false,
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
