import { ImageRequest } from './dtService'
import { getBaseConfig } from './config'
import { buildHints, HintType } from './hintsBuilder'
import { BufferWithInfo, ImageBuffer, resize } from './imageBuffer'
import { convertImageToMask } from './imageHelpers'
import { encodeOverride, Override } from './override'
import { Config } from './types'
import { sha256 } from './util'

const imageRequestBuilderSymbol = Symbol.for('dt-grpc-ts.imageRequestBuilder')

/**
 * Construct a request to generate an image from a prompt.
 *
 * @param config Optional configuration overrides. See the `Config` type for
 *   valid options.
 * @param prompt The prompt to generate an image from.
 * @param negativePrompt The negative prompt to generate an image from. If
 *   this is not specified, the model will generate an image from the prompt
 *   without any additional guidance.
 *
 * @returns A builder object that can be used to add additional information to
 *   the request.
 */
export function buildRequest(
  config: Partial<Config> = {},
  prompt: string = '',
  negativePrompt: string = ''
): RequestBuilder<false, false> {
  const request = {} as ImageRequest

  request.config = checkConfig({ ...getBaseConfig(), ...config })
  request.prompt = prompt
  request.negativePrompt = negativePrompt
  request.contents = []

  const width = request.config.width!
  const height = request.config.height!

  const inputs: {
    image?: ImageBuffer
    mask?: ImageBuffer
    hints: { hintType: HintType; image: ImageBuffer; weight: number }[]
    overrides?: Partial<Override>
  } = { hints: [] }

  return {
    [imageRequestBuilderSymbol]: true,
    addImage(image: BufferWithInfo) {
      inputs.image = new ImageBuffer(image)
      return this
    },

    addMask(mask: BufferWithInfo) {
      inputs.mask = new ImageBuffer(mask)
      return this
    },

    addHint(hintType: HintType, image: BufferWithInfo, weight: number) {
      inputs.hints.push({ hintType, image: new ImageBuffer(image), weight })
      return this
    },

    addHints(hints: { hintType: HintType; image: BufferWithInfo; weight: number }[]) {
      for (const hint of hints) this.addHint(hint.hintType, hint.image, hint.weight)
      return this
    },

    addOverride<T extends keyof Override>(type: T, value: Override[T] | Override[T][number]) {
      if (!inputs.overrides) inputs.overrides = {}
      if (!inputs.overrides[type]) inputs.overrides[type] = []
      inputs.overrides[type].push(...(Array.isArray(value) ? value : [value]))
      return this
    },
    addOverrides(overrides: Partial<Override>) {
      for (const type in overrides) {
        const key = type as keyof Override
        const items = overrides[key] ?? []
        this.addOverride(key, items)
      }
      return this
    },

    async build() {
      if (inputs.image) {
        const resized = await resize(inputs.image, width, height)
        const tensor = await resized.toDTTensor()
        request.image = sha256(tensor)
        request.contents!.push(tensor)
      }
      if (inputs.mask) {
        const resized = await resize(inputs.mask, width, height)
        const tensor = convertImageToMask(resized)
        request.mask = sha256(tensor)
        request.contents!.push(tensor)
      }
      if (inputs.hints.length) {
        const hb = buildHints()

        for (const hint of inputs.hints) {
          const resized = await resize(hint.image, width, height)

          if (hint.hintType === 'depth') {
            const singleChannel = await resized.sharp(s => s.grayscale().extractChannel(0))
            hb.addHintImage('depth', await singleChannel.toDTTensor(), hint.weight)
            continue
          }

          if (hint.hintType === 'pose') {
            const poseImage = await resized.sharp(s => s.removeAlpha())
            const min = poseImage.minimum().minValue
            const max = poseImage.maximum().maxValue
            poseImage.map(p => p.map(v => ((v - min) / (max - min)) * 127 + 127))
            hb.addHintImage('pose', await poseImage.toDTTensor(), hint.weight)

            if (request.config.hiresFix && request.config.hiresFixStartWidth && request.config.hiresFixStartHeight) {
              const small = await resize(poseImage, request.config.hiresFixStartWidth, request.config.hiresFixStartHeight)
              hb.addHintImage('pose', await small.toDTTensor(), hint.weight)
            }
            continue
          }

          const tensor = await resized.toDTTensor()
          hb.addHintImage(hint.hintType, tensor, hint.weight)
        }

        const { hints, contents } = hb.buildsHintsWithContents()

        request.hints = hints
        request.contents!.push(...contents)
      }
      if (inputs.overrides) {
        request.override = encodeOverride(inputs.overrides)
      }

      return request
    },
  } as RequestBuilder<false, false>
}

export type RequestBuilder<Image extends boolean = true, Mask extends boolean = true> = {
  /**
   * Adds a control hint image to the request, for use with controlnets
   * Images will be resized to match the config if necessary
   * Images with the depth hint type will be converted to grayscale
   *
   * @param hintType - The type of hint to be added.
   * @param image - The image to be added as a hint.
   * @param weight - The weight of the hint.
   */
  addHint(hintType: HintType, image: BufferWithInfo, weight: number): RequestBuilder<Image, Mask>
  addHints(
    hints: { hintType: HintType; image: BufferWithInfo; weight: number }[]
  ): RequestBuilder<Image, Mask>
  addOverride<T extends keyof Override>(type: T, value: Override[T]): RequestBuilder<Image, Mask>
  addOverrides(overrides: Partial<Override>): RequestBuilder<Image, Mask>

  /**
   * Builds the request and returns a `GenerateImageOptions` object.
   *
   * @returns The built request.
   */
  build(): Promise<ImageRequest>
} & (Mask extends true
  ? {}
  : {
      /**
       * Adds a mask to the request. For best results, should be black and white.
       * Will be resized to match the config if necessary.
       *
       * @param mask - The mask to be added.
       */
      addMask(mask: BufferWithInfo): RequestBuilder<Image, true>
    }) &
  (Image extends true
    ? {}
    : {
        /**
         * Adds an input image to the request. Images can be loaded with ImageBuffer class
         * Will be resized to match the config if necessary
         *
         * @param image - The image to be added.
         */
        addImage(image: BufferWithInfo): RequestBuilder<true, Mask>
      })

export function isRequestBuilder(input: unknown): input is RequestBuilder {
  return (
    typeof input === 'object' &&
    input !== null &&
    imageRequestBuilderSymbol in input &&
    input[imageRequestBuilderSymbol] === true
  )
}

function checkConfig(config: Partial<Config>) {
  const sizeKeys = [
    'width',
    'height',
    'hiresFixStartHeight',
    'hiresFixStartWidth',
    'decodingTileHeight',
    'decodingTileWidth',
    'decodingTileOverlap',
    'diffusionTileHeight',
    'diffusionTileWidth',
    'diffusionTileOverlap',
  ] as const

  for (const key of sizeKeys) {
    config[key] = Math.max(Math.round((config[key] ?? 0) / 64) * 64, 64)
  }

  return config
}
