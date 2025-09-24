import { ControlInputType } from './generated/data/control-input-type'
import { ControlMode } from './generated/data/control-mode'
import { SamplerType } from './generated/data/sampler-type'
import { SeedMode } from './generated/data/seed-mode'

export interface Config {
  width?: number
  height?: number
  id?: number
  startWidth?: number
  startHeight?: number
  seed?: number
  steps?: number
  guidanceScale?: number
  strength?: number
  model?: string
  sampler?: SamplerType | string
  batchCount?: number
  batchSize?: number
  hiresFix?: boolean
  hiresFixStartWidth?: number
  hiresFixStartHeight?: number
  hiresFixStrength?: number
  upscaler?: string
  imageGuidanceScale?: number
  seedMode?: SeedMode | string
  clipSkip?: number
  controls?: ControlConfig[]
  loras?: LoraConfig[]
  maskBlur?: number
  faceRestoration?: string
  clipWeight?: number
  negativePromptForImagePrior?: boolean
  imagePriorSteps?: number
  refinerModel?: string
  originalImageHeight?: number
  originalImageWidth?: number
  cropTop?: number
  cropLeft?: number
  targetImageHeight?: number
  targetImageWidth?: number
  aestheticScore?: number
  negativeAestheticScore?: number
  zeroNegativePrompt?: boolean
  refinerStart?: number
  negativeOriginalImageHeight?: number
  negativeOriginalImageWidth?: number
  name?: string
  fpsId?: number
  motionBucketId?: number
  condAug?: number
  startFrameCfg?: number
  numFrames?: number
  maskBlurOutset?: number
  sharpness?: number
  shift?: number
  stage2Steps?: number
  stage2Cfg?: number
  stage2Shift?: number
  tiledDecoding?: boolean
  decodingTileWidth?: number
  decodingTileHeight?: number
  decodingTileOverlap?: number
  stochasticSamplingGamma?: number
  preserveOriginalAfterInpaint?: boolean
  tiledDiffusion?: boolean
  diffusionTileWidth?: number
  diffusionTileHeight?: number
  diffusionTileOverlap?: number
  upscalerScaleFactor?: number
  t5TextEncoder?: boolean
  separateClipL?: boolean
  clipLText?: string
  separateOpenClipG?: boolean
  openClipGText?: string
  speedUpWithGuidanceEmbed?: boolean
  guidanceEmbed?: number
  resolutionDependentShift?: boolean
}

export type LoraConfig = {
  file: string
  weight: number
}

export type ExtendedLoraConfig = LoraConfig | [string, number?] | string

export type ControlConfig = {
  file: string
  weight: number
  guidanceStart: number
  guidanceEnd: number
  noPrompt: boolean
  globalAveragePooling: boolean
  downSamplingRate: number
  controlMode: ControlMode
  targetBlocks: string[]
  inputOverride: ControlInputType
}

export type Hints = {
  hintType?: string
  tensors?: {
    tensor?: Uint8Array
    weight?: number
  }[]
}[]