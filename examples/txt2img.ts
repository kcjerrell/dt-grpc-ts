import { buildRequest, DTService } from '../dist'

export async function txt2imgExample() {
  const dtc = new DTService('localhost:7859')

  // any missing values in the config will be replaced with defaults
  const request = buildRequest(
    {
      model: 'sd_v1.5_f16.ckpt',
      steps: 20,
      width: 512,
      height: 512,
    },
    'beautiful sunset',
    'boring, blurry, watermark'
  )

  const result = await dtc.generateImage(request)
  await result[0].toFile('examples_txt2img_output1.png')
}

if (require.main === module) {
  txt2imgExample().then(() => process.exit(0))
}
