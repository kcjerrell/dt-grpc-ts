import { ControlInputType, ControlMode, ImageBuffer, buildRequest, DTService } from '..'

export async function inpaintWithMaskExample() {
  const dtc = new DTService('localhost:7859')

  const model = 'sd_v1.5_f16.ckpt'

  const request = buildRequest(
    {
      model,
      steps: 20,
      width: 512,
      height: 512,
    },
    'beautiful, lush, green forest',
    'boring, blurry, watermark'
  )

  const [image] = await dtc.generateImage(request)

  await image.toFile('examples_inpaint_output1.png')

  // masks one side of the image
  const mask = getMask(image.width, image.height)
  await mask.toFile('examples_inpaint_mask.png')

  const request2 = buildRequest(
    {
      model,
      steps: 20,
      width: 512,
      height: 512,
      maskBlur: 5,
      strength: 1,
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
          inputOverride: ControlInputType.Unspecified,
          downSamplingRate: 1,
        },
      ],
    },
    'raging forest fire',
    'boring, blurry, watermark'
  )
    .addImage(image)
    .addMask(mask)

  const [image2] = await dtc.generateImage(request2)

  image2.toFile('examples_inpaint_output2.png')
}

function getMask(width: number, height: number) {
  const image = new ImageBuffer(width, height, 3)

  for (let y = 0; y < height; y++) {
    for (let x = Math.floor(width / 2); x < width; x++) {
      image.setPixel(x, y, [255, 255, 255])
    }
  }

  return image
}

if (require.main === module) {
  inpaintWithMaskExample().then(() => process.exit(0))
}
