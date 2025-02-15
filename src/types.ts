import { ControlT } from './generated/data/control'
import { SamplerType } from './generated/data/sampler-type'
import { SeedMode } from './generated/data/seed-mode'

export interface Config {
  width?: number
  height?: number
  id?: bigint
  startWidth?: number
  startHeight?: number
  seed?: number
  steps?: number
  guidanceScale?: number
  strength?: number
  model?: string
  sampler?: SamplerType
  batchCount?: number
  batchSize?: number
  hiresFix?: boolean
  hiresFixStartWidth?: number
  hiresFixStartHeight?: number
  hiresFixStrength?: number
  upscaler?: string
  imageGuidanceScale?: number
  seedMode?: SeedMode
  clipSkip?: number
  controls?: ControlT[]
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

type LoraConfig =
  | {
      file: string
      weight: number
    }
  | [string, number?]
  | string
