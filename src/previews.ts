import { Float16Array } from '@petamoriken/float16';
import { convertResponseImage } from './imageHelpers';
import { BufferWithInfo } from './imageBuffer';

const decoders: {
  [version: string]: (
    v0: number,
    v1: number,
    v2: number,
    v3: number
  ) => [number, number, number];
} = {};

decoders['.v1'] = decoders['.v2'] = decoders['.svI2v'] = (v0, v1, v2, v3) => {
  const r = 49.521 * v0 + 29.0283 * v1 - 23.9673 * v2 - 39.4981 * v3 + 99.9368;
  const g = 41.1373 * v0 + 42.4951 * v1 + 24.7349 * v2 - 50.8279 * v3 + 99.8421;
  const b = 40.2919 * v0 + 18.9304 * v1 + 30.0236 * v2 - 81.9976 * v3 + 99.5384;

  return [r, g, b];
};

/**
 *  for decoding preview images. These should be in the format returned by the gRPC api
 *  width * height * 4 array of float16 values
 *  decodes the image into a width * height * 3 array of bytes (uint8)
 */
export function decodePreview(
  preview: Uint8Array,
  version?: string
): BufferWithInfo {
  const intBuffer = new Uint32Array(preview.buffer, 0, 17);
  const [height, width, channels] = intBuffer.slice(6, 9);

  if (!version || !(version in decoders) || channels !== 4)
    return convertResponseImage(preview);

  const offset = 68;

  const f16a = new Float16Array(preview.buffer, offset);
  const u8c = new Uint8ClampedArray((preview.length / 2 / 4) * 3);

  for (let i = 0; i < f16a.length / 4; i++) {
    [u8c[i * 3], u8c[i * 3 + 1], u8c[i * 3 + 2]] = decoders[version](
      f16a[i * 4],
      f16a[i * 4 + 1],
      f16a[i * 4 + 2],
      f16a[i * 4 + 3]
    );
  }

  return {
    data: u8c!,
    width,
    height,
    channels: 3,
  };
}
