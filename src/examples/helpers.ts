import { join } from 'path'
import { ImageBuffer } from '../imageBuffer'

export async function saveResult(result: Uint8Array<ArrayBufferLike>[], name: string) {
  return await Promise.all(
    result.map(async (result, i) => {
      const image = await ImageBuffer.fromDTTensor(result)
      await image.toFile(`${name}-${i}.png`)
      console.log('Finished image:', join(process.cwd(), `${name}-${i}.png`))
      return image
    })
  )
}
