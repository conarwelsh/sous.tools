import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "react-native-web",
    "lucide-react-native",
    "react-native-svg",
    "react-native-css-interop",
    "react-native-safe-area-context",
    "react-native",
    "@sous/ui",
    "@sous/features"
  ],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'react-native': 'react-native-web',
      'react-dom/client$': require.resolve('react-dom/client'),
      'react-dom/server$': require.resolve('react-dom/server'),
      'react-dom-real$': require.resolve('react-dom'),
      'react-dom$': require.resolve('../../packages/ui/src/react-dom-compat.js'),
    };

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

export default nextConfig;
