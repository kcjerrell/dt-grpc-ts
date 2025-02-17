import { EchoReply } from './generated/grpc/imageService'

const emptyArray = Uint8Array.from(JSON.stringify([]))

export function getOverride() {
  return {
    models: Uint8Array.from(
      JSON.stringify([
        {
          default_scale: 8,
          file: 'sd_v1.5_f16.ckpt',
          name: 'Generic (Stable Diffusion v1.5)',
          prefix: '',
          upcast_attention: false,
          version: 'v1',
        },
      ])
    ),
    loras: emptyArray,
    upscalers: emptyArray,
    controlNets: emptyArray,
    textualInversions: emptyArray,
  }
}

export function decodeOverride(override?: ReturnType<EchoReply['toObject']>['override']) {
  const decode = (buffer?: Uint8Array) => {
    if (!buffer || buffer.length === 0) return '[]'
    const decoder = new TextDecoder('utf-8')
    return JSON.parse(decoder.decode(buffer))
  }

  const decoded = {
    controlNets: decode(override?.controlNets),
    loras: decode(override?.loras),
    models: decode(override?.models),
    textualInversions: decode(override?.textualInversions),
    upscalers: decode(override?.upscalers),
  }

  return decoded
}
