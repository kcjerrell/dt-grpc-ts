import { ChannelCredentials } from '@grpc/grpc-js'
import cliProgress from 'cli-progress'
import { hostname } from 'os'
import { buildConfig, buildConfigBuffer } from './config'
import { getCredentials } from './cred'
import {
  DeviceType,
  EchoReply,
  EchoRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationServiceClient
} from './generated/grpc/imageService'
import { ImageBuffer } from './imageBuffer'
import { isRequestBuilder, RequestBuilder } from './imageRequestBuilder'
import { decodeOverride, EmptyOverride, Override } from './override'
import { decodePreview } from './previews'
import { Config, Hints } from './types'
import { sha256 } from './util'

const cred = getCredentials()

let id = 0

export type UpdateData = {
  signpost: ReturnType<ImageGenerationResponse['toObject']>['currentSignpost']
  preview?: ImageBuffer
}

export type GenerateImageOptions<T extends 'tensor' | 'imagebuffer' = 'imagebuffer'> = {
  onUpdate?: (e: UpdateData) => void
  outputFormat?: T
  abortSignal?: AbortSignal
}

export type ImageRequest = {
  config: Config
  prompt: string
  negativePrompt: string
  image?: Uint8Array
  mask?: Uint8Array
  hints?: Hints
  contents?: Uint8Array[]
  override?: { [Prop in keyof Override]: Uint8Array }
}

/**
 * The DTService class provides a simplified interface to a Draw Things gRPC server
 *
 * It encapsulates the gRPC client and provides a single method to generate an
 * image.
 *
 * @example
 * const service = new DTService('localhost:7859')
 * const request = buildRequest({ width: 512, height: 512 }, "a cat", "low quality, watermark")
 * const result = await service.generateImage(request)
 * await result[0].toFile("cat.png")
 *
 * see the examples folder for more
 */
export class DTService {
  client: ImageGenerationServiceClient
  defaultTimeout: number = 10000
  retries: number = 3
  models: Override = EmptyOverride

  constructor(address: string, opts?: { defaultTimeout?: number; credentials?: ChannelCredentials })
  constructor(client: ImageGenerationServiceClient)
  /**
   * Initializes a new instance of the DTService class.
   *
   * @param arg1 - A string representing the address of the gRPC server or an instance of ImageGenerationServiceClient.
   * @param arg2 - Optional configuration object containing:
   *   @param defaultTimeout - The default timeout value for requests, in milliseconds.
   *   @param credentials - Channel credentials for the gRPC connection.
   *   @param retries - The number of retry attempts for requests.
   *
   * @throws Error if the arguments are invalid.
   */

  constructor(
    arg1: string | ImageGenerationServiceClient,
    arg2?: { defaultTimeout?: number; credentials?: ChannelCredentials; retries?: number }
  ) {
    if (arg1 instanceof ImageGenerationServiceClient) {
      this.client = arg1
    } else if (typeof arg1 === 'string') {
      this.client = new ImageGenerationServiceClient(arg1, arg2?.credentials ?? cred, {
        'grpc.max_receive_message_length': Infinity,
        'grpc.max_send_message_length': Infinity,
      })

      if (arg2?.defaultTimeout) this.defaultTimeout = arg2.defaultTimeout
      if (arg2?.retries) this.retries = arg2.retries
    } else {
      throw new Error('Invalid arguments')
    }
  }

  async echo(name?: string) {
    await this.waitForReady()

    return new Promise<
      Omit<ReturnType<EchoReply['toObject']>, 'override'> & {
        override: Override
      }
    >((resolve, reject) => {
      this.client.Echo(new EchoRequest({ name: name ?? 'no-name' }), {}, (err, res) => {
        if (err) reject(err)

        const data = res?.toObject()
        const override = decodeOverride(data?.override)
        this.models = override

        resolve({ ...data, override }!)
      })
    })
  }

  async generateImage<T extends 'tensor' | 'imagebuffer' = 'imagebuffer'>(
    request: ImageRequest | RequestBuilder,
    opts: GenerateImageOptions<T> = {}
  ): Promise<T extends 'tensor' ? Uint8Array[] : ImageBuffer[]> {
    const req = isRequestBuilder(request) ? await request.build() : request
    const { abortSignal, onUpdate, outputFormat } = opts

    const config = buildConfig({ id: id++, ...req.config })
    const configBuffer = buildConfigBuffer(config)

    if (this.models.models.length === 0) {
      await this.echo()
    }

    const modelVersion = this.models.models.find(m => m.file === config.model || m.name === config.model)?.version

    const message = ImageGenerationRequest.fromObject({
      scaleFactor: 1,
      user: hostname(),
      device: DeviceType.LAPTOP,
      configuration: configBuffer,
      prompt: req.prompt,
      negativePrompt: req.negativePrompt,
      image: req.image,
      mask: req.mask,
      hints: req.hints,
      contents: req.contents,
      override: req.override,
    })

    await this.waitForReady()

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar1.start(config.steps ?? 1, 0)

    const responseImages: Uint8Array[] = []

    return new Promise<Uint8Array[] | ImageBuffer[]>((resolve, reject) => {
      const grpcRequest = this.client
        .GenerateImage(message)

        // data
        .on('data', async (e: ImageGenerationResponse) => {
          const res = e.toObject()
          const signpost = res.currentSignpost

          if (signpost?.sampling?.step) bar1.update(signpost.sampling.step)

          if (res.generatedImages?.length) {
            responseImages.push(...res.generatedImages)
          } else if (onUpdate && signpost) {
            const preview = res.previewImage?.byteLength
              ? new ImageBuffer(await decodePreview(Uint8Array.from(res.previewImage), modelVersion))
              : undefined
            onUpdate({ signpost, preview })
          }
        })

        // status
        // .on('status', (e: ImageGenerationRequest) => console.debug('status', e))

        // error
        .on('error', (e: ImageGenerationResponse) => {
          console.error('error', e)
          bar1.stop()
          reject(e)
        })

        // metadata
        // .on('metadata', (e: ImageGenerationResponse) => console.debug('metadata', e))

        // close
        .on('close', (e: ImageGenerationRequest) => {
          bar1.stop()
          if (outputFormat === 'tensor') resolve(responseImages.map(im => Uint8Array.from(im)))
          else resolve(Promise.all(responseImages.map(im => ImageBuffer.fromDTTensor(Uint8Array.from(im)))))
        })

      // end
      // .on('end', (e: ImageGenerationRequest) => console.debug('end', e))

      if (abortSignal) abortSignal.onabort = () => grpcRequest.cancel()
    }) as Promise<T extends 'tensor' ? Uint8Array[] : ImageBuffer[]>
  }

  /**
   * Wait for the gRPC client to be ready
   * @param {number} [timeout=this.defaultTimeout] timeout in milliseconds
   * @returns {Promise<void>}
   * @throws {Error} if the client is not ready after max retries
   */
  async waitForReady(timeout: number = this.defaultTimeout) {
    for (let i = 0; i < this.retries; i++) {
      if (i > 0) console.log('Retrying... (', i, ' of ', this.retries, ')')
      try {
        await new Promise<void>((resolve, reject) => {
          this.client.waitForReady(Date.now() + timeout, err => {
            if (err) reject(err)
            else resolve()
          })
        })
        return
      } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'message' in e) console.error(e?.message)
        else console.error(e)
        if (i === this.retries - 1) throw e
      }
    }
  }
}

function addToContents(contents: Uint8Array[], item?: Uint8Array) {
  if (!item) return undefined

  contents.push(item)
  return sha256(item)
}
