import { join } from 'path'
import { getClient, ImageBuffer } from '..'
import { buildRequest } from '../imageRequestBuilder'

export async function txt2imgExample() {
  const client = getClient('localhost:7859')

  // any missing values in the config will be replaced with defaults
  const request = await buildRequest(
    {
      model: 'sd_v1.5_f16.ckpt',
      steps: 20,
      width: 512,
      height: 512,
    },
    'beautiful sunset',
    'boring, blurry, watermark'
  ).build()

  const result = await client.generateImage(request, (signpost) => {
    if (signpost.sampling?.step) console.log('Sampling step: ', signpost.sampling.step)
  })

  const image = ImageBuffer.fromDTTensor(result[0]).sharp()
  await image.toFile('examples_txt2img_output.png')
  console.log('Finished image:', join(process.cwd(), 'examples_txt2img_output.png'))
}

if (require.main === module) {
  txt2imgExample().then(() => process.exit(0))
}
