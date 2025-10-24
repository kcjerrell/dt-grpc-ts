import { join } from 'path'
import { buildRequest, ControlMode, DTService, ImageBuffer } from '..'

async function depthExample() {
  const dtc = new DTService('localhost:7859')

  const config = {
    model: 'sd_v1.5_f16.ckpt',
    steps: 20,
    width: 512,
    height: 512,
    controls: [
      {
        file: 'controlnet_depth_1.x_v1.1_f16.ckpt',
        weight: 1,
        guidanceStart: 0,
        guidanceEnd: 1,
        noPrompt: false,
        globalAveragePooling: false,
        downSamplingRate: 1,
        controlMode: ControlMode.Control,
        targetBlocks: [],
        inputOverride: 0,
      },
    ],
  }

  const request = buildRequest(config, 'spring, lush trees, blue skies')
    // use addHint to add control images to the request
    .addHint('depth', await ImageBuffer.fromFile(join(__dirname, 'depth.png')), 1)

  const [image1] = await dtc.generateImage(request)
  await image1.toFile('example_depth_output1.png')

  const request2 = buildRequest(config, 'winter, snow covered trees, gray stormy sky')
    // use addHint to add control images to the request
    .addHint('depth', await ImageBuffer.fromFile(join(__dirname, 'depth.png')), 1)

  const [image2] = await dtc.generateImage(request2)
  await image2.toFile('example_depth_output2..png')
}

if (require.main === module) {
  depthExample().then(() => process.exit(0))
}
