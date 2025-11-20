import { Hints } from './types';
import { sha256 } from './util';

/**
 * Creates a builder for constructing hint objects used in ControlNet.
 *
 * @returns An object with methods to add hint images and build the final hint structure.
 */
export function buildHints() {
  const items = [] as {
    hintType: HintType;
    image: Uint8Array;
    weight: number;
  }[];

  return {
    /**
     * Adds a hint image.
     *
     * @param hintType - The type of hint.
     * @param image - The image data as a Uint8Array.
     * @param weight - The weight of the hint.
     */
    addHintImage(hintType: HintType, image: Uint8Array, weight: number) {
      items.push({ hintType, image, weight });
      return this as ReturnType<typeof buildHints>
    },
    /**
     * Builds the hints object for the request.
     *
     * @returns A `Hints` object.
     */
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
    /**
     * Builds hints and separates the image contents for transmission.
     *
     * @returns An object containing the `hints` structure and a flat array of `contents` (images).
     */
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
