import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { client: 'src/client.ts' },
    format: ['cjs', 'esm'],
    dts: false,
    external: ['react', 'react-dom', 'next/link', 'next/navigation'],
    clean: true,
    bundle: true,
    splitting: false,
    banner: {
      js: '"use client";',
    },
  },
  {
    entry: { server: 'src/server.ts' },
    format: ['cjs', 'esm'],
    dts: false,
    external: ['fs', 'path', 'server-only', 'react', 'react-dom'],
    bundle: true,
    splitting: false,
  }
]);
