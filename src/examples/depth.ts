import { join } from 'path'
import { buildRequest, ControlMode, getClient, ImageBuffer } from '..'
import { saveResult } from './helpers'

async function depthExample() {
  const client = getClient('localhost:7859')

  const request = await buildRequest(
    {
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
    },
    'spring, lush trees, blue skies'
  )
    .addHint('depth', await ImageBuffer.fromFile(join(__dirname, 'depth.png')), 1)
    .build()

  const result = await client.generateImage(request)

  await saveResult(result, 'example_depth_output1')

  // reusing the original request, just changing the prompt
  // should probably be safe
  request.prompt = 'winter, snow covered trees, gray stormy sky'

  const result2 = await client.generateImage(request)

  await saveResult(result2, 'example_depth_output2')
}

if (require.main === module) {
  depthExample().then(() => process.exit(0))
}
