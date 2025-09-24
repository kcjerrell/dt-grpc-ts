import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/web.ts'],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
})
