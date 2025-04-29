import { Builder, ByteBuffer } from 'flatbuffers'
import {
  GenerationConfiguration,
  GenerationConfigurationT,
} from './generated/data/generation-configuration'
import { LoRAT } from './generated/data/lo-ra'
import { SamplerType } from './generated/data/sampler-type'
import { Config, ControlConfig, LoraConfig } from './types'
import { ControlT } from './generated/data/control'
import { ControlMode } from './generated/data/control-mode'
import { ControlInputType } from './generated/data/control-input-type'

// default configuration from DT app
// some properties renamed
const drawThingsDefault = {
  preserveOriginalAfterInpaint: true,
  batchCount: 1,
  seed: -1,
  batchSize: 1,
  shift: 1,
  model: 'sd_v1.5_f16.ckpt',
  height: 512,
  tiledDiffusion: false,
  diffusionTileHeight: 1024,
  diffusionTileWidth: 1024,
  diffusionTileOverlap: 128,
  sampler: SamplerType.DPMPP2MKarras,
  hiresFix: false,
  strength: 1,
  steps: 20,
  tiledDecoding: false,
  decodingTileHeight: 640,
  decodingTileWidth: 640,
  decodingTileOverlap: 128,
  loras: [],
  width: 512,
  guidanceScale: 4.5,
  maskBlur: 1.5,
  seedMode: 2,
  sharpness: 0,
  clipSkip: 1,
  controls: [],
  maskBlurOutset: 0,
  negativeOriginalImageHeight: 512,
  negativeOriginalImageWidth: 512,
  originalImageHeight: 512,
  originalImageWidth: 512,
  refinerStart: 0.85,
  targetImageHeight: 512,
  targetImageWidth: 512,
} as Config

export function buildConfig(config: Config = {}) {
  const c: Config = { ...drawThingsDefault, ...config }

  const width = (c.width || c.startWidth)!
  const height = (c.height || c.startHeight)!

  const genConfig = new GenerationConfigurationT(
    BigInt(c.id ?? 0), // id
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
    getControlsTs(c.controls), // controls
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

const loraDefault: Omit<LoraConfig, 'file'> = {
  weight: 0.8,
}

function getLoraTs(loras?: LoraConfig[]) {
  if (!loras || loras.length === 0) {
    return [] as LoRAT[]
  }
  const loraTs = [] as LoRAT[]

  for (const loraInput of loras) {
    const lora = { ...loraDefault, ...loraInput }

    if (!lora.file) continue
    loraTs.push(new LoRAT(lora.file, lora.weight))
  }

  return loraTs
}

const controlDefault: Omit<ControlConfig, 'file'> = {
  globalAveragePooling: false,
  weight: 1,
  noPrompt: false,
  guidanceStart: 0,
  guidanceEnd: 1,
  targetBlocks: [],
  controlMode: ControlMode.Balanced,
  inputOverride: ControlInputType.Inpaint,
  downSamplingRate: 1,
}

function getControlsTs(controls?: ControlConfig[]) {
  if (!controls || controls.length === 0) {
    return [] as ControlT[]
  }
  const controlTs = [] as ControlT[]

  for (const controlInput of controls) {
    const control = { ...controlDefault, ...controlInput }

    if (!control.file) continue
    controlTs.push(
      new ControlT(
        control.file,
        control.weight,
        control.guidanceStart,
        control.guidanceEnd,
        control.noPrompt,
        control.globalAveragePooling,
        control.downSamplingRate,
        control.controlMode,
        control.targetBlocks,
        control.inputOverride
      )
    )
  }

  return controlTs
}

export function getBaseConfig() {
  const config = { ...buildConfig(), ...drawThingsDefault }

  config.id = parseInt(config.id.toString())

  return config as Config
}
