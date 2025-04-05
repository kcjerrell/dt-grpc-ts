import { ImageBuffer } from '../src/imageBuffer'
import { convertImageToMask } from '../src/imageHelpers'
import { describe, test, expect } from 'vitest'

describe('convertImageToMask', () => {
  test('converts 3 channel image to mask', () => {
    const maskImage = getGradientMask(8, 4, 3)
    const mask = convertImageToMask(maskImage)

    let text = mask.slice(68).join('')

    expect(text).toBe('02222221022222210222222102222221')
  })

  test('converts 4 chanel image to mask', () => {
    const maskImage = getGradientMask(8, 4, 4)
    const mask = convertImageToMask(maskImage)

    let text = mask.slice(68).join('')

    expect(text).toBe('02222221022222210222222102222221')
  })

  test('creates the correct header', () => {
    const maskImage = getGradientMask(8, 4, 3)
    const mask = convertImageToMask(maskImage)

    const header = new Uint32Array(mask.buffer, 0, 9)

    expect(Array.from(header)).toEqual([0, 1, 1, 4096, 0, maskImage.height, maskImage.width, 0, 0])

    const maskImage2 = getGradientMask(16, 8, 3)
    const mask2 = convertImageToMask(maskImage2)

    const header2 = new Uint32Array(mask2.buffer, 0, 9)

    expect(Array.from(header2)).toEqual([
      0,
      1,
      1,
      4096,
      0,
      maskImage2.height,
      maskImage2.width,
      0,
      0,
    ])

    const maskImage3 = getGradientMask(32, 16, 3)
    const mask3 = convertImageToMask(maskImage3)

    const header3 = new Uint32Array(mask3.buffer, 0, 9)

    expect(Array.from(header3)).toEqual([
      0,
      1,
      1,
      4096,
      0,
      maskImage3.height,
      maskImage3.width,
      0,
      0,
    ])
  })

  test('throws an error if image is null, undefined, or not the correct type', () => {
    expect(() => convertImageToMask(null)).toThrow(Error)
    expect(() => convertImageToMask(undefined)).toThrow(Error)
    expect(() => convertImageToMask({} as any)).toThrow(Error)
  })
})

/** generates an image buffer where x=0 is full black and x=width = full white */
function getGradientMask(width, height, channels) {
  const maskImage = new ImageBuffer(8, 4, 3)

  for (let y = 0; y < maskImage.height; y++) {
    for (let x = 0; x < maskImage.width; x++) {
      maskImage.setPixel(x, y, [Math.floor((x / (maskImage.width - 1)) * 255)], true)
    }
  }

  return maskImage
}
