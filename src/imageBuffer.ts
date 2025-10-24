import sharp, { Sharp } from 'sharp'
import { convertImageForRequest, convertResponseImage } from './imageHelpers'

export class ImageBuffer implements BufferWithInfo {
  static async fromFile(filename: string) {
    const buffer = await sharp(filename).raw().toBuffer({ resolveWithObject: true })
    return new ImageBuffer(buffer)
  }

  readonly data: Uint8Array
  readonly width: number
  readonly height: number
  readonly channels: 1 | 2 | 3 | 4
  readonly colorChannels: 1 | 2 | 3

  /**
   * Create an ImageBuffer instance using the provided data buffer
   * Note - this does not create a new data buffer, it uses the buffer
   * provided. If you modify this instance with .setPixel,
   * the original will be updated as well.
   * @param data the source DataBuffer to use. Should be an array of uint8 RGB(A) values (0-255), of length width*height*channels
   */
  constructor(data: ImageBufferType, width: number, height: number, channels: 1 | 2 | 3 | 4)

  /**
   * Create an ImageBuffer instance using the provided BufferWithInfo (or another ImageBuffer instance)
   * Note - this does not create a new data buffer, it reuses the buffer
   * provided. If you modify this instance with .setPixel,
   * the original will be updated as well.
   * @param image the source BufferWithInfo to use
   */

  constructor(image: BufferWithInfo)
  /**
   * Create a new ImageBuffer instance of the specified size, If a fill color is provided, the
   * buffer will be initialized with that value. Otherwise, all pixels will be set to 0 (including
   * alpha)
   * @param width
   * @param height
   * @param channels
   * @param fill optionally fill the new buffer with the provided color. Must be the same length as the number of channels
   */
  constructor(width: number, height: number, channels: 1 | 2 | 3 | 4, fill?: number[])

  /**
   * Create a new ImageBuffer instance from the output of Sharp.raw().toBuffer({ resolveWithObject: true })
   */
  constructor(sharpBuffer: SharpBuffer)
  constructor(
    ...args: [
      BufferWithInfo | ImageBufferType | number | { data: Buffer; info: sharp.OutputInfo },
      number?,
      number?,
      (number | number[])?
    ]
  ) {
    // this constructor is nasty long but it makes a *lot* of other code much simpler
    // create an empty buffer of the given size, probably initialized to 0
    if (typeof args[0] === 'number') {
      const [width, height, channels = 4, fill] = args as [
        number,
        number,
        number,
        number[] | undefined
      ]
      this.width = width
      this.height = height

      if (channels < 1 || channels > 4) throw new Error('Channels must be between 1 and 4')
      if (fill && fill.length !== channels)
        throw new Error('Fill array must be same length as number of channels')
      this.channels = channels as 1 | 2 | 3 | 4
      this.colorChannels = Math.min(this.channels, 3) as 1 | 2 | 3
      this.data = new Uint8Array(width * height * this.channels)
      if (fill) {
        for (let i = 0; i < width * height * this.channels; i += 1)
          this.data[i] = fill[i % channels]
      }
    }
    // wrap an object that is BufferWithInfo
    else if (isBufferWithInfo(args[0])) {
      const { data, width, height, channels } = args[0] as BufferWithInfo
      this.data = new Uint8Array(data)
      this.width = width
      this.height = height
      this.channels = channels
      this.colorChannels = Math.min(this.channels, 3) as 1 | 2 | 3
    }
    // take an array and size info
    else if (Array.isArray(args[0]) || 'byteLength' in args[0]) {
      const [data, width, height, channels] = args as [ImageBufferType, number, number, number]

      if (data.byteLength != width * height * channels)
        throw new Error(
          `image size (${width}x${height}, ${channels} channels) does not match data size (${data.byteLength
          }). Expected ${width * height * channels}`
        )

      this.data = new Uint8Array(data)
      this.width = width
      this.height = height

      if (channels < 1 || channels > 4) throw new Error('Channels must be between 1 and 4')
      this.channels = channels as 1 | 2 | 3 | 4
      this.colorChannels = Math.min(this.channels, 3) as 1 | 2 | 3

      this.data = new Uint8Array(data)
    }
    // use the output from sharp().raw().toBuffer()
    else if (isSharpBuffer(args[0])) {
      const { data, info } = args[0] as SharpBuffer
      this.data = data
      this.width = info.width
      this.height = info.height
      this.channels = info.channels
      this.colorChannels = Math.min(this.channels, 3) as 1 | 2 | 3
    }
    // throw
    else throw new Error('invalid args')
  }

  /**
   * Sets the pixel value at a specified (x, y) coordinate in the image buffer.
   *
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @param value - An array representing the color values to set
   * @param gray - If true, the grayscale value from `value[0]` is applied to all color channels.
   */
  setPixel(x: number, y: number, value: Uint8Array | number[], gray = false) {
    const addr = (y * this.width + x) * this.channels
    for (let c = 0; c < this.colorChannels; c += 1)
      this.data[addr + c] = gray ? value[0] ?? 0: value[c] ?? 0
    if (this.channels === 4) this.data[addr + 3] = value[3] ?? 255
  }

  /**
   * Retrieves the pixel value at a specified (x, y) coordinate from the image buffer.
   *
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @returns An array representing the color values of the pixel.
   */
  getPixel(x: number, y: number) {
    const addr = (y * this.width + x) * this.channels
    return this.data.slice(addr, addr + this.channels)
  }

  minimum() {
    let minValue = 255
    let minGray = 255
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = this.getPixel(x, y)
        const gray = p[0] + p[1] + p[2]
        const min = Math.min(p[0], p[1], p[2])
        if (min < minValue) minValue = min
        if (gray < minGray) minGray = gray
      }
    }
    return { minValue, minGray: minGray / 3 }
  }

  maximum() {
    let maxValue = 0
    let maxGray = 0
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = this.getPixel(x, y)
        const gray = p[0] + p[1] + p[2]
        const max = Math.max(p[0], p[1], p[2])
        if (max > maxValue) maxValue = max
        if (gray > maxGray) maxGray = gray
      }
    }
    return { maxValue, maxGray: maxGray / 3 }
  }

  map(mapFn: mapFn) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = this.getPixel(x, y)
        this.setPixel(x, y, mapFn(p, x, y))
      }
    }
  }

  sharp(): Sharp
  sharp(pipeline: (sharp: Sharp) => Sharp): Promise<ImageBuffer>
  /**
   * Creates a Sharp image object from the image buffer.
   *
   * If called without arguments, it returns the Sharp object.
   *
   * If called with a pipeline function, it applies the pipeline and returns a new
   * `ImageBuffer` object.
   *
   * @param pipeline - A function that takes a Sharp object and returns a Sharp object.
   * @returns A `Sharp` object or a `Promise<ImageBuffer>`.
   */
  sharp(...args: [(sharp: Sharp) => Sharp] | []): Promise<ImageBuffer> | Sharp {
    const s = sharp(this.data, {
      raw: { width: this.width, height: this.height, channels: this.channels },
    })

    if (args[0]) return ImageBuffer.fromPipeline(args[0](s))
    return s
  }

  async composite(image: ImageBuffer, mix = 0.5, blendMode: sharp.Blend = 'over'): Promise<ImageBuffer> {
    const inputImage = await image.sharp().removeAlpha().ensureAlpha(mix).png().toBuffer()
    return await this.sharp(s =>
      s.composite([
        {
          input: inputImage,
          blend: blendMode,
        },
      ])
    )
  }

  clone() {
    return new ImageBuffer(Buffer.from(this.data), this.width, this.height, this.channels)
  }

  /**
   * Converts the image buffer to a Base64-encoded PNG string.
   *
   * @returns A promise that resolves to a Base64 string representing the image in PNG format.
   */
  async toBase64Png() {
    return (await this.sharp().png().toBuffer()).toString('base64')
  }

  /**
   * Converts the image buffer to a Data URL string. Can be used directly in <img src={dataUrl}>
   *
   * @returns A promise that resolves to a Data URL string representing the image in PNG format.
   */
  async toDataUrl() {
    const png64 = await this.toBase64Png()
    return `data:image/png;base64,${png64}`
  }

  /**
   * Converts the image buffer to a DTTensor buffer. If the image buffer has less than 4 channels,
   * it will be converted to a 4-channel buffer with the alpha channel set to 255.
   *
   * @returns A promise that resolves to a DTTensor buffer.
   */
  toDTTensor() {
    // if (this.channels !== 4) {
    //   const buf = new Uint8Array(this.width * this.height * 4)
    //   for (let i = 0; i < this.width * this.height; i += 1) {
    //     const [r, g, b] = this.getPixel(i % this.width, Math.floor(i / this.width))
    //     buf[i * 4] = r
    //     buf[i * 4 + 1] = g
    //     buf[i * 4 + 2] = b
    //     buf[i * 4 + 3] = 255
    //   }
    //   const imgBuf = new ImageBuffer(buf, this.width, this.height, 4)
    //   return convertImageForRequest(imgBuf)
    // }
    return convertImageForRequest(this)
  }

  /**
   * Saves the image buffer to a file using default settings for the format.
   * For more control over output, use imageBuffer.toSharp().png(options).toFile()
   *
   * @param path - The path to the file to write.
   * @returns A promise that resolves when the file is written.
   */
  async toFile(path: string) {
    return await this.sharp().toFile(path)
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Creates an ImageBuffer from a DTTensor buffer as returned from an ImageGeneration gRPC request
   *
   * @param data - The DTTensor buffer to convert to an ImageBuffer.
   * @returns A new ImageBuffer object.
   */
  /*******  8d939cb2-b72d-4b10-8753-f8092f26a5b8  *******/
  static async fromDTTensor(data: Uint8Array) {
    return new ImageBuffer(await convertResponseImage(data))
  }

  /**
   * Creates an ImageBuffer from a Base64-encoded PNG string or Data URL
   *
   * If the string is a Data URL (starts with 'data:image/png;base64,'), that prefix is stripped before
   * decoding the Base64 data. If not, the entire string is decoded as Base64.
   *
   * @param data - A Base64-encoded PNG string or a Data URL.
   * @returns A promise that resolves to a new ImageBuffer object.
   */
  static async fromBase64(data: string) {
    const dataStart = data.startsWith('data:image/png;base64,')
      ? 'data:image/png;base64,'.length
      : 0
    const raw = await sharp(Buffer.from(data.slice(dataStart), 'base64'))

    return ImageBuffer.fromPipeline(raw)
  }

  /**
   * Creates an ImageBuffer from a Sharp pipeline.
   *
   * @param pipeline - A Sharp pipeline.
   * @returns A promise that resolves to a new ImageBuffer object.
   */
  static async fromPipeline(pipeline: Sharp) {
    return new ImageBuffer(await pipeline.raw().toBuffer({ resolveWithObject: true }))
  }
}

/**
 * resizes only if the image is not already the specified size
 * so this possibly may return the same input object
 */
export async function resize(
  img: ImageBuffer,
  width: number,
  height: number,
  fit: keyof sharp.FitEnum = 'fill',
  kernel: keyof sharp.KernelEnum = 'lanczos2'
) {
  if (img.width === width && img.height === height) return img

  return await img.sharp(s => s.resize(width, height, { fit: 'fill', kernel: 'lanczos2' }))
}

type mapFn = (pixel: Uint8Array, x: number, y: number) => Uint8Array

export type ImageBufferType =
  | ArrayBuffer
  | Uint8Array<ArrayBufferLike>
  | Uint32Array<ArrayBufferLike>
  | Uint8ClampedArray<ArrayBufferLike>
  | Buffer<ArrayBufferLike>
  | Int8Array<ArrayBufferLike>
  | Uint16Array<ArrayBufferLike>
  | Int16Array<ArrayBufferLike>
  | Int32Array<ArrayBufferLike>
  | Float32Array<ArrayBufferLike>
  | Float64Array<ArrayBufferLike>

type SharpBuffer = { data: Buffer; info: sharp.OutputInfo }
function isSharpBuffer(value: unknown): value is SharpBuffer {
  if (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'info' in value &&
    typeof value.info === 'object' &&
    value.info !== null &&
    'height' in value.info &&
    'width' in value.info &&
    'channels' in value.info
  )
    return true

  return false
}

export type BufferWithInfo = {
  data: ImageBufferType
  width: number
  height: number
  channels: 1 | 2 | 3 | 4
}
export function isBufferWithInfo(value: unknown): value is BufferWithInfo {
  if (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'width' in value &&
    'height' in value &&
    'channels' in value
  )
    return true

  return false
}
