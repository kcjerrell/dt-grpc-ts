import { getClient, buildRequest } from '..'
import { saveResult } from './helpers'

export async function txt2imgExample() {
  const client = getClient('localhost:7859')
  await client.waitForReady()

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

  const result = await client.generateImage(request)

  await saveResult(result, 'examples_txt2img_output')
}

if (require.main === module) {
  txt2imgExample().then(() => process.exit(0))
}
