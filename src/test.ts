import { SamplerType } from './generated/data/sampler-type'
import { getClient } from './clientHelpers'
import { saveResponseImage } from './imageHelpers'
import fs from 'fs'

const imgDir = ''

if (!imgDir) throw new Error('you must specify an output directory in the test script (like 6)')

console.log(
  "make sure DT's gRPC server is running and with port 7850, no TLS, and compression disabled"
)

// get a ClientHelper - which creates and connects the gRPC client
// and wraps the requests in an easier api
const client = await getClient('localhost:7859')

// make and print an echo request
const echo = await client.echo('hello')
console.log(echo)

// // generate an image (txt2img)
const images = await client.generateImage(
  {
    prompt: 'incredible rainbow mineral texture',
    negativePrompt: 'boring',
    // any missing values here will be filled in with defaults
    config: {
      width: 512,
      height: 512,
      steps: 20,
      model: 'sd_v1.5_f16.ckpt',
      // loras: [['lcm_sd_v1.5_lora_f16.ckpt', 1.0]],
      // sampler: SamplerType.LCM,
      strength: 1,
    },
  },
  // callback for preview images
  async (previewImage, signpost) => {
    console.log(signpost)
    await saveResponseImage(previewImage, `${imgDir}/preview.png`)
  }
)

// save the (first) generatedImage data as is
fs.writeFileSync(imgDir + '/response', images[0])

// convert and save the (first) generatedImage as a .png
await saveResponseImage(images[0], `${imgDir}/output.png`)

// generate another image (img2img)
const images2 = await client.generateImage(
  {
    // sending back the image from the first call as is
    image: Uint8Array.from(images[0]),
    prompt: 'slimy alien',
    negativePrompt: 'boring',
    config: {
      width: 512,
      height: 512,
      steps: 20,
      model: 'sd_v1.5_f16.ckpt',
      // loras: [['lcm_sd_v1.5_lora_f16.ckpt', 1.0]],
      // sampler: SamplerType.LCM,
      strength: 0.5,
    },
  },
  async (previewImage, signpost) => {
    console.log(signpost)
    await saveResponseImage(previewImage, `${imgDir}/preview2.png`)
  }
)

fs.writeFileSync(imgDir + '/response2', images[0])
await saveResponseImage(images[0], `${imgDir}/output2.png`)
