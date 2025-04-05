import { BinaryLike, createHash } from 'crypto'

export function sha256(buffer: BinaryLike) {
  const hash = createHash('sha256')
  hash.update(buffer)
  return Uint8Array.from(hash.digest())
}
