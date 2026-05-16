import { defineConfig } from 'tsup';

export default defineConfig({
  clean: false,
  cjsInterop: true,
  entry: ['index.ts', 'src/*.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  keepNames: true,
  minify: false,
  shims: true,
  splitting: false,
  sourcemap: true,
  target: `node${process.version.slice(1).split('.')[0]}`
});
