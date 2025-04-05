import { EchoReply } from './generated/grpc/imageService';

const emptyArray = encode([]);

export function getOverride() {
  return {
    models: encode([
      {
        default_scale: 8,
        file: 'sd_v1.5_f16.ckpt',
        name: 'Generic (Stable Diffusion v1.5)',
        prefix: '',
        upcast_attention: false,
        version: 'v1',
      },
    ]),
    loras: emptyArray,
    upscalers: emptyArray,
    controlNets: emptyArray,
    textualInversions: emptyArray,
  };
}

export function decodeOverride(
  override?: ReturnType<EchoReply['toObject']>['override']
) {
  const decode = (buffer?: Uint8Array) => {
    if (!buffer || buffer.length === 0) return [];
    const decoder = new TextDecoder('utf-8');
    const str = decoder.decode(buffer);
    return JSON.parse(str);
  };

  const decoded = {
    controlNets: decode(override?.controlNets) as ControlNet[],
    loras: decode(override?.loras) as Lora[],
    models: decode(override?.models) as Model[],
    textualInversions: decode(
      override?.textualInversions
    ) as TextualInversion[],
    upscalers: decode(override?.upscalers),
  };

  return decoded as Override;
}

export function encodeOverride(override: Partial<Override>) {
  const encoded = {
    controlNets: encode(override?.controlNets),
    loras: encode(override?.loras),
    models: encode(override?.models),
    textualInversions: encode(override?.textualInversions),
    upscalers: encode(override?.upscalers),
  }
  return encoded
}

function encode(obj: any) {
  const encoder = new TextEncoder()
  return encoder.encode(JSON.stringify(obj))
}

export type Model = {
  file: string
  version: string
  prefix: string
  default_scale: number
  name: string
  upcast_attention: boolean
  modifier: string
  text_encoder: string
  clip_encoder: string
  hires_fix_scale: number
  objective: {
    u: {
      condition_scale: number
    }
  }
  high_precision_autoencoder: boolean
  padded_text_encoding_length: number
  guidance_embed: boolean
  autoencoder: string
  noise_discretization: {
    rf: {
      _0: ObjectConstructor[]
    }
  }
  conditioning: string
}

export type TextualInversion = {
  length: number
  file: string
  keyword: string
  version: string
  name: string
  deprecated: boolean
}

export type Lora = {
  file: string
  version: string
  prefix: string
  is_consistency_model: boolean
  name: string
  modifier: string
  weight: {
    lower_bound: number
    upper_bound: number
    value: number
  }
  is_lo_ha: boolean
}

export type ControlNet = {
  name: string
  file: string
  version: string
  modifier: string
  type: string
  global_average_pooling: boolean
  transformer_blocks: any[]
  image_encoder: string
  preprocessor: string
  image_encoder_version: string
  ip_adapter_config: {
    output_dim: number
    query_dim: number
    input_dim: number
    grid: number
    head_dim: number
    num_heads: number
  }
}

export type Override = {
  models: Partial<Model>[]
  loras: Partial<Lora>[]
  upscalers: Partial<unknown>[]
  controlNets: Partial<ControlNet>[]
  textualInversions: Partial<TextualInversion>[]
}
