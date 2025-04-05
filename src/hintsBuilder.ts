import { Hints } from './types';
import { sha256 } from './util';

export function buildHints() {
  const items = [] as {
    hintType: HintType;
    image: Uint8Array;
    weight: number;
  }[];

  return {
    addHintImage(hintType: HintType, image: Uint8Array, weight: number) {
      items.push({ hintType, image, weight });
      return this as ReturnType<typeof buildHints>
    },
    buildHintsObject() {
      const types = [...new Set(items.map(item => item.hintType))];
      const hints = types.map(hintType => {
        const typeItems = items.filter(item => item.hintType === hintType);
        return {
          hintType,
          tensors: typeItems.map(item => ({
            tensor: item.image,
            weight: item.weight,
          })),
        };
      });

      return hints as Hints;
    },
    buildsHintsWithContents() {
      const types = [...new Set(items.map(item => item.hintType))];
      const contents = [] as Uint8Array[];
      const hints = types.map(hintType => {
        const typeItems = items.filter(item => item.hintType === hintType);
        return {
          hintType,
          tensors: typeItems.map(item => {
            contents.push(item.image);
            return { tensor: sha256(item.image), weight: item.weight };
          }),
        };
      });

      return { hints, contents };
    },
  };
}

export type HintType =
  | 'custom'
  | 'depth'
  | 'canny'
  | 'scribble'
  | 'pose'
  | 'normalbae'
  | 'color'
  | 'lineart'
  | 'softedge'
  | 'seg'
  | 'inpaint'
  | 'ip2p'
  | 'shuffle'
  | 'mlsd'
  | 'tile'
  | 'blur'
  | 'lowquality'
  | 'gray';

export const hintTypes = {
  custom: 'custom',
  depth: 'depth',
  canny: 'canny',
  scribble: 'scribble',
  pose: 'pose',
  normalbae: 'normalbae',
  color: 'color',
  lineart: 'lineart',
  softedge: 'softedge',
  seg: 'seg',
  inpaint: 'inpaint',
  ip2p: 'ip2p',
  shuffle: 'shuffle',
  mlsd: 'mlsd',
  tile: 'tile',
  blur: 'blur',
  lowquality: 'lowquality',
  gray: 'gray',
};
