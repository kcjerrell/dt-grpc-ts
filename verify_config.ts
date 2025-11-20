import { buildConfig, buildConfigBuffer, unpackConfig, getBaseConfig } from './src/config'
import { Config } from './src/types'

async function verify() {
  console.log('Verifying Config Fixes...')

  const testConfig: Config = {
    teaCache: true,
    resolutionDependentShift: false,
    causalInferenceEnabled: true,
    causalInference: 5,
    causalInferencePad: 2,
    separateT5: true,
    t5Text: "some text"
  }

  console.log('Test Config:', JSON.stringify(testConfig, null, 2))

  // 1. Test buildConfig
  const configT = buildConfig(testConfig)
  
  if (configT.teaCache !== true) throw new Error('teaCache mismatch in ConfigT')
  if (configT.resolutionDependentShift !== false) throw new Error('resolutionDependentShift mismatch in ConfigT')
  if (configT.causalInferenceEnabled !== true) throw new Error('causalInferenceEnabled mismatch in ConfigT')
  if (configT.causalInference !== 5) throw new Error('causalInference mismatch in ConfigT')
  if (configT.causalInferencePad !== 2) throw new Error('causalInferencePad mismatch in ConfigT')
  if (configT.separateT5 !== true) throw new Error('separateT5 mismatch in ConfigT')
  if (configT.t5Text !== "some text") throw new Error('t5Text mismatch in ConfigT')

  console.log('buildConfig verification passed.')

  // 2. Test Roundtrip (Buffer)
  const buffer = buildConfigBuffer(configT)
  const unpacked = unpackConfig(buffer)

  if (unpacked.teaCache !== true) throw new Error('teaCache mismatch in unpacked')
  if (unpacked.resolutionDependentShift !== false) throw new Error('resolutionDependentShift mismatch in unpacked')
  if (unpacked.causalInferenceEnabled !== true) throw new Error('causalInferenceEnabled mismatch in unpacked')
  if (unpacked.causalInference !== 5) throw new Error('causalInference mismatch in unpacked')
  if (unpacked.causalInferencePad !== 2) throw new Error('causalInferencePad mismatch in unpacked')
  if (unpacked.separateT5 !== true) throw new Error('separateT5 mismatch in unpacked')
  if (unpacked.t5Text !== "some text") throw new Error('t5Text mismatch in unpacked')

  console.log('Roundtrip verification passed.')
  
  // 3. Test Defaults
  const baseConfig = getBaseConfig()
  if (baseConfig.resolutionDependentShift !== true) throw new Error('Default resolutionDependentShift should be true')
  if (baseConfig.causalInferenceEnabled !== false) throw new Error('Default causalInferenceEnabled should be false')

  console.log('Defaults verification passed.')
  console.log('All verifications passed!')
}

verify().catch(e => {
  console.error('Verification Failed:', e)
  process.exit(1)
})
