import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  clean: true,
  external: ["react", "react-dom", "react-i18next", "i18next"], // Add commonly externalized peer dependencies
  esbuildOptions: (options) => {
    // These options help signal to Next.js that these are React components
    // intended for client-side rendering.
    options.jsxFactory = "React.createElement";
    options.jsxFragment = "React.Fragment";
  },
  // Consider adding banner if all exports are client-side and you want to enforce it.
  banner: {
    js: '"use client";',
  },
});
