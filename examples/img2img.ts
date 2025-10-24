import { buildRequest, DTService } from '../dist'

export async function img2imgExample() {
  const dtc = new DTService('localhost:7859')

  // create an image 
  const request = buildRequest(
    {
      model: 'sd_v1.5_f16.ckpt',
      steps: 20,
      width: 512,
      height: 512,
    },
    'adorable big brown dog',
    'boring, blurry, watermark'
  )
  const [image] = await dtc.generateImage(request)
  await image.toFile('examples_img2img_output1.png')

  // use that image for I2I
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
    .addImage(image)
    .build()

  const [image2] = await dtc.generateImage(request2)

  await image2.toFile('examples_img2img_output2.png')
}

if (require.main === module) {
  img2imgExample().then(() => process.exit(0))
}
