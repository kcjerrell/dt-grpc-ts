import { join } from 'path'
import { buildRequest, Config, ControlMode, DTService, ImageBuffer } from '..'
import { ControlInputType } from '../generated/data/control-input-type'
import { credentials } from '@grpc/grpc-js'


async function depthExample() {
  const dtc = new DTService('localhost:7859' /*, {credentials: credentials.createInsecure()}*/)

  const config: Config = {
    model: 'sdmix2_f16.ckpt',
    steps: 20,
    width: 768,
    height: 768,
    hiresFix: true,
    hiresFixStartHeight: 512,
    hiresFixStartWidth: 512,
    controls: [
      {
        globalAveragePooling: false,
        weight: 1,
        file: 't2iadapter_openpose_1.x_f16.ckpt',
        guidanceStart: 0,
        noPrompt: false,
        guidanceEnd: 1,
        targetBlocks: [],
        controlMode: ControlMode.Balanced,
        downSamplingRate: 1,
        inputOverride: 0,
      },
    ],
  }

  const config2: Config = {
    loras: [],
    shift: 1,
    tiledDecoding: false,
    height: 768,
    tiledDiffusion: false,
    sharpness: 0,
    guidanceScale: 6,
    clipSkip: 2,
    sampler: 0,
    "controls": [
      {
        "weight": 1,
        "globalAveragePooling": false,
        inputOverride: ControlInputType.Unspecified,
        "file": "t2iadapter_sketch_1.x_f16.ckpt",
        "guidanceStart": 0,
        "noPrompt": false,
        "targetBlocks": [],
        "guidanceEnd": 0.5,
        controlMode: ControlMode.Balanced,
        "downSamplingRate": 1
      }
    ],
    seedMode: 2,
    maskBlur: 2.5,
    width: 768,
    strength: 1,
    preserveOriginalAfterInpaint: true,
    maskBlurOutset: 0,
    steps: 20,
    hiresFix: false,
    batchCount: 1,
    seed: 1846071305,
    model: 'sd_v1.5_f16.ckpt',
    batchSize: 1,
  }

  const config3: Config = {
    targetImageHeight: 1024,
    originalImageWidth: 1024,
    sharpness: 0,
    cfgZeroInitSteps: 0,
    steps: 8,
    maskBlurOutset: 0,
    height: 1024,
    negativeAestheticScore: 2.5,
    strength: 1,
    guidanceScale: 2,
    sampler: 10,
    preserveOriginalAfterInpaint: true,
    cropTop: 0,
    batchSize: 1,
    aestheticScore: 6,
    shift: 1,
    negativeOriginalImageHeight: 512,
    clipSkip: 2,
    model: 'foxmen_fast_f16.ckpt',
    controls: [
      {
        weight: 1,
        globalAveragePooling: false,
        inputOverride: ControlInputType.Scribble,
        file: 'controlnet_xinsir_union_promax_sdxl_1.0_f16.ckpt',
        guidanceStart: 0,
        noPrompt: false,
        guidanceEnd: 0.29999999999999999,
        targetBlocks: [],
        controlMode: ControlMode.Balanced,
        downSamplingRate: 1,
      },
    ],
    cropLeft: 0,
    seed: 84159164,
    originalImageHeight: 1024,
    tiledDecoding: false,
    zeroNegativePrompt: false,
    seedMode: 2,
    width: 1024,
    targetImageWidth: 1024,
    loras: [],
    negativeOriginalImageWidth: 512,
    tiledDiffusion: false,
    batchCount: 1,
    hiresFix: false,
    cfgZeroStar: true,
    maskBlur: 2.5,
    causalInferencePad: 0,
  }

  const request = buildRequest(config, 'a man')
    // use addHint to add control images to the request
    .addHint('pose', await ImageBuffer.fromFile('/Users/kcjer/Desktop/pose.png'), 1)
    // .addHint('pose', await ImageBuffer.fromFile(join('/Users/kcjer/Projects/dt-script/pose-a.png')), 1)
    // .addHint('pose', await ImageBuffer.fromFile(join('/Users/kcjer/Projects/dt-script/pose-b.png')), 1)

  const [image1] = await dtc.generateImage(request)
  await image1.toFile('example_pose_output1.png')
}

if (require.main === module) {
  depthExample().then(() => process.exit(0))
}
