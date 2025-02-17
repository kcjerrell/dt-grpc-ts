import { Builder, ByteBuffer } from 'flatbuffers'
import {
  GenerationConfiguration,
  GenerationConfigurationT,
} from './generated/data/generation-configuration'
import { LoRAT } from './generated/data/lo-ra'
import { SamplerType } from './generated/data/sampler-type'
import { Config } from './types'

// default configuration from DT app
// some properties renmed
const drawThingsDefault = {
  preserveOriginalAfterInpaint: true,
  batchCount: 1,
  seed: -1,
  batchSize: 1,
  shift: 1,
  model: 'sd_v1.5_f16.ckpt',
  height: 512,
  tiledDiffusion: false,
  diffusionTileHeight: 16,
  diffusionTileWidth: 16,
  diffusionTileOverlap: 2,
  sampler: SamplerType.DPMPP2MKarras,
  hiresFix: false,
  strength: 1,
  steps: 20,
  tiledDecoding: false,
  decodingTileHeight: 80,
  decodingTileWidth: 80,
  decodingTileOverlap: 2,
  loras: [],
  width: 512,
  guidanceScale: 4.5,
  maskBlur: 1.5,
  seedMode: 2,
  sharpness: 0,
  clipSkip: 1,
  controls: [],
  maskBlurOutset: 0,
  negativeOriginalImageHeight: 0,
  negativeOriginalImageWidth: 0,
  originalImageHeight: 0,
  originalImageWidth: 0,
  refinerStart: 0.85,
  targetImageHeight: 0,
  targetImageWidth: 0,
} as Config

export function buildConfig(config: Config) {
  const c: Config = { ...drawThingsDefault, ...config }

  const width = (c.width || c.startWidth)!
  const height = (c.height || c.startHeight)!

  const genConfig = new GenerationConfigurationT(
    c.id, // id
    width / 64, // width (divided by 64)
    height / 64, //height (divided by 64)
    c.seed && c.seed >= 0 ? c.seed : Math.floor(Math.random() * 4294967295), // seed,
    c.steps, // steps
    c.guidanceScale,
    c.strength, // strength
    c.model, // model
    c.sampler,
    c.batchCount, // batchCount
    c.batchSize, // batchSize
    c.hiresFix,
    (c.hiresFixStartWidth ?? 512) / 64,
    (c.hiresFixStartHeight ?? 512) / 64,
    c.hiresFixStrength,
    c.upscaler,
    c.imageGuidanceScale,
    c.seedMode, // seedMode
    c.clipSkip, // clipSkip
    c.controls, // controls
    getLoraTs(c.loras), // loras
    c.maskBlur, // maskBlur
    c.faceRestoration, // faceRestoration
    c.clipWeight, // clipWeight
    c.negativePromptForImagePrior, // negativePromptForImagePrior
    c.imagePriorSteps, // imagePriorSteps
    c.refinerModel, // refinerModel
    c.originalImageHeight || height, // originalImageHeight
    c.originalImageWidth || width, // originalImageWidth
    c.cropTop, // cropTop
    c.cropLeft, // cropLeft
    c.targetImageHeight || height, // targetImageHeight
    c.targetImageWidth || width, // targetImageWidth
    c.aestheticScore, // aestheticScore
    c.negativeAestheticScore, // negativeAestheticScore
    c.zeroNegativePrompt, // zeroNegativePrompt
    c.refinerStart, // refinerStart
    c.negativeOriginalImageHeight || height, // negativeOriginalImageHeight
    c.negativeOriginalImageWidth || width, // negativeOriginalImageWidth
    c.name, // name
    c.fpsId, // fpsId
    c.motionBucketId, // motionBucketId
    c.condAug, // condAug
    c.startFrameCfg, // startFrameCfg
    c.numFrames, // numFrames
    c.maskBlurOutset, // maskBlurOutset
    c.sharpness, // sharpness
    c.shift, // shift
    c.stage2Steps, // stage2Steps
    c.stage2Cfg, // stage2Cfg
    c.stage2Shift, // stage2 shift
    c.tiledDecoding, // tiledDecoding
    (c.decodingTileWidth ?? 512) / 64, // decodingTileWidth
    (c.decodingTileHeight ?? 512) / 64, // decodingTileHeight
    (c.decodingTileOverlap ?? 512) / 64, // decodingTileOverlap
    c.stochasticSamplingGamma, // stochasticSamplingGamma
    c.preserveOriginalAfterInpaint, // preserveOriginalAfterInpaint
    c.tiledDiffusion, // tiledDiffusion
    (c.diffusionTileWidth ?? 512) / 64, // diffusionTileWidth
    (c.diffusionTileHeight ?? 512) / 64, // diffusionTileHeight
    (c.diffusionTileOverlap ?? 512) / 64, // diffusionTileOverlap
    c.upscalerScaleFactor, // upscalerScaleFactor
    c.t5TextEncoder, // t5TextEncoder
    c.separateClipL, // separateClipL
    c.clipLText, // clipLText
    c.separateOpenClipG, // separateOpenClipG
    c.openClipGText, // openClipGText
    c.speedUpWithGuidanceEmbed, // speedUpWithGuidanceEmbed
    c.guidanceEmbed, // guidanceEmbed
    true
  )

  return genConfig
}

export function buildConfigBuffer(config: Config) {
  const configT = buildConfig(config)

  const builder = new Builder(1024)
  GenerationConfiguration.finishGenerationConfigurationBuffer(builder, configT.pack(builder))

  return builder.asUint8Array()
}

export function unpackConfig(configBuffer: Uint8Array) {
  const buf = new ByteBuffer(configBuffer)
  let conf = GenerationConfiguration.getRootAsGenerationConfiguration(buf)
  return conf.unpack()
}

function getLoraTs(loras: Config['loras']) {
  if (!loras || loras.length === 0) {
    return [] as LoRAT[]
  }
  const loraTs = []

  for (const lora of loras) {
    if (typeof lora === 'string') {
      loraTs.push(new LoRAT(lora, 0.8))
    } else if (Array.isArray(lora)) {
      loraTs.push(new LoRAT(lora[0], lora[1] ?? 0.8))
    } else if (typeof lora === 'object') {
      loraTs.push(new LoRAT(lora.file, lora.weight ?? 0.8))
    }
  }

  return loraTs
}
