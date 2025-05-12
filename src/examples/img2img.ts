import { getClient, buildRequest } from '..'
import { saveResult } from './helpers'

export async function img2imgExample() {
  const client = getClient('localhost:7859')

  const request = await buildRequest(
    {
      model: 'sd_v1.5_f16.ckpt',
      steps: 20,
      width: 512,
      height: 512,
    },
    'adorable big brown dog',
    'boring, blurry, watermark'
  ).build()

  const result = await client.generateImage(request)

  const image = await saveResult(result, 'examples_img2img_output1')

  const request2 = await buildRequest(
    {
      model: 'sd_v1.5_f16.ckpt',
      steps: 20,
      width: 512,
      height: 512,
      strength: 0.6,
    },
    'bear',
    'boring, blurry, watermark'
  )
    .addImage(image[0])
    .build()

  const result2 = await client.generateImage(request2)

  await saveResult(result2, 'examples_img2img_output2')
}

if (require.main === module) {
  img2imgExample().then(() => process.exit(0))
}
