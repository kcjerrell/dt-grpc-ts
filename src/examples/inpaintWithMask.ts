import { join } from 'path'
import { ControlInputType, ControlMode, getClient, ImageBuffer } from '..'
import { buildRequest } from '../imageRequestBuilder'

export async function inpaintWithMaskExample() {
  const client = getClient('localhost:7859')

  const model = 'sd_v1.5_f16.ckpt'

  const request = await buildRequest(
    {
      model,
      steps: 20,
      width: 512,
      height: 512,
    },
    'beautiful, lush, green forest',
    'boring, blurry, watermark'
  ).build()

  const result = await client.generateImage(request, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image = ImageBuffer.fromDTTensor(result[0])
  await image.toFile('examples_inpaint_output1.png')
  console.log('Finished image 1:', join(process.cwd(), 'examples_inpaint_output1.png'))

  // masks one side of the image
  const mask = getMask(image.width, image.height)

  const request2 = await buildRequest(
    {
      model,
      steps: 20,
      width: 512,
      height: 512,
      maskBlur: 5,
      controls: [
        {
          globalAveragePooling: false,
          weight: 1,
          file: 'controlnet_inpaint_1.x_v1.1_f16.ckpt',
          noPrompt: false,
          guidanceStart: 0,
          guidanceEnd: 1,
          targetBlocks: [],
          controlMode: ControlMode.Balanced,
          inputOverride: ControlInputType.Inpaint,
          downSamplingRate: 1,
        },
      ],
    },
    'raging forest fire',
    'boring, blurry, watermark'
  )
    .addImage(image)
    .addMask(mask)
    .build()

  const result2 = await client.generateImage(request2, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image2 = ImageBuffer.fromDTTensor(result2[0])
  await image2.toFile('examples_inpaint_output2.png')
  console.log('Finished image 2:', join(process.cwd(), 'examples_inpaint_output2.png'))
}

function getMask(width: number, height: number) {
  const image = new ImageBuffer(width, height, 3)

  for (let y = 0; y < height; y++) {
    for (let x = Math.floor(width / 2); x < width; x++) {
      image.setPixel(x, y, [1, 1, 1])
    }
  }

  return image
}

if (require.main === module) {
  inpaintWithMaskExample().then(() => process.exit(0))
}
