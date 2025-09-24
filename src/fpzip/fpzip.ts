// fpzip.ts
import FpzipModuleFactory from './fpzip_wasm.js';

export interface FpzipApi {
  compress(input: Uint8Array): Uint8Array;
  decompress(input: Uint8Array, outputSize: number): Uint8Array;
  // expose raw module if needed
  module: any;
}

export async function createFpzip(): Promise<FpzipApi> {
  // Instantiate the raw Emscripten module
  const wasm = await FpzipModuleFactory();

  // Helper to get a Uint8Array view over WASM memory
  const getHeapU8 = (): Uint8Array => {
    if (wasm.HEAPU8) return wasm.HEAPU8;
    if (wasm.exports?.memory) return new Uint8Array(wasm.exports.memory.buffer);
    throw new Error('WASM memory not exposed');
  };

  function compress(input: Uint8Array): Uint8Array {
    const heap = getHeapU8();

    const ptr = wasm._malloc(input.length);
    heap.set(input, ptr);

    const outPtr = wasm._fpzip_write(ptr, input.length);
    // you’d need to track output size if fpzip_write returns pointer only
    // adjust this logic to your C++ API’s return contract

    wasm._free(ptr);
    return heap.slice(outPtr, outPtr /* computed output size */);
  }

  function decompress(input: Uint8Array, outputSize: number): Uint8Array {
    const heap = getHeapU8();

    const ptr = wasm._malloc(input.length);
    heap.set(input, ptr);

    const outPtr = wasm._malloc(outputSize)
  const res =  wasm._fpzip_read(ptr, outPtr);
    // as above, work out actual size from fpzip_read contract
console.log(res)
    wasm._free(ptr);
    return heap.slice(outPtr, outPtr + outputSize);
  }

  return { compress, decompress, module: wasm };
}
