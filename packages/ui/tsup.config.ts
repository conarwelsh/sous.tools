import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, 
  external: [
    'react', 
    'react-dom', 
    'react-native', 
    'react-native-web', 
    'moti', 
    'react-native-reanimated',
    'lucide-react-native',
    'react-native-css-interop',
    'react-native-svg'
  ],
  clean: true,
  minify: false,
  bundle: true,
  splitting: false,
});