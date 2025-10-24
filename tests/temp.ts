import fse, { readFileSync, readJsonSync } from 'fs-extra'
import { decompress } from '../src/fpzip/decompress'
import { DTService } from '../src/dtService'
import { FileExistenceResponse } from '../src/generated'

test2()
  .then(() => process.exit())
  .catch(console.error)

async function test2() {
  const lorasJson = readJsonSync(
    '/Users/kcjer/Projects/ComfyUI-DrawThings-gRPC/web/models/loras_sha256.json'
  )
  const loras = Object.keys(lorasJson)
  const dtc = new DTService('localhost:7859')
  
  const res = (await dtc.filesExist(loras, [])) as FileExistenceResponse
  
  const serverFiles = loras.filter((_, i) => res.existences[i])
  console.log(serverFiles)
}

async function test() {
  const filePath = '/Users/kcjer/Desktop/dt-proj-img.bin'
  const file = await fse.readFile(filePath)

  const dec = await decompress(file)
  await fse.writeFile('/Users/kcjer/Desktop/dt-proj-img.png', dec)
}
