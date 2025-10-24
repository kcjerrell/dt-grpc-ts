import { defineConfig } from 'tsup'
import * as fse from 'fs-extra'

export default defineConfig({
  entry: ['src/index.ts', 'src/web.ts', 'src/generated/index.ts'],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  onSuccess: async () => {
    // copy all wasm files to dist
    fse.copy('src/fpzip/fpzip_wasm.wasm', 'dist/fpzip_wasm.wasm')
  },
})
