import { getClient } from '..'

async function modelsExample() {
  const client = getClient('localhost:7859')

  const response = await client.echo()

  const { controlNets, loras, models, textualInversions, upscalers } = response.override
  const override = [controlNets, loras, models, textualInversions, upscalers].flat()

  const modelFiles = override.map(o => o.file).filter(Boolean)

  const imageEncoders = controlNets.map(c => c.image_encoder).filter(Boolean)
  const preProcessors = controlNets.map(c => c.preprocessor).filter(Boolean)

  const autoEncoders = models.map(m => m.autoencoder).filter(Boolean)
  const clipEncoders = models.map(m => m.clip_encoder).filter(Boolean)
  const textEncoder = models.map(m => m.text_encoder).filter(Boolean)

  const allTypes = [
    modelFiles,
    imageEncoders,
    preProcessors,
    autoEncoders,
    clipEncoders,
    textEncoder,
  ]

  const allFiles = allTypes.flat()

  const extra = response.files?.filter(
    f => !allFiles.includes(f) && (f.includes('x2') || f.includes('x4'))
  )
  // console.log(allTypes.map((t) => t.includes('realesrgan_x2plus_f16.ckpt')))
  // console.log(textEncoder.includes('realesrgan_x2plus_f16.ckpt'))
  console.log(extra)
  // console.log(models.slice(0, 5))
}

modelsExample().then(() => process.exit(0))
