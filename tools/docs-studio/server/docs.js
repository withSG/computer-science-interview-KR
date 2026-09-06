import fs from 'node:fs/promises'
import fss from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { REPO_ROOT, resolveInRepo, toRepoRel } from './config.js'
import { normalize, denormalize } from './eol.js'

/** 문서 트리에서 제외할 디렉터리 */
const SKIP_DIRS = new Set(['.git', 'node_modules', 'assets', 'tools', '.history'])

export function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

/** 섹션·문서 정렬: README.md 가 맨 위, 그다음 NN- 숫자 순, 나머지는 이름 순 */
function compareNames(a, b) {
  if (a === 'README.md') return -1
  if (b === 'README.md') return 1
  const na = /^(\d+)-/.exec(a)
  const nb = /^(\d+)-/.exec(b)
  if (na && nb) return Number(na[1]) - Number(nb[1]) || a.localeCompare(b)
  if (na) return -1
  if (nb) return 1
  return a.localeCompare(b, 'ko')
}

/** 저장소의 마크다운 트리를 만든다. */
export async function buildTree(dirAbs = REPO_ROOT) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true })
  const dirs = []
  const files = []

  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue
    if (e.isDirectory()) dirs.push(e.name)
    else if (e.isFile() && e.name.endsWith('.md')) files.push(e.name)
  }

  dirs.sort(compareNames)
  files.sort(compareNames)

  const children = []
  for (const name of files) {
    children.push({ type: 'doc', name, path: toRepoRel(path.join(dirAbs, name)) })
  }
  for (const name of dirs) {
    const sub = await buildTree(path.join(dirAbs, name))
    if (sub.children.length > 0) {
      children.push({ type: 'dir', name, path: toRepoRel(path.join(dirAbs, name)), children: sub.children })
    }
  }
  return { children }
}

/**
 * 파일 하나를 읽는다.
 * text 는 LF 로 정규화된 것 — 파싱·오프셋은 전부 이 위에서 한다.
 * hash 는 디스크 바이트 그대로의 지문 — 외부 변경 감지용이다.
 */
export async function readFileNormalized(repoPath) {
  const abs = resolveInRepo(repoPath)
  const [buf, st] = await Promise.all([fs.readFile(abs), fs.stat(abs)])
  const { text, eol, bom } = normalize(buf.toString('utf8'))
  return { path: repoPath, text, eol, bom, hash: sha256(buf), mtimeMs: st.mtimeMs, size: st.size }
}

export const readDoc = readFileNormalized

export function existsInRepo(repoPath) {
  try { return fss.existsSync(resolveInRepo(repoPath)) } catch { return false }
}

/**
 * 원자적 쓰기. 임시 파일에 쓰고 rename 하므로 중간에 죽어도 반쪽 파일이 안 남는다.
 * text 는 LF 기준. eol/bom 으로 원래 파일 형식을 되살린다.
 * expectHash 를 주면 그 사이 파일이 밖에서 바뀌었는지 먼저 확인한다.
 */
export async function writeFileNormalized(repoPath, text, { eol = '\r\n', bom = false, expectHash = null } = {}) {
  const abs = resolveInRepo(repoPath)
  let before = null
  try {
    before = await fs.readFile(abs)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  if (expectHash != null) {
    const actual = before ? sha256(before) : null
    if (actual !== expectHash) {
      const e = new Error('파일이 앱 밖에서 바뀌었다. 문서를 다시 불러온 뒤 시도할 것.')
      e.code = 'STALE'
      throw e
    }
  }

  const buf = Buffer.from(denormalize(text, { eol, bom }), 'utf8')
  const tmp = `${abs}.docs-studio-${process.pid}.tmp`
  await fs.mkdir(path.dirname(abs), { recursive: true })

  const fh = await fs.open(tmp, 'w')
  try {
    await fh.writeFile(buf)
    await fh.sync()
  } finally {
    await fh.close()
  }
  await fs.rename(tmp, abs)

  return { before, after: buf, hash: sha256(buf) }
}

/**
 * 줄 범위(0-based, 양끝 포함)를 교체한다.
 * 원문의 줄 구조를 그대로 두고 그 구간만 갈아끼우므로 문서 나머지는 절대 건드리지 않는다.
 */
export function spliceLines(text, startLine, endLine, replacement) {
  const lines = text.split('\n')
  if (!Number.isInteger(startLine) || !Number.isInteger(endLine)) {
    throw new Error('줄 번호는 정수여야 한다')
  }
  if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
    throw new Error(`줄 범위가 문서를 벗어난다: ${startLine}-${endLine} (전체 ${lines.length}줄)`)
  }
  const repl = replacement.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n')
  return [...lines.slice(0, startLine), ...repl, ...lines.slice(endLine + 1)].join('\n')
}

/** 전문 검색. 한국어라 단어 경계를 쓰면 안 된다 — 단순 부분문자열로 찾는다. */
export async function searchDocs(query, limit = 60) {
  if (!query || query.trim().length === 0) return []
  const needle = query.toLowerCase()
  const results = []

  async function walk(dirAbs) {
    const entries = await fs.readdir(dirAbs, { withFileTypes: true })
    for (const e of entries) {
      if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue
      const abs = path.join(dirAbs, e.name)
      if (e.isDirectory()) { await walk(abs); continue }
      if (!e.isFile() || !e.name.endsWith('.md')) continue

      const repoPath = toRepoRel(abs)
      const { text } = normalize((await fs.readFile(abs)).toString('utf8'))
      const hay = text.toLowerCase()
      const titleHit = repoPath.toLowerCase().includes(needle)

      const hits = []
      let from = 0
      while (hits.length < 3) {
        const at = hay.indexOf(needle, from)
        if (at === -1) break
        const lineNo = text.slice(0, at).split('\n').length - 1
        const lineStart = text.lastIndexOf('\n', at) + 1
        let lineEnd = text.indexOf('\n', at)
        if (lineEnd === -1) lineEnd = text.length
        hits.push({ line: lineNo, text: text.slice(lineStart, lineEnd).trim().slice(0, 200) })
        from = at + needle.length
      }
      if (hits.length > 0 || titleHit) {
        results.push({ path: repoPath, titleHit, hits })
      }
    }
  }

  await walk(REPO_ROOT)
  results.sort((a, b) => (b.titleHit ? 1 : 0) - (a.titleHit ? 1 : 0) || b.hits.length - a.hits.length)
  return results.slice(0, limit)
}
