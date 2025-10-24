interface FpzipModule {
    _fpzip_read_from_buffer(inputPtr: number): number;
    _fpzip_read_header(fpzPtr: any): number;
    _fpzip_read(fpzPtr: any, outputPtr: number): number;
    _fpzip_read_close(fpzPtr: any): unknown;
    _malloc(size: number): number;
    _free(ptr: number): void;
    HEAPU8: Uint8Array;
}

import fpzipModule from './fpzip_wasm.js';

let _fpzip: FpzipModule | null = null;
async function loadFpzip(): Promise<FpzipModule> {
    if (!_fpzip)
        _fpzip = await fpzipModule() as FpzipModule
    return _fpzip!
}

export async function decompress(data: Uint8Array): Promise<Float32Array> {
    const fpzip = await loadFpzip()

    let inputPtr: number | null = null
    let fpzPtr: number | null = null
    let outputPtr: number | null = null

    try {
        // Allocate memory for the input data
        inputPtr = fpzip._malloc(data.length);
        fpzip.HEAPU8.set(data, inputPtr);

        // array metadata and stream handle
        fpzPtr = fpzip._fpzip_read_from_buffer(inputPtr);

        // read the header
        const headerSuccess = fpzip._fpzip_read_header(fpzPtr);
        if (!headerSuccess) {
            throw new Error('Failed to read header')
        }

        // read the fpzip header to see how many bytes to allocate for the output
        const [type, prec, nx, ny, nz, nf] = new Int32Array(fpzip.HEAPU8.buffer, fpzPtr, 6)

        const size = nx * ny * nz * nf * (type === 0 ? 4 : 8)
        outputPtr = fpzip._malloc(size);

        const bytesRead = fpzip._fpzip_read(fpzPtr, outputPtr)
        if (bytesRead !== data.length) {
            throw Error(`Failed to read ${data.length} bytes, read ${bytesRead} bytes`)
        }

        const floats = new Float32Array(size / 4)
        floats.set(new Float32Array(fpzip.HEAPU8.buffer, outputPtr, size / 4))

        return floats
    } finally {
        if (inputPtr !== null) fpzip._free(inputPtr)
        if (fpzPtr !== null) fpzip._fpzip_read_close(fpzPtr)
        if (outputPtr !== null) fpzip._free(outputPtr)
    }
}