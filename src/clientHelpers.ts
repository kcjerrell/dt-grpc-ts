import { ChannelCredentials, credentials, Deadline } from '@grpc/grpc-js'
import cliProgress from 'cli-progress'
import { hostname } from 'os'
import { buildConfig, buildConfigBuffer } from './config'
import {
  DeviceType,
  EchoReply,
  EchoRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationServiceClient,
  ImageGenerationSignpostProto,
} from './generated/grpc/imageService'
import { decodeOverride, Override } from './override'
import { Config, Hints } from './types'
import { sha256 } from './util'

let id = 0

export function getClient(
  address: string,
  opts?: { defaultTimeout?: number; credentials?: ChannelCredentials }
): ClientHelper {
  const client = new ImageGenerationServiceClient(address, credentials.createInsecure(), {
    'grpc.max_receive_message_length': Infinity,
    'grpc.max_send_message_length': Infinity,
  })

  return new ClientHelper(client)
}

export type GenerateImageOptions = {
  config: Config
  prompt: string
  negativePrompt: string
  image?: Uint8Array
  mask?: Uint8Array
  hints?: Hints
  contents?: Uint8Array[]
  override?: { [Prop in keyof Override]: Uint8Array }
}

export class ClientHelper {
  client: ImageGenerationServiceClient
  defaultTimeout: number = 10000

  constructor(client: ImageGenerationServiceClient) {
    this.client = client
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

        resolve({ ...data, override }!)
      })
    })
  }

  async generateImage(
    opts: GenerateImageOptions,
    updateCallback?: (
      signpost: ReturnType<ImageGenerationSignpostProto['toObject']>,
      previewImage?: Uint8Array
    ) => void,
    signal?: AbortSignal
  ) {
    const config = buildConfig({ id: id++, ...opts.config })
    const configBuffer = buildConfigBuffer(config)

    const request = ImageGenerationRequest.fromObject({
      scaleFactor: 1,
      user: hostname(),
      device: DeviceType.LAPTOP,
      configuration: configBuffer,
      prompt: opts.prompt,
      negativePrompt: opts.negativePrompt,
      image: opts.image,
      mask: opts.mask,
      hints: opts.hints,
      contents: opts.contents,
      override: opts.override,
    })

    await this.waitForReady()

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar1.start(config.steps ?? 1, 0)

    return new Promise<Uint8Array[]>((resolve, reject) => {
      const grpcRequest = this.client
        .GenerateImage(request)

        // data
        .on('data', async (e: ImageGenerationResponse) => {
          const res = e.toObject()
          const signpost = res.currentSignpost

          if (signpost?.sampling?.step) bar1.update(signpost.sampling.step)

          if (res.generatedImages?.length) {
            bar1.stop()
            resolve(e.generatedImages.map(im => Uint8Array.from(im)))
          } else if (updateCallback && signpost) {
            const preview = res.previewImage?.byteLength
              ? Uint8Array.from(res.previewImage)
              : undefined
            updateCallback(signpost, preview)
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
      // .on('close', (e: ImageGenerationRequest) => console.debug('close', e))

      // end
      // .on('end', (e: ImageGenerationRequest) => console.debug('end', e))

      if (signal) signal.onabort = () => grpcRequest.cancel()
    })
  }

  async waitForReady(deadline: Deadline = Infinity) {
    return new Promise<void>((resolve, reject) => {
      this.client.waitForReady(deadline, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

function addToContents(contents: Uint8Array[], item?: Uint8Array) {
  if (!item) return undefined

  contents.push(item)
  return sha256(item)
}
