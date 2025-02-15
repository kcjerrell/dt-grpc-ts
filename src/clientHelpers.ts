import { credentials } from '@grpc/grpc-js'
import { ByteBuffer } from 'flatbuffers'
import { buildConfigBuffer } from './config'
import { GenerationConfiguration } from './generated/data/generation-configuration'
import {
  EchoReply,
  EchoRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationServiceClient,
  ImageGenerationSignpostProto,
} from './generated/grpc/imageService'
import { Config } from './types'

let id = 0

export async function getClient(address: string) {
  const client = new ImageGenerationServiceClient(address, credentials.createInsecure(), {
    'grpc.max_receive_message_length': Infinity,
    'grpc.max_send_message_length': Infinity,
  })

  return new Promise<ClientHelper>((resolve, reject) => {
    client.waitForReady(Infinity, (error) => {
      if (error) reject(error)
      resolve(new ClientHelper(client))
    })
  })
}

export type GenerateImageOptions = {
  config: Config
  prompt: string
  negativePrompt: string
  image?: Uint8Array
  mask?: Uint8Array
}

class ClientHelper {
  client: ImageGenerationServiceClient

  constructor(client: ImageGenerationServiceClient) {
    this.client = client
  }

  async echo(name: string) {
    return new Promise<EchoReply>((resolve, reject) => {
      this.client.Echo(new EchoRequest({ name }), {}, (err, res) => {
        if (err) reject(err)
        resolve(res!)
      })
    })
  }

  async generateImage(
    opts: GenerateImageOptions,
    previewHandler?: (
      previewImage: Uint8Array,
      signpost: ReturnType<ImageGenerationSignpostProto['toObject']>
    ) => void
  ) {
    const config = buildConfigBuffer({ id: BigInt(id++), ...opts.config })

    console.log(
      GenerationConfiguration.getRootAsGenerationConfiguration(new ByteBuffer(config)).unpack()
    )

    const request = ImageGenerationRequest.fromObject({
      configuration: config,
      prompt: opts.prompt,
      negativePrompt: opts.negativePrompt,
      image: opts.image,
    })

    return new Promise<Uint8Array[]>((resolve, reject) => {
      this.client
        .GenerateImage(request)

        // data
        .on('data', async (e: ImageGenerationResponse) => {
          const res = e.toObject()
          console.log(res.currentSignpost)
          if (res.previewImage?.byteLength && previewHandler) {
            previewHandler(Uint8Array.from(res.previewImage!), res.currentSignpost!)
          }
          if (res.generatedImages?.length) {
            resolve(e.generatedImages.map((im) => Uint8Array.from(im)))
          }
        })

        // status
        .on('status', (e: ImageGenerationRequest) => console.log('status', e))

        // error
        .on('error', (e: ImageGenerationResponse) => {
          console.error('error', e)
          reject(e)
        })

        // metadata
        .on('metadata', (e: ImageGenerationResponse) => console.log('metadata', e))

        // close
        .on('close', (e: ImageGenerationRequest) => console.log('close', e))

        // end
        .on('end', (e: ImageGenerationRequest) => console.log('end', e))
    })
  }
}
