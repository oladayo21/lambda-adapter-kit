import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/handler.ts', 'src/utils.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
});