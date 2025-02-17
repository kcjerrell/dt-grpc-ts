import sharp from 'sharp'
import { Float16Array, setFloat16 } from '@petamoriken/float16'

/**
 * @param responseImage the image data, from ImageGenerationReponse.generatedImages
 * @returns an object with the image data, size, and channel count
 */
export function convertResponseImage(responseImage: Uint8Array) {
  const intBuffer = new Uint32Array(responseImage.buffer, 0, 17)
  const [height, width, channels] = intBuffer.slice(6, 9)

  const offset = 68
  const length = width * height * channels * 2

  console.debug(`${width}x${height} image with ${channels} channels`)
  console.debug(`Input size: ${responseImage.byteLength} (Expected: ${length + 68})`)

  const f16rgb = new Float16Array(responseImage.buffer, offset, length / 2)

  const u8c = Uint8ClampedArray.from(f16rgb, float16ToUint8)

  return {
    data: u8c,
    width,
    height,
    channels,
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

export async function convertImageForRequest(
  input:
    | Buffer
    | ArrayBuffer
    | Uint8Array
    | Uint8ClampedArray
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array
    | string
) {
  const image = sharp(input)
  const metadata = await image.metadata()

  const u8 = await image.removeAlpha().raw().toBuffer()

  const data = new Uint8Array(68 + metadata.width! * metadata.height! * metadata.channels! * 2)
  const dv = new DataView(data.buffer)

  u8.forEach((v, i) => setFloat16(dv, i * 2 + 68, v / 127 - 1, true))

  dv.setUint32(1 * 4, 1, true)
  dv.setUint32(2 * 4, 2, true)
  dv.setUint32(3 * 4, 131072, true)
  dv.setUint32(5 * 4, 1, true)
  dv.setUint32(6 * 4, metadata.width!, true)
  dv.setUint32(7 * 4, metadata.height!, true)
  dv.setUint32(8 * 4, metadata.channels!, true)

  // const header = new Uint32Array(17)
  // header[0] = 0 // type?
  // header[1] = 1 // format
  // header[2] = 2 // datatype
  // // header[3] reserved
  // // header[4] = 0
  // header[5] = 1 // ?
  // header[6] = metadata.width!
  // header[7] = metadata.height!
  // header[8] = metadata.channels!

  return Uint8Array.from(data)
}

function float16ToUint8(f16: number) {
  return (f16 + 1) * 127
}
