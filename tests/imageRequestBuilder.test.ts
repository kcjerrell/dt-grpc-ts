import { describe, test, expect, it } from 'vitest'
import { DTService } from '../src/dtService'
import { buildRequest } from '../src/imageRequestBuilder'
import { ImageBuffer } from '../src'

const getEmptyImage = (width = 512, height = 512, channels = 3) =>
  new ImageBuffer(width, height, channels as 1 | 3 | 4)

describe('img2img', () => {
  const dtc = new DTService('localhost:7859')

  it('rounds sizes to nearest multiple of 64, minimum 64', async (ctx) => {
    const request = await buildRequest({
      width: 500,
      height: 520,
      hiresFixStartHeight: 360,
      hiresFixStartWidth: 390,
      decodingTileHeight: 760,
      decodingTileWidth: 790,
      decodingTileOverlap: 950,
      diffusionTileHeight: 970,
      diffusionTileWidth: 1000,
      diffusionTileOverlap: 2,
    }).build()

    expect(request.config.width).toBe(512)
    expect(request.config.height).toBe(512)
    expect(request.config.hiresFixStartHeight).toBe(384)
    expect(request.config.hiresFixStartWidth).toBe(384)
    expect(request.config.decodingTileHeight).toBe(768)
    expect(request.config.decodingTileWidth).toBe(768)
    expect(request.config.decodingTileOverlap).toBe(960)
    expect(request.config.diffusionTileHeight).toBe(960)
    expect(request.config.diffusionTileWidth).toBe(1024)
    expect(request.config.diffusionTileOverlap).toBe(64)
  })

  it('resizes input images to match config', async (ctx) => {
    const request = await buildRequest({
      width: 512,
      height: 768,
    })
      .addImage(getEmptyImage(200, 400, 3))

      // not testing mask here because it uses a different header
      // .addMask(getEmptyImage(20, 30, 2))

      .addHint('shuffle', getEmptyImage(399, 270, 3), 1)
      .addHint('depth', getEmptyImage(49, 290, 3), 1)
      .build()

    expect(request.config.width).toBe(512)
    expect(request.config.height).toBe(768)

    for (const image of request.contents!) {
      const buffer = new DataView(new Uint8Array(image).buffer)
      const width = buffer.getUint32(7 * 4, true)
      const height = buffer.getUint32(6 * 4, true)

      expect(width).toBe(512)
      expect(height).toBe(768)
    }
  })
})
