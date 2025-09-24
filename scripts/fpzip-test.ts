import fse from 'fs-extra'
// import { createFpzip } from '../src/fpzip/fpzip'
import { convertResponseImage } from '../src/imageHelpers'
import { ImageBuffer } from '../src/imageBuffer'
import { decompress } from '../src/fpzip/decompress'

const filepath = '/Users/kcjer/Desktop/t/dtpose-image_1.dat'
const filedata = fse.readFileSync(filepath)

async function test() {

  // const fpzip = await createFpzip()

  // After: const wasm = await createModule();  // or your factor


  // const decompress = fpzip.decompress

  const item = new Uint8Array(filedata.length)
  filedata.copy(item)
  const header = new Uint32Array(item.buffer, 0, 17)
  const [width, height, channels] = header.slice(6, 9)

  // Debug: log first 16 bytes of input buffer (should not be all zeros)
  // console.log('First 16 bytes of compressed input:', Array.from(item.subarray(68, 68 + 16)));

  const decompressed = await decompress(item.subarray(68));

  // Debug: log first 16 floats of decompressed output
  // console.log('First 16 floats of decompressed:', Array.from(decompressed.slice(0, 16)));

  // Check if decompressed is all zeros
  if (decompressed.every(v => v === 0)) {
    throw new Error('Decompressed output is all zeros! Decompression likely failed.');
  }


  // Get header as bytes
  const headerBytes = new Uint8Array(item.buffer, 0, 68);
  // Use Node's built-in Float16Array to convert
  // (Float16Array is available in Node.js v20+)
  const float16 = new Float16Array(decompressed.length);
  float16.set(decompressed);
  const bytes = new Uint8Array(float16.buffer);
  // 102, 112, 121, 41, 135, 14, 241, 17, 237, 2
  // Combine header and float16 bytes
  const data = new Uint8Array(headerBytes.length + bytes.length);
  data.set(headerBytes, 0);
  data.set(bytes, headerBytes.length);

  const image = ImageBuffer.fromDTTensor(data);
}

async function testTest(n = 200, reportEvery = 20, sleep = 20) {
  const usages = {
    rss: [],
    heapTotal: [],
    heapUsed: [],
    external: [],
    arrayBuffers: []
  }

  for (let i = 0; i < n; i++) {
    await test()
    if (i % reportEvery === 0) {
      console.log(`Run ${i} of ${n}`)
      await new Promise(resolve => setTimeout(resolve, sleep * 20))
      const usage = process.memoryUsage()
      for (const key in usage) {
        usages[key].push(usage[key])
      }
      for (const key in usages) {
        console.log(`    ${key}: ${usages[key].map(v => v.toPrecision(3)).join(', ')}`)
      }
    }

    if (sleep)
      await new Promise(resolve => setTimeout(resolve, sleep))
  }
}

setInterval(() => { }, 1 << 30);
testTest(200).then(() => setTimeout(() => {
  console.log(process.memoryUsage())
  process.exit()
}, 5000))