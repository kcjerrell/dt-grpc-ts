import sharp from 'sharp'
import { Float16Array, setFloat16 } from '@petamoriken/float16'
import { BufferWithInfo } from './imageBuffer'

/**
 * @param responseImage the image data, from ImageGenerationReponse.generatedImages
 * @returns an object with the image data, size, and channel count
 */
export function convertResponseImage(responseImage: Uint8Array): BufferWithInfo {
  const intBuffer = new Uint32Array(responseImage.buffer, 0, 17)
  const [height, width, channels] = intBuffer.slice(6, 9)

  const offset = 68
  const length = width * height * channels * 2

  console.debug(`${width}x${height} image with ${channels} channels`)
  console.debug(`Input size: ${responseImage.byteLength} (Expected: ${length + 68})`)

  const f16rgb = new Float16Array(responseImage.buffer, offset, length / 2)

  let u8c: Uint8ClampedArray

  // if (channels === 3)
  u8c = Uint8ClampedArray.from(f16rgb, float16ToUint8)

  // if (channels === 4) {
  //   u8c = new Uint8ClampedArray(width * height * 4)
  //   for (let i = 0; i < f16rgb.length; i += 1) {
  //     const [v0, v1, v2, v3] = [
  //       f16rgb[i * 4],
  //       f16rgb[i * 4 + 1],
  //       f16rgb[i * 4 + 2],
  //       f16rgb[i * 4 + 3],
  //     ]

  //     const r = 10.175 * v0 - 20.807 * v1 - 27.834 * v2 - 2.0577 * v3 + 143.39
  //     const g = 21.07 * v0 - 4.3022 * v1 - 11.258 * v2 - 18.8 * v3 + 131.53
  //     const b = 7.8454 * v0 - 2.3713 * v1 - 0.45565 * v2 - 41.648 * v3 + 120.76

  //     u8c[i * 4] = r //float16ToUint8(r)
  //     u8c[i * 4 + 1] = g //float16ToUint8(g)
  //     u8c[i * 4 + 2] = b //float16ToUint8(b)
  //     u8c[i * 4 + 3] = 255
  //   }
  // }

  return {
    data: u8c!,
    width,
    height,
    channels: 3,
  }
}

/**
 *
 * @param responseImage the image data, from ImageGenerationReponse.generatedImages
 * @param path file path to save the image
 */
export async function saveResponseImage(responseImage: Uint8Array, path: string) {
  const { data, width, height, channels } = convertResponseImage(responseImage)

  return await sharp(data, {
    raw: { width, height, channels: channels as 3 | 4 },
  }).toFile(path)
}

//TODO - come back to this
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
