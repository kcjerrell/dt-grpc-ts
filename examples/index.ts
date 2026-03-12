import fse from "fs-extra"
import { spawnSync } from 'child_process'
import { join } from 'path'

const script = process.argv[2]
const args = process.argv.slice(3)

if (!script) {
    console.log('Usage: npm run example <script> [args]')
    process.exit(1)
}

const scriptPath = join("examples", `${script}.ts`)
if (!fse.existsSync(scriptPath)) {
    console.log(`Script ${scriptPath} not found`)
    process.exit(1)
}

const result = spawnSync('tsx', [scriptPath, ...args], { stdio: 'inherit' })
process.exit(result.status || 0)