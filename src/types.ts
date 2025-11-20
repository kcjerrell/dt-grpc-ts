import { ControlInputType } from './generated/data/control-input-type'
import { ControlMode } from './generated/data/control-mode'
import { SamplerType } from './generated/data/sampler-type'
import { SeedMode } from './generated/data/seed-mode'

import { LoRAMode } from './generated/data/lo-ramode'

/**
 * Configuration options for image generation.
 * Many of these correspond directly to settings in the Draw Things app.
 */
export interface Config {
  /** Width of the generated image. */
  width?: number
  /** Height of the generated image. */
  height?: number
  /** Unique identifier for the request. */
  id?: number
  /** Initial width for upscaling or high-res fix. */
  startWidth?: number
  /** Initial height for upscaling or high-res fix. */
  startHeight?: number
  /** Random seed for generation. */
  seed?: number
  /** Number of inference steps. */
  steps?: number
  /** Guidance scale (CFG scale). */
  guidanceScale?: number
  /** Denoising strength for img2img or high-res fix. */
  strength?: number
  /** Model filename or name. */
  model?: string
  /** Sampler to use. */
  sampler?: SamplerType | string | number
  /** Number of batches to generate. */
  batchCount?: number
  /** Number of images per batch. */
  batchSize?: number
  /** Enable High-Res Fix. */
  hiresFix?: boolean
  /** Width to start High-Res Fix from. */
  hiresFixStartWidth?: number
  /** Height to start High-Res Fix from. */
  hiresFixStartHeight?: number
  /** Denoising strength for High-Res Fix. */
  hiresFixStrength?: number
  /** Upscaler model name. */
  upscaler?: string
  /** Image guidance scale. */
  imageGuidanceScale?: number
  /** Seed mode (e.g., legacy, torch). */
  seedMode?: SeedMode | string | number
  /** Clip skip layer. */
  clipSkip?: number
  /** ControlNet configurations. */
  controls?: ControlConfig[]
  /** LoRA configurations. */
  loras?: LoraConfig[]
  /** Blur radius for mask. */
  maskBlur?: number
  /** Face restoration model name. */
  faceRestoration?: string
  /** CLIP weight. */
  clipWeight?: number
  /** Use negative prompt for image prior. */
  negativePromptForImagePrior?: boolean
  /** Steps for image prior. */
  imagePriorSteps?: number
  /** Refiner model name. */
  refinerModel?: string
  /** Original image height (for SDXL). */
  originalImageHeight?: number
  /** Original image width (for SDXL). */
  originalImageWidth?: number
  /** Crop top coordinate (for SDXL). */
  cropTop?: number
  /** Crop left coordinate (for SDXL). */
  cropLeft?: number
  /** Target image height (for SDXL). */
  targetImageHeight?: number
  /** Target image width (for SDXL). */
  targetImageWidth?: number
  /** Aesthetic score (for SDXL). */
  aestheticScore?: number
  /** Negative aesthetic score (for SDXL). */
  negativeAestheticScore?: number
  /** Zero out negative prompt. */
  zeroNegativePrompt?: boolean
  /** Step to start refiner. */
  refinerStart?: number
  /** Negative original image height (for SDXL). */
  negativeOriginalImageHeight?: number
  /** Negative original image width (for SDXL). */
  negativeOriginalImageWidth?: number
  /** Name of the configuration. */
  name?: string
  /** FPS ID (for video/animation). */
  fpsId?: number
  /** Motion bucket ID (for video/animation). */
  motionBucketId?: number
  /** Condition augmentation. */
  condAug?: number
  /** Start frame CFG. */
  startFrameCfg?: number
  /** Number of frames. */
  numFrames?: number
  /** Mask blur outset. */
  maskBlurOutset?: number
  /** Sharpness. */
  sharpness?: number
  /** Shift value. */
  shift?: number
  /** Stage 2 steps. */
  stage2Steps?: number
  /** Stage 2 CFG. */
  stage2Cfg?: number
  /** Stage 2 shift. */
  stage2Shift?: number
  /** Enable tiled decoding. */
  tiledDecoding?: boolean
  /** Tiled decoding tile width. */
  decodingTileWidth?: number
  /** Tiled decoding tile height. */
  decodingTileHeight?: number
  /** Tiled decoding tile overlap. */
  decodingTileOverlap?: number
  /** Stochastic sampling gamma. */
  stochasticSamplingGamma?: number
  /** Preserve original image content after inpainting. */
  preserveOriginalAfterInpaint?: boolean
  /** Enable tiled diffusion. */
  tiledDiffusion?: boolean
  /** Tiled diffusion tile width. */
  diffusionTileWidth?: number
  /** Tiled diffusion tile height. */
  diffusionTileHeight?: number
  /** Tiled diffusion tile overlap. */
  diffusionTileOverlap?: number
  /** Upscaler scale factor. */
  upscalerScaleFactor?: number
  /** Use T5 text encoder. */
  t5TextEncoder?: boolean
  /** Separate CLIP L. */
  separateClipL?: boolean
  /** CLIP L text. */
  clipLText?: string
  /** Separate OpenCLIP G. */
  separateOpenClipG?: boolean
  /** OpenCLIP G text. */
  openClipGText?: string
  /** Speed up with guidance embedding. */
  speedUpWithGuidanceEmbed?: boolean
  /** Guidance embedding value. */
  guidanceEmbed?: number
  /** Resolution dependent shift. */
  resolutionDependentShift?: boolean
  /** Enable TeaCache. */
  teaCache?: boolean
  /** TeaCache end step. */
  teaCacheEnd?: number
  /** TeaCache max skip steps. */
  teaCacheMaxSkipSteps?: number
  /** TeaCache start step. */
  teaCacheStart?: number
  /** TeaCache threshold. */
  teaCacheThreshold?: number
  /** CFG zero init steps. */
  cfgZeroInitSteps?: number
  /** CFG zero star. */
  cfgZeroStar?: boolean
  /** Separate T5. */
  separateT5?: boolean
  /** T5 text. */
  t5Text?: string
  /** Enable causal inference. */
  causalInferenceEnabled?: boolean
  /** Causal inference value. */
  causalInference?: number
  /** Causal inference padding. */
  causalInferencePad?: number
}

export type LoraConfig = {
  file: string
  weight: number
  mode?: LoRAMode
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