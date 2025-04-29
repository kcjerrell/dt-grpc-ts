import { ImageBuffer } from '../imageBuffer'

export async function saveResult(result: Uint8Array<ArrayBufferLike>[], name: string) {
  await Promise.all(
    result.map(async (result, i) => {
      const image = ImageBuffer.fromDTTensor(result)
      await image.toFile(`${name}-${i}.png`)
    })
  )
}
