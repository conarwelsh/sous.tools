import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname, "../../"),
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
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'react-native': 'react-native-web',
      'react-dom/client$': require.resolve('react-dom/client'),
      'react-dom/server$': require.resolve('react-dom/server'),
      'react-dom-real$': require.resolve('react-dom'),
      'react-dom$': require.resolve('../../packages/ui/src/react-dom-compat.js'),
    };
    
    // Add Flow support for react-native deep imports
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: /node_modules\/react-native/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-flow', { all: true }],
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-react',
          ],
        },
      },
    });

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
