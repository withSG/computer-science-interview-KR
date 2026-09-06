/**
 * 개발용 실행기 — API 서버와 Vite 를 함께 띄운다.
 * 한쪽이 죽으면 다른 쪽도 정리한다. 의존성을 늘리지 않으려고 직접 짰다.
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import fss from 'node:fs'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const envFile = path.join(appRoot, '.env')

const children = []

function run(label, cmd, args) {
  const child = spawn(cmd, args, { cwd: appRoot, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' })
  const tag = `[${label}]`
  child.stdout.on('data', (b) => process.stdout.write(prefix(tag, b)))
  child.stderr.on('data', (b) => process.stderr.write(prefix(tag, b)))
  child.on('exit', (code) => {
    console.log(`${tag} 종료 (code ${code})`)
    shutdown()
  })
  children.push(child)
  return child
}

function prefix(tag, buf) {
  return String(buf)
    .split('\n')
    .map((l) => (l.trim() === '' ? l : `${tag} ${l}`))
    .join('\n')
}

let stopping = false
function shutdown() {
  if (stopping) return
  stopping = true
  for (const c of children) {
    try {
      c.kill()
    } catch {}
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

if (!fss.existsSync(envFile)) {
  console.log('[dev] .env 가 없다. .env.example 을 복사해 키를 넣으면 AI 기능이 켜진다.')
}

const serverArgs = ['--watch', 'server/index.js']
if (fss.existsSync(envFile)) serverArgs.unshift(`--env-file=${envFile}`)

run('api', process.execPath, serverArgs)
run('web', npx, ['vite'])

console.log('\n  화면: http://localhost:5173\n')
