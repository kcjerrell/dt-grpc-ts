import { join } from 'path'
import { ControlMode } from '..'
import { getClient } from '../clientHelpers'
import { ImageBuffer } from '../imageBuffer'
import { buildRequest } from '../imageRequestBuilder'

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
    'spring'
  )
    .addHint('depth', await ImageBuffer.fromFile(join(__dirname, 'depth.png')), 1)
    .build()

  const result = await client.generateImage(request, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image = ImageBuffer.fromDTTensor(result[0])
  await image.toFile('example_depth_output1.png')
  console.log('Finished image:', join(process.cwd(), 'example_depth_output1.png'))

  // reusing the original request, just changing the prompt
  // should probably be safe
  request.prompt = 'winter'

  const result2 = await client.generateImage(request, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image2 = ImageBuffer.fromDTTensor(result2[0])
  await image2.toFile('example_depth_output2.png')
  console.log('Finished image:', join(process.cwd(), 'example_depth_output2.png'))
}

if (require.main === module) {
  depthExample().then(() => process.exit(0))
}
