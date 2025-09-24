import { ByteBuffer } from 'flatbuffers'
import fse from 'fs-extra'
import { GenerationConfiguration, ImageGenerationRequest } from '../src/generated/index'
import { ImageBuffer } from '../src/imageBuffer'
import { decodeOverride } from '../src/override'
import { convertResponseImage } from '../src'

const requestFile = '/Users/kcjer/Desktop/t/dtpose.dat'
const outFile = '/Users/kcjer/Desktop/t/dtpose-'

extract().then(() => console.log('done'))


async function extract() {
  const req = ImageGenerationRequest.deserialize(fse.readFileSync(requestFile)).toObject()

  const { image, mask, hints, contents, ...request } = req

  const bb = new ByteBuffer(request.configuration!)
  const config = GenerationConfiguration.getRootAsGenerationConfiguration(bb).unpack()
  delete config.id
  const saveConfig = { ...request, configuration: config, override: decodeOverride(request.override) }

  fse.writeFileSync(outFile + 'request.json', JSON.stringify(saveConfig, null, 2))

  let i = 0
  for (const item of contents) {
    fse.writeFileSync(outFile + `image_${i}.dat`, item)

    try {
      const image = convertResponseImage(item)
      await new ImageBuffer(image).toFile(outFile + `image_${i}.png`);
    } catch (e) {
      console.error("couldn't convert image");
    }

    i++
  }
}