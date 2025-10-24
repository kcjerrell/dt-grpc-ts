import { DTService } from '../dist'

async function modelsExample() {
  const client = new DTService('localhost:7859')

  const response = await client.echo()

  const { controlNets, loras, models, textualInversions, upscalers } = response.override

  console.dir(response.override, { depth: null })
  console.log(`${models.length} models`)
  console.log(`${loras.length} loras`)
  console.log(`${controlNets.length} control nets`)
  console.log(`${textualInversions.length} textual inversions`)
  console.log(`${upscalers.length} upscalers`)
}

modelsExample().then(() => process.exit(0))
