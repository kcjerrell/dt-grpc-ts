import type * as SharpModule from 'sharp'

try {
  import('sharp').then(mod => {
    sharp = mod as Sharp
  })
} catch (e) {
  console.warn(e)
}

type Sharp = typeof SharpModule
export let sharp: Sharp