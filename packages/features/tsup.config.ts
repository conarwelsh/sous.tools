import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      client: "src/client.ts",
      index: "src/index.ts",
      "constants/plans": "src/constants/plans.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    bundle: true,
    splitting: false,
    banner: {
      js: '"use client";',
    },
    external: [
      "react",
      "react-dom",
      "next/link",
      "next/navigation",
      "@sous/ui",
      "@sous/config",
      "@sous/client-sdk",
      "socket.io-client",
      "lucide-react",
      "react-markdown",
      "remark-gfm",
    ],
  },
  {
    entry: {
      server: "src/server.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    clean: false,
    bundle: true,
    splitting: false,
    external: [
      "react",
      "react-dom",
      "next/link",
      "next/navigation",
      "@sous/ui",
      "@sous/config",
      "@sous/client-sdk",
      "fs",
      "path",
      "server-only",
    ],
  },
]);
