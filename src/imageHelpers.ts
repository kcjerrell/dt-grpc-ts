import sharp from 'sharp'
import { Float16Array, setFloat16 } from '@petamoriken/float16'
import { BufferWithInfo } from './imageBuffer'
import { decompress } from './fpzip/decompress'

/**
 * Converts a raw response image buffer (from gRPC) into a usable `BufferWithInfo` object.
 * Handles decompression if the image is compressed.
 *
 * @param responseImage - The raw image data from `ImageGenerationResponse.generatedImages`.
 * @returns A promise that resolves to an object containing the image data, width, height, and channel count.
 */
export async function convertResponseImage(responseImage: Uint8Array): Promise<BufferWithInfo> {
  const intBuffer = new Uint32Array(responseImage.buffer, 0, 17)
  const [height, width, channels] = intBuffer.slice(6, 9)
  const length = width * height * channels * 2
  const offset = 68

  const isCompressed = intBuffer[0] === 1012247

  let f16rgb: Float16Array
  if (isCompressed) {
    const float32 = await decompress(responseImage.slice(68))
    f16rgb = Float16Array.from(float32)
  }
  else {
    f16rgb = new Float16Array(responseImage.buffer, offset, length / 2)
  }

  console.debug(`${width}x${height} image with ${channels} channels`)
  console.debug(`Input size: ${responseImage.byteLength} (Expected: ${length + 68})`)

  let u8c: Uint8ClampedArray

  u8c = Uint8ClampedArray.from(f16rgb, float16ToUint8)

  return {
    data: u8c!,
    width,
    height,
    channels: 3,
  }
}

/**
 * Saves a raw response image buffer to a file.
 *
 * @param responseImage - The raw image data from `ImageGenerationResponse.generatedImages`.
 * @param path - The file path to save the image to.
 * @returns A promise that resolves when the file is written.
 */
export async function saveResponseImage(responseImage: Uint8Array, path: string) {
  const { data, width, height, channels } = await convertResponseImage(responseImage)

  return await sharp(data, {
    raw: { width, height, channels: channels as 3 | 4 },
  }).toFile(path)
}

/**
 * Converts a `BufferWithInfo` object into the format required for an image generation request.
 * This involves converting pixel values to Float16 and adding a specific header.
 *
 * @param image - The source image.
 * @returns A Uint8Array containing the formatted image data.
 */
export function convertImageForRequest(image: BufferWithInfo) {
  // const f16rgb = new Uint8Array(68 + image.width! * image.height! * 3 * 2)
  const f16rgb = new Uint8Array(68 + image.width! * image.height! * image.channels! * 2)
  const dv = new DataView(f16rgb.buffer)

  const u8 = new Uint8Array(image.data)

  u8.forEach((v, i) => setFloat16(dv, i * 2 + 68, v / 127 - 1, true))

  dv.setUint32(0 * 4, 0, true)
  dv.setUint32(1 * 4, 1, true)
  dv.setUint32(2 * 4, 2, true)
  dv.setUint32(3 * 4, 131072, true)
  dv.setUint32(5 * 4, 1, true)
  dv.setUint32(6 * 4, image.height!, true)
  dv.setUint32(7 * 4, image.width!, true)
  dv.setUint32(8 * 4, image.channels!, true)

  // const header = new Uint32Array(17)
  // header[0] = 0 // type?
  // header[1] = 1 // format
  // header[2] = 2 // datatype
  // // header[3] reserved
  // // header[4] = 0
  // header[5] = 1 // ?
  // header[6] = metadata.height!
  // header[7] = metadata.width!
  // header[8] = metadata.channels!

  return Uint8Array.from(f16rgb)
}

function float16ToUint8(f16: number) {
  return (f16 + 1) * 127
}

/**
 * Converts an image into a mask format for inpainting.
 *
 * @param image - The source image (should be grayscale or have an alpha channel).
 * @param threshold - The threshold value to determine mask regions (default: 127).
 * @returns A Uint8Array containing the mask data.
 * @throws Error if the image is invalid.
 */
export function convertImageToMask(image: BufferWithInfo, threshold = 127): Uint8Array {
  if (
    !image ||
    image.width === undefined ||
    image.height === undefined ||
    image.channels === undefined
  ) {
    throw new Error('Invalid image')
  }

  const inputBuffer = new Uint8Array(image.data)
  const maskBuf = new Uint8Array(image.width! * image.height! + 68)

  const header = [0, 1, 1, 4096, 0, image.height, image.width, 0, 0]
  const dv = new DataView(maskBuf.buffer)
  header.forEach((v, i) => dv.setUint32(i * 4, v, true))

  const colorChans = Math.min(image.channels!, 3)
  const getValue = (addr: number) => {
    const value = inputBuffer.slice(addr, addr + colorChans).reduce((a, b) => a + b, 0) / colorChans
    // const alpha = image.channels! === 4 ? inputBuffer[addr + 3] : 255
    return value //* (alpha / 255)
  }
  const mapValue = (v: number) => {
    return v < threshold ? 0 : 2
  }

  // valid values for mask: 0-7
  // 0 = retain input image
  // 1 = 100% strength
  // 2 = config strength
  // 3-8 (presumably) alpha 0-255?

  // values > threshold  = 2, else 0
  for (let y = 0; y < image.height!; y += 1) {
    for (let x = 0; x < image.width!; x += 1) {
      const addrIn = (y * image.width! + x) * image.channels!
      const addrOut = y * image.width! + x + 68

      const v = getValue(addrIn)

      dv.setUint8(addrOut, mapValue(v))
    }
  }

  return maskBuf
}

function average(...values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}
