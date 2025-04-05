import { getClient, ImageBuffer } from '..'
import { buildRequest } from '../imageRequestBuilder'

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

  const result = await client.generateImage(request, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image = ImageBuffer.fromDTTensor(result[0])
  await image.toFile('examples_img2img_output1.png')

  const request2 = await buildRequest(
    {
      model: 'sd_v1.5_f16.ckpt',
      steps: 20,
      width: 512,
      height: 512,
      strength: 0.7,
    },
    'bear',
    'boring, blurry, watermark'
  )
    .addImage(image)
    .build()

  const result2 = await client.generateImage(request2, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image2 = ImageBuffer.fromDTTensor(result2[0])
  await image2.toFile('examples_img2img_output2.png')
}

if (require.main === module) {
  img2imgExample().then(() => process.exit(0))
}
