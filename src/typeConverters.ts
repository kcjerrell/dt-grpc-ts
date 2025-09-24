import { SamplerType, SeedMode } from './generated'

export const SeedModeLabels = [
  'Legacy',
  'Torch Cpu Compatible',
  'Scale Alike',
  'Nvidia Gpu Compatible',
]

const seedModeValues = {
  Legacy: 0,
  TorchCpuCompatible: 1,
  'Torch Cpu Compatible': 1,
  ScaleAlike: 2,
  'Scale Alike': 2,
  NvidiaGpuCompatible: 3,
  'Nvidia Gpu Compatible': 3,
}

export function getSeedMode(seedMode?: string | number): SeedMode {
  if (typeof seedMode === 'string' && seedMode in seedModeValues) {
    return seedModeValues[seedMode as keyof typeof seedModeValues]
  }
  if (typeof seedMode === 'number' && seedMode >= 0 && seedMode <= 3) {
    return seedMode
  }

  return 0
}

export const SamplerLabels = [
  'DPM++ 2M Karras',
  'Euler A',
  'DDIM',
  'PLMS',
  'DPM++ SDE Karras',
  'UniPC',
  'LCM',
  'Euler A Substep',
  'DPM++ SDE Substep',
  'TCD',
  'DPM++ 2M Trailing',
  'Euler A Trailing',
  'DPM++ SDE Trailing',
  'DDIM Trailing',
  'UniPC Trailing',
  'DPM++ 2M AYS',
  'Euler A AYS',
  'DPM++ SDE AYS',
  'UniPC AYS',
]

export type SamplerTypes =
  | 'DPM++ 2M Karras'
  | 'Euler A'
  | 'DDIM'
  | 'PLMS'
  | 'DPM++ SDE Karras'
  | 'UniPC'
  | 'LCM'
  | 'Euler A Substep'
  | 'DPM++ SDE Substep'
  | 'TCD'
  | 'DPM++ 2M Trailing'
  | 'Euler A Trailing'
  | 'DPM++ SDE Trailing'
  | 'DDIM Trailing'
  | 'UniPC Trailing'
  | 'DPM++ 2M AYS'
  | 'Euler A AYS'
  | 'DPM++ SDE AYS'
  | 'UniPC AYS'

const samplerValues = {
  DPMPP2MKarras: 0,
  'DPM++ 2M Karras': 0,
  EulerA: 1,
  'Euler A': 1,
  DDIM: 2,
  PLMS: 3,
  DPMPPSDEKarras: 4,
  'DPM++ SDE Karras': 4,
  UniPC: 5,
  LCM: 6,
  EulerASubstep: 7,
  'Euler A Substep': 7,
  DPMPPSDESubstep: 8,
  'DPM++ SDE Substep': 8,
  TCD: 9,
  EulerATrailing: 10,
  'Euler A Trailing': 10,
  DPMPPSDETrailing: 11,
  'DPM++ SDE Trailing': 11,
  DPMPP2MAYS: 12,
  'DPM++ 2M AYS': 12,
  EulerAAYS: 13,
  'Euler A AYS': 13,
  DPMPPSDEAYS: 14,
  'DPM++ SDE AYS': 14,
  DPMPP2MTrailing: 15,
  'DPM++ 2M Trailing': 15,
  DDIMTrailing: 16,
  'DDIM Trailing': 16,
  UniPCTrailing: 17,
  'UniPC Trailing': 17,
  UniPCAYS: 18,
  'UniPC AYS': 18,
}

export function getSampler(sampler?: string | number): SamplerType {
  if (typeof sampler === 'string' && sampler in samplerValues) {
    return samplerValues[sampler as keyof typeof samplerValues]
  }
  if (typeof sampler === 'number' && sampler >= 0 && sampler <= 18) {
    return sampler
  }

  return 13
}
