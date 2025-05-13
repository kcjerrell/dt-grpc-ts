import cp from 'child_process'
import fse from 'fs-extra'

async function updateConfig() {
  const res = await fetch(
    'https://api.github.com/repos/drawthingsai/draw-things-community/contents/Libraries/DataModels/Sources/config.fbs'
  )
  const decoded = Buffer.from((await res.json()).content, 'base64').toString('utf-8')

  // remove user defined attributes (indexed) and (primary)
  const fbs = decoded.replace(/ \(indexed\)/g, '').replace(/ \(primary\)/g, '')

  await fse.ensureDir('fbs')
  await fse.writeFile('fbs/config.fbs', fbs)

  cp.execSync('flatc --ts --gen-object-api -o src/generated/data fbs/config.fbs')
}

async function updateClient() {
  const res = await fetch(
    'https://api.github.com/repos/drawthingsai/draw-things-community/contents/Libraries/GRPC/Models/Sources/imageService/imageService.proto'
  )
  const decoded = Buffer.from((await res.json()).content, 'base64').toString('utf-8')

  await fse.ensureDir('proto')
  await fse.writeFile('proto/imageService.proto', decoded)

  cp.execSync('protoc --ts_out=src/generated/grpc proto/imageService.proto')
}

if (import.meta === process.argv[1]) {
  updateConfig().then(() => process.exit(0)).catch(console.error)
  updateClient().then(() => process.exit(0)).catch(console.error) 
}
