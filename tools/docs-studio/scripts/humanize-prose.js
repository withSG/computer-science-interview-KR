/**
 * 산문 재작성 파이프라인 — 뽑아서(extract), 고치고, 되꽂는다(apply).
 *
 * 문서 전체를 에이전트에게 주지 않는다. 산문 덩어리(문단·목록·펜스 속 한국어)만
 * "단위"로 뽑아 넘기고, 돌아온 글을 원래 자리에 되꽂는다. 헤딩·표·코드·다이어그램·
 * 체크리스트는 에이전트 눈에 고정 구조의 한 줄 요약으로만 보이므로 고칠 수가 없다.
 *
 * 에이전트는 저장소 파일을 직접 고치지 않는다. 스크래치 디렉터리에 사이드카 하나를
 * 쓰고, 이 스크립트가 유일한 쓰기 주체로서 검사 후 반영한다. 그래서 워크플로가
 * 중간에 죽어도 아직 되꽂지 않은 사이드카만 잃고, 동시 쓰기 경쟁이 없다.
 *
 * 사용법
 *   node scripts/humanize-prose.js plan    <접두어...> [--json]
 *       재작성이 아직 안 끝난 문서를 산문 분량으로 나눠 샤드(에이전트 1명 몫)로 묶는다.
 *   node scripts/humanize-prose.js extract --out <dir> <경로|접두어...>
 *       <dir>/<슬러그>.units.txt(에이전트가 읽는 것)와 .meta.json 을 만든다.
 *   node scripts/humanize-prose.js apply   --out <dir> [--dry-run] [<경로|접두어...>]
 *       <dir>/<슬러그>.rewrite.txt 를 검사해 통과한 단위만 되꽂는다. 실패한 단위는
 *       <슬러그>.repair.txt 로 사유와 함께 남긴다.
 *   node scripts/humanize-prose.js status  [<접두어...>]
 *
 * 사이드카(.rewrite.txt) 형식 — JSON 이 아니라 줄 구분이다. 백틱·따옴표가 가득한 한국어
 * 산문에서 이스케이프 하나가 틀리면 문서 하나를 통째로 잃기 때문이다.
 *     @@UNIT 0007
 *     <다시 쓴 글, 여러 줄 가능>
 *     @@END
 * 고치지 않은 단위는 쓰지 않는다. "변경 없음"은 정당한 결과다.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { APP_ROOT } from '../server/config.js'
import { buildTree, readFileNormalized, writeFileNormalized, sha256 } from '../server/docs.js'
import { segment, proseFenceIndexes, isFree, freeBlocks } from '../server/prose.js'
import { checkText } from '../server/rewrite-check.js'

const MANIFEST_PATH = path.join(APP_ROOT, '.humanize', 'manifest.json')

// 샤드 기준 — 산문 분량(공백 뺀 글자 수)
const TIER_H = 5000 // 이상: 문서 1편이 에이전트 1명
const TIER_M = 500 // 이상: 같은 폴더 3편
const M_GROUP = 3
const L_GROUP = 8 // 미만: 같은 챕터 8편

// ---------------------------------------------------------------------------
// 인자
// ---------------------------------------------------------------------------

const [cmd, ...rest] = process.argv.slice(2)
const flags = { out: null, json: false, dryRun: false }
const targets = []
for (let i = 0; i < rest.length; i++) {
  const a = rest[i]
  if (a === '--out') flags.out = rest[++i]
  else if (a === '--json') flags.json = true
  else if (a === '--dry-run') flags.dryRun = true
  else if (a.startsWith('--')) { console.error(`알 수 없는 옵션: ${a}`); process.exit(64) }
  else targets.push(a.replace(/\\/g, '/'))
}

// ---------------------------------------------------------------------------
// 공용
// ---------------------------------------------------------------------------

async function listDocs(prefixes = []) {
  const docs = []
  ;(function walk(node) {
    for (const c of node.children) c.type === 'doc' ? docs.push(c.path) : walk(c)
  })(await buildTree())
  return prefixes.length ? docs.filter((p) => prefixes.some((pre) => p === pre || p.startsWith(pre))) : docs
}

const slugOf = (p) => p.replace(/\.md$/, '').replace(/\//g, '__')

async function loadManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return {}
    throw err
  }
}

async function saveManifest(m) {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true })
  const sorted = Object.fromEntries(Object.keys(m).sort().map((k) => [k, m[k]]))
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8')
}

/** 블록마다 자유 블록 여부와 단위 번호를 붙인다. 번호는 freeBlocks 순서와 같다. */
function annotate(blocks) {
  const pf = proseFenceIndexes(blocks)
  let fenceNo = 0
  let unit = 0
  return blocks.map((block) => {
    let isPF = false
    if (block.kind === 'fence') { isPF = pf.has(fenceNo); fenceNo++ }
    const free = isFree(block, isPF)
    return { block, isPF, unit: free ? unit++ : null }
  })
}

/** 단위가 차지하는 줄 범위(0부터, 양끝 포함). 산문은 앞뒤 빈 줄을 뺀다. */
function extentOf({ block, isPF }) {
  if (block.kind === 'fence') return [block.start + 1, block.end - 1]
  if (block.kind === 'list') return [block.start, block.end]
  let s = 0
  let e = block.lines.length - 1
  while (s <= e && block.lines[s].trim() === '') s++
  while (e >= s && block.lines[e].trim() === '') e--
  return [block.start + s, block.start + e]
}

const kindLabel = (a) => (a.block.kind === 'fence' ? 'prosefence' : a.block.kind)

/**
 * 개념 문서 3행 리드 블록쿼트의 "형태 번호". 에이전트끼리 상의할 수 없으니 경로에서
 * 정해진다. (챕터 번호 + 파일 번호 + 중간 폴더 첫 글자의 알파벳 순번) mod 7.
 */
function leadShape(p) {
  const parts = p.split('/')
  const base = parts[parts.length - 1]
  const chap = /^(\d+)-/.exec(parts[0])
  const file = /^(\d+)-/.exec(base)
  if (!chap || !file) return null
  let mid = 0
  if (parts.length >= 3) {
    const c = parts[1][0].toLowerCase()
    if (c >= 'a' && c <= 'z') mid = c.charCodeAt(0) - 96
  }
  return (Number(chap[1]) + Number(file[1]) + mid) % 7
}

// ---------------------------------------------------------------------------
// extract
// ---------------------------------------------------------------------------

/** 고정 블록을 에이전트에게 한 줄로 요약한다. 보존용 ASCII 주석은 잡음이라 통째로 뺀다. */
function digest(b) {
  const first = b.lines[0]
  switch (b.kind) {
    case 'heading': return `[heading] ${first}`
    case 'hr': return '[---]'
    case 'html': return `[html] ${first.trim()}`
    case 'image': return `[image] ${first.replace(/\(.*\)\s*$/, '').replace(/^!\[/, '').replace(/\]$/, '')}`
    case 'checklist': return `[checklist ${b.lines.length}개 항목 — 고정]`
    case 'table': return `[table ${b.lines.length}줄 — 고정] ${first.trim().slice(0, 80)}`
    case 'fence': return `[code: ${b.info || 'text'}, ${b.lines.length - 2}줄 — 고정]`
    case 'comment': {
      const m = /^\s*<!--\s*diagram:([\w-]+)/.exec(first)
      if (m) return `[diagram: ${m[1]}]`
      if (/위 그림이 대체한 원본 ASCII/.test(first)) return null
      return `[comment ${b.lines.length}줄 — 고정]`
    }
    default: return null
  }
}

async function extractDoc(p, outDir) {
  const cur = await readFileNormalized(p)
  const lines = cur.text.split('\n')
  const ann = annotate(segment(cur.text))
  const shape = leadShape(p)

  const out = []
  out.push(`# 문서: ${p}`)
  out.push('# 아래 [대괄호] 줄은 고정 구조라 고칠 수 없습니다. @@UNIT ~ @@END 사이의 글만 다시 씁니다.')
  out.push('')
  let units = 0
  for (const a of ann) {
    if (a.unit == null) {
      const d = digest(a.block)
      if (d) out.push(d, '')
      continue
    }
    units++
    const [s, e] = extentOf(a)
    const attrs = [`kind=${kindLabel(a)}`, `lines=${s + 1}-${e + 1}`]
    // 리드 블록쿼트: 3행에서 시작하는 인용문
    if (shape != null && a.block.kind === 'prose' && s === 2 && lines[2].startsWith('>')) attrs.push('role=lead', `shape=${shape}`)
    out.push(`@@UNIT ${String(a.unit).padStart(4, '0')} ${attrs.join(' ')}`)
    out.push(...lines.slice(s, e + 1))
    out.push('@@END', '')
  }

  const slug = slugOf(p)
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, `${slug}.units.txt`), out.join('\n'), 'utf8')
  await fs.writeFile(
    path.join(outDir, `${slug}.meta.json`),
    JSON.stringify({ path: p, textHash: sha256(cur.text), units }, null, 2),
    'utf8',
  )
  return { path: p, units }
}

// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------

function parseSidecar(text) {
  const units = new Map()
  const problems = []
  let cur = null
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const m = /^@@UNIT\s+(\d+)\b/.exec(line)
    if (m) {
      const id = Number(m[1])
      if (units.has(id)) problems.push(`unit ${m[1]} 이 두 번 나온다`)
      cur = { id, lines: [] }
      units.set(id, cur)
    } else if (/^@@END\s*$/.test(line)) {
      cur = null
    } else if (cur) {
      cur.lines.push(line)
    }
  }
  for (const u of units.values()) {
    while (u.lines.length && !u.lines[0].trim()) u.lines.shift()
    while (u.lines.length && !u.lines[u.lines.length - 1].trim()) u.lines.pop()
  }
  return { units, problems }
}

/** 줄 배열에서 여러 범위를 한꺼번에 바꾼다. 뒤에서부터 잘라야 앞쪽 줄 번호가 안 틀어진다. */
function spliceMany(lines, edits) {
  const out = lines.slice()
  for (const e of [...edits].sort((a, b) => b.s - a.s)) out.splice(e.s, e.e - e.s + 1, ...e.lines)
  return out
}

async function applyDoc(p, outDir, manifest) {
  const slug = slugOf(p)
  const sidecarPath = path.join(outDir, `${slug}.rewrite.txt`)
  const metaPath = path.join(outDir, `${slug}.meta.json`)

  let sidecarRaw
  try {
    sidecarRaw = await fs.readFile(sidecarPath, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') return { path: p, status: 'missing' }
    throw err
  }
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'))
  const cur = await readFileNormalized(p)
  if (sha256(cur.text) !== meta.textHash) {
    return { path: p, status: 'stale', note: '추출 뒤에 파일이 바뀌었다 — extract 를 다시 돌릴 것' }
  }

  const lines = cur.text.split('\n')
  const ann = annotate(segment(cur.text))
  const byUnit = new Map(ann.filter((a) => a.unit != null).map((a) => [a.unit, a]))
  if (byUnit.size !== meta.units) return { path: p, status: 'stale', note: `단위 수가 다르다 (${byUnit.size} != ${meta.units})` }

  const { units: sidecar, problems } = parseSidecar(sidecarRaw)
  const unknown = [...sidecar.keys()].filter((id) => !byUnit.has(id))
  if (unknown.length) problems.push(`없는 unit 번호: ${unknown.join(', ')}`)

  // 단위마다 따로 검사한다. 통과한 것만 모아 되꽂고, 실패한 것은 사유와 함께 남긴다.
  const passed = []
  const failed = []
  let unchanged = 0
  for (const id of [...sidecar.keys()].filter((i) => byUnit.has(i)).sort((a, b) => a - b)) {
    const a = byUnit.get(id)
    const [s, e] = extentOf(a)
    const next = sidecar.get(id).lines
    if (!next.length) { failed.push({ id, reasons: ['빈 글이다'], original: lines.slice(s, e + 1), attempt: [] }); continue }
    if (next.join('\n') === lines.slice(s, e + 1).join('\n')) { unchanged++; continue }
    const one = checkText(cur.text, spliceMany(lines, [{ s, e, lines: next }]).join('\n'), { voice: true })
    if (one.errors.length) {
      failed.push({ id, reasons: one.errors.map((x) => `[${x.code}] ${x.msg}`), original: lines.slice(s, e + 1), attempt: next })
    } else {
      passed.push({ id, s, e, lines: next })
    }
  }

  let afterText = cur.text
  let final = null
  if (passed.length) {
    afterText = spliceMany(lines, passed).join('\n')
    // 통과한 것들을 합쳐 한 번 더 — 단위 사이의 상호작용이나 파일 단위 규칙을 본다
    final = checkText(cur.text, afterText, { voice: true })
    if (final.errors.length) {
      return {
        path: p,
        status: 'error',
        note: '단위별로는 통과했지만 합치니 실패했다',
        reasons: final.errors.map((x) => `[${x.code}] ${x.line ? `${x.line}행 ` : ''}${x.msg}`),
      }
    }
  }

  const res = {
    path: p,
    status: failed.length || problems.length ? 'partial' : 'gated',
    units: meta.units,
    proposed: sidecar.size,
    applied: passed.length,
    unchanged,
    failed: failed.map((f) => f.id),
    problems,
    warns: final ? final.warns.map((w) => `[${w.code}] ${w.line ? `${w.line}행 ` : ''}${w.msg}`) : [],
    metrics: final?.metrics ?? null,
  }

  if (failed.length) {
    const rep = [`# 수리 대상: ${p}`, '# 아래 단위는 검사에 실패했습니다. 사유를 읽고 다시 써서 <슬러그>.rewrite.txt 에 같은 번호로 저장하세요.', '']
    for (const f of failed) {
      rep.push(`@@UNIT ${String(f.id).padStart(4, '0')} — 실패 사유`)
      for (const r of f.reasons) rep.push(`  · ${r}`)
      rep.push('--- 원문 ---', ...f.original, '--- 직전 시도 ---', ...(f.attempt.length ? f.attempt : ['(없음)']), '@@END', '')
    }
    await fs.writeFile(path.join(outDir, `${slug}.repair.txt`), rep.join('\n'), 'utf8')
  }

  if (passed.length && !flags.dryRun) {
    const w = await writeFileNormalized(p, afterText, { eol: cur.eol, bom: cur.bom, expectHash: cur.hash })
    // 다음 수리 라운드가 같은 번호로 이어지도록 meta 를 새 텍스트 기준으로 갱신한다
    await fs.writeFile(metaPath, JSON.stringify({ path: p, textHash: sha256(afterText), units: meta.units }, null, 2), 'utf8')
    manifest[p] = {
      status: res.status === 'gated' ? 'gated' : 'partial',
      sha_before: manifest[p]?.sha_before ?? cur.hash,
      sha_after: w.hash,
      units: meta.units,
      applied: (manifest[p]?.applied ?? 0) + passed.length,
      failed_units: res.failed,
      round: (manifest[p]?.round ?? 0) + 1,
      ts: new Date().toISOString(),
    }
  } else if (!flags.dryRun) {
    // 아무것도 안 고쳤다. "변경 없음"도 끝난 상태다. 실패만 있으면 partial.
    manifest[p] = {
      status: res.status === 'gated' ? 'gated' : 'partial',
      sha_before: manifest[p]?.sha_before ?? cur.hash,
      sha_after: cur.hash,
      units: meta.units,
      applied: manifest[p]?.applied ?? 0,
      failed_units: res.failed,
      round: (manifest[p]?.round ?? 0) + 1,
      ts: new Date().toISOString(),
    }
  }
  return res
}

// ---------------------------------------------------------------------------
// plan
// ---------------------------------------------------------------------------

async function briefFor(dir) {
  const out = { folder: dir, readmeLead: '', siblings: [] }
  try {
    const r = await readFileNormalized(dir === '.' ? 'README.md' : `${dir}/README.md`)
    const fb = freeBlocks(segment(r.text))
    if (fb.length) out.readmeLead = fb[0].text.trim().slice(0, 400)
  } catch { /* README 가 없으면 비워 둔다 */ }
  return out
}

async function cmdPlan() {
  const manifest = await loadManifest()
  const docs = await listDocs(targets)
  const rows = []
  for (const p of docs) {
    const cur = await readFileNormalized(p)
    const m = manifest[p]
    if (m && m.status === 'gated' && m.sha_after === cur.hash) continue // 끝난 문서
    const chars = freeBlocks(segment(cur.text)).reduce((n, f) => n + f.text.replace(/\s+/g, '').length, 0)
    const title = /^#\s+(.+)$/m.exec(cur.text)?.[1] ?? p
    rows.push({ path: p, chars, title, dir: path.posix.dirname(p), chapter: p.split('/')[0] })
  }

  const shards = []
  const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))
  const groupBy = (arr, key) => arr.reduce((m, x) => ((m[key(x)] ||= []).push(x), m), {})

  for (const r of rows.filter((r) => r.chars >= TIER_H)) shards.push({ tier: 'H', docs: [r] })
  for (const [, g] of Object.entries(groupBy(rows.filter((r) => r.chars >= TIER_M && r.chars < TIER_H), (r) => r.dir))) {
    for (const c of chunk(g, M_GROUP)) shards.push({ tier: 'M', docs: c })
  }
  for (const [, g] of Object.entries(groupBy(rows.filter((r) => r.chars < TIER_M), (r) => (r.path.includes('/') ? r.chapter : '.')))) {
    for (const c of chunk(g, L_GROUP)) shards.push({ tier: 'L', docs: c })
  }
  shards.sort((a, b) => b.docs.reduce((n, d) => n + d.chars, 0) - a.docs.reduce((n, d) => n + d.chars, 0))

  // 폴더 브리프: README 첫 문단 원문 + 같은 폴더 개념 문서 제목
  const briefs = {}
  for (const dir of new Set(rows.map((r) => r.dir))) {
    briefs[dir] = await briefFor(dir)
    const all = await listDocs([dir === '.' ? '' : dir + '/'])
    briefs[dir].siblings = []
    for (const q of all.filter((x) => path.posix.dirname(x) === dir && /\/?\d\d-/.test(path.posix.basename(x)))) {
      const t = /^#\s+(.+)$/m.exec((await readFileNormalized(q)).text)?.[1]
      if (t) briefs[dir].siblings.push(t)
    }
  }

  const result = {
    docs: rows.length,
    chars: rows.reduce((n, r) => n + r.chars, 0),
    shards: shards.map((s, i) => ({
      id: `S${String(i + 1).padStart(3, '0')}`,
      tier: s.tier,
      chars: s.docs.reduce((n, d) => n + d.chars, 0),
      docs: s.docs.map((d) => d.path),
      briefs: [...new Set(s.docs.map((d) => d.dir))].map((d) => briefs[d]),
    })),
  }
  if (flags.json) console.log(JSON.stringify(result))
  else {
    const t = { H: 0, M: 0, L: 0 }
    for (const s of result.shards) t[s.tier]++
    console.log(`대상 ${result.docs}편 · 산문 ${result.chars}자 · 샤드 ${result.shards.length}개 (H ${t.H} / M ${t.M} / L ${t.L})`)
  }
}

// ---------------------------------------------------------------------------
// status
// ---------------------------------------------------------------------------

async function cmdStatus() {
  const manifest = await loadManifest()
  const docs = await listDocs(targets)
  const tally = {}
  for (const p of docs) {
    const cur = await readFileNormalized(p)
    const m = manifest[p]
    let s = 'pending'
    if (m) s = m.sha_after === cur.hash ? m.status : `${m.status}(수정됨→pending)`
    tally[s] = (tally[s] || 0) + 1
  }
  console.log(`문서 ${docs.length}편`)
  for (const [k, v] of Object.entries(tally).sort()) console.log(`  ${k.padEnd(24)} ${v}`)
}

// ---------------------------------------------------------------------------
// 실행
// ---------------------------------------------------------------------------

if (cmd === 'plan') await cmdPlan()
else if (cmd === 'status') await cmdStatus()
else if (cmd === 'extract' || cmd === 'apply') {
  if (!flags.out) { console.error('--out <dir> 이 필요하다'); process.exit(64) }
  const outDir = path.resolve(flags.out)

  if (cmd === 'extract') {
    const docs = await listDocs(targets)
    let n = 0
    for (const p of docs) { await extractDoc(p, outDir); n++ }
    console.log(`추출 ${n}편 → ${outDir}`)
  } else {
    const manifest = await loadManifest()
    const docs = await listDocs(targets)
    const res = []
    for (const p of docs) {
      const r = await applyDoc(p, outDir, manifest)
      if (r.status !== 'missing') res.push(r)
    }
    if (!flags.dryRun) await saveManifest(manifest)

    const by = {}
    let b = null
    let a = null
    for (const r of res) {
      by[r.status] = (by[r.status] || 0) + 1
      const mark = r.status === 'gated' ? '✓' : r.status === 'partial' ? '△' : '✗'
      const detail = r.applied != null
        ? `${r.applied}/${r.proposed}개 반영, 변경 없음 ${r.unchanged}${r.failed.length ? `, 실패 unit ${r.failed.join(',')}` : ''}`
        : r.note
      console.log(`${mark} ${r.path}  ${detail}`)
      for (const x of r.reasons || []) console.log(`    · ${x}`)
      for (const x of r.problems || []) console.log(`    · ${x}`)
      for (const x of (r.warns || []).slice(0, 4)) console.log(`    ! ${x}`)
      if (r.metrics) {
        b = b ? [...b, r.metrics.before] : [r.metrics.before]
        a = a ? [...a, r.metrics.after] : [r.metrics.after]
      }
    }
    console.log('')
    console.log(`결과: ${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(' · ') || '사이드카 없음'}${flags.dryRun ? '  (dry-run — 파일은 그대로)' : ''}`)
    if (b) {
      const pool = (list, k) => {
        const w = list.reduce((s, r) => s + r.sentences, 0) || 1
        return list.reduce((s, r) => s + r[k] * r.sentences, 0) / w
      }
      console.log(`리듬(참고) CV ${pool(b, 'cv').toFixed(3)} → ${pool(a, 'cv').toFixed(3)} · 짧은 문장 ${(pool(b, 'short') * 100).toFixed(1)}% → ${(pool(a, 'short') * 100).toFixed(1)}%`)
    }
  }
} else {
  console.error('사용법: humanize-prose.js <plan|extract|apply|status> [옵션]')
  process.exit(64)
}
