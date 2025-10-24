import * as fse from 'fs-extra'
import { convertResponseImage, ImageBuffer } from '../src'

test().then(() => console.log('done'))

async function test() {
  const file = await fse.readFile(
    '/Users/kcjer/Library/Application Support/com.kcjer.dtm/tensor_history_282038959'
  )

  const result = await convertResponseImage(file)
  const image = new ImageBuffer(result)
  await image.toFile(
    '/Users/kcjer/Library/Application Support/com.kcjer.dtm/tensor_history_282038959.png'
  )
}
