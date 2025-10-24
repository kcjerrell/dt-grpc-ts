import { ImageBuffer } from '../src/imageBuffer'

const image = await ImageBuffer.fromFile('examples_img2img_output2.png')
await image.toFile('temp.png')
