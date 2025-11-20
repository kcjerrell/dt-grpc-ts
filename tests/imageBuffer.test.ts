import { describe, it, expect } from 'vitest'
import { ImageBuffer } from '../src/imageBuffer'
import sharp from 'sharp'

describe('ImageBuffer', () => {
  it('should create from dimensions', () => {
    const buf = new ImageBuffer(100, 100, 3)
    expect(buf.width).toBe(100)
    expect(buf.height).toBe(100)
    expect(buf.channels).toBe(3)
    expect(buf.data.length).toBe(100 * 100 * 3)
  })

  it('should create from dimensions with fill', () => {
    const buf = new ImageBuffer(10, 10, 3, [255, 0, 0])
    expect(buf.getPixel(0, 0)).toEqual(new Uint8Array([255, 0, 0]))
  })

  it('should set and get pixels', () => {
    const buf = new ImageBuffer(10, 10, 4)
    buf.setPixel(5, 5, [10, 20, 30, 255])
    const pixel = buf.getPixel(5, 5)
    expect(pixel).toEqual(new Uint8Array([10, 20, 30, 255]))
  })

  it('should convert to sharp and back', async () => {
    const buf = new ImageBuffer(100, 100, 3, [100, 150, 200])
    const s = buf.sharp()
    const buf2 = await ImageBuffer.fromPipeline(s)
    
    expect(buf2.width).toBe(100)
    expect(buf2.height).toBe(100)
    expect(buf2.channels).toBe(3)
    // Sharp might slightly alter values due to compression/decompression if formats were involved, 
    // but raw pipeline should be exact.
    // Sharp returns a Buffer, which is a Uint8Array, but Vitest's deep equal might distinguish them
    expect(new Uint8Array(buf2.getPixel(0, 0))).toEqual(new Uint8Array([100, 150, 200]))
  })

  it('should resize', async () => {
    const buf = new ImageBuffer(100, 100, 3)
    const resized = await buf.sharp(s => s.resize(50, 50))
    expect(resized.width).toBe(50)
    expect(resized.height).toBe(50)
  })

  it('should convert to DTTensor', () => {
    const buf = new ImageBuffer(10, 10, 3)
    const tensor = buf.toDTTensor()
    expect(tensor).toBeInstanceOf(Uint8Array)
    // DTTensor format check would depend on implementation details of convertImageForRequest
  })
})
