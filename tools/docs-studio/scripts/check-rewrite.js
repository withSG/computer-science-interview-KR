/**
 * 재작성 검사기 — 본문 산문을 고친 뒤 "고치면 안 되는 것"이 멀쩡한지 본다.
 *
 * 문체를 감시하지 않는다. 산문이 어떻게 바뀌었는지는 상관하지 않고, 산문 바깥이
 * 그대로인지, 산문 속의 사실 부품(숫자·영문 용어·코드·링크)이 남아 있는지만 본다.
 * 판정 규칙은 server/rewrite-check.js 에 있고, 이 스크립트는 git 에서 재작성 전후를
 * 꺼내 와 그 판정을 돌리고 결과를 보여 준다.
 *
 * 핵심은 뼈대(skeleton) 비교다. 문서를 블록 배열로 바꾸되 헤딩·표·코드·주석·
 * 체크리스트·다이어그램은 원문 그대로, 산문 덩어리는 `PROSE` 하나로 접는다. 재작성
 * 전후의 뼈대가 같아야 한다. 줄 수가 달라져도, 문단을 합치거나 쪼개도 같다.
 *
 * 사용법 (저장소 어디서든 — 경로는 config.js 가 잡는다)
 *   node tools/docs-studio/scripts/check-rewrite.js --base <rev> [--head <rev>] [경로 접두어...]
 *     --base <rev>       필수. 재작성 이전의 커밋/태그
 *     --head <rev>       생략하면 작업 트리
 *     --volume=lo:hi     덩어리별 분량 비 경고 범위 (기본 0.75:1.35)
 *     --voice            금지 구문(S1 증가는 오류, S2 상한 초과는 경고)도 본다
 *     --json             기계가 읽는 출력
 *     --quiet            요약만
 *     --strict           경고도 실패로
 *   종료 코드  0 정상 · 1 오류 · 2 경고만
 *
 * git blob 은 LF, 작업 트리는 CRLF(core.autocrlf=true)라서 양쪽을 모두 normalize 한
 * 뒤 비교한다. CRLF·BOM 검사만 작업 트리의 원시 바이트로 한다.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { REPO_ROOT } from '../server/config.js'
import { normalize } from '../server/eol.js'
import { checkText } from '../server/rewrite-check.js'

// ---------------------------------------------------------------------------
// 인자
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const opt = { base: null, head: null, json: false, quiet: false, strict: false, voice: false, volume: [0.75, 1.35], prefixes: [] }
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--base') opt.base = argv[++i]
  else if (a === '--head') opt.head = argv[++i]
  else if (a === '--json') opt.json = true
  else if (a === '--quiet') opt.quiet = true
  else if (a === '--strict') opt.strict = true
  else if (a === '--voice') opt.voice = true
  else if (a.startsWith('--volume=')) opt.volume = a.slice(9).split(':').map(Number)
  else if (a.startsWith('--')) { console.error(`알 수 없는 옵션: ${a}`); process.exit(64) }
  else opt.prefixes.push(a.replace(/\\/g, '/'))
}
if (!opt.base) {
  console.error('사용법: check-rewrite.js --base <rev> [--head <rev>] [--voice] [--json] [--quiet] [--strict] [경로 접두어...]')
  process.exit(64)
}

// ---------------------------------------------------------------------------
// git
// ---------------------------------------------------------------------------

function git(args) {
  return execFileSync('git', args, { cwd: REPO_ROOT, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] })
}

function gitShow(rev, p) {
  try {
    return git(['show', `${rev}:${p}`]).toString('utf8')
  } catch {
    return null
  }
}

const inCorpus = (p) => !p.startsWith('tools/') && !p.startsWith('assets/') && !p.includes('node_modules/')

function listChanged() {
  const range = opt.head ? [opt.base, opt.head] : [opt.base]
  const raw = git(['diff', '--name-status', '--no-renames', '-z', ...range, '--', '*.md']).toString('utf8')
  const tok = raw.split('\0').filter(Boolean)
  const out = []
  for (let i = 0; i + 1 < tok.length; i += 2) out.push({ status: tok[i][0], path: tok[i + 1] })
  if (!opt.head) {
    const untracked = git(['ls-files', '--others', '--exclude-standard', '-z', '--', '*.md']).toString('utf8')
    for (const p of untracked.split('\0').filter(Boolean)) out.push({ status: 'A', path: p })
  }
  return out
    .filter((f) => inCorpus(f.path))
    .filter((f) => !opt.prefixes.length || opt.prefixes.some((pre) => f.path.startsWith(pre)))
    .sort((a, b) => a.path.localeCompare(b.path))
}

/** 원시 바이트 수준의 개행·BOM 검사 (작업 트리 한정). */
function eolProblems(raw) {
  const out = []
  if (raw.charCodeAt(0) === 0xfeff) out.push('UTF-8 BOM 이 있다')
  const body = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  let crlf = 0
  let lone = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '\n') (i > 0 && body[i - 1] === '\r') ? crlf++ : lone++
  }
  if (lone > 0 && crlf === 0) out.push('개행이 LF 뿐이다 — CRLF 여야 한다')
  else if (lone > 0) out.push(`CRLF 와 LF 가 섞여 있다 (LF ${lone}줄)`)
  return out
}

// ---------------------------------------------------------------------------
// 실행
// ---------------------------------------------------------------------------

const changed = listChanged()
const report = []
const agg = { b: [], a: [], dashB: 0, dashA: 0, charsB: 0, charsA: 0 }

for (const f of changed) {
  const entry = { path: f.path, status: f.status, errors: [], warns: [], notes: [] }
  report.push(entry)
  if (f.status === 'A') { entry.errors.push({ code: 'added', msg: '재작성에서 새 파일이 생겼다' }); continue }
  if (f.status === 'D') { entry.errors.push({ code: 'deleted', msg: '재작성에서 파일이 지워졌다' }); continue }

  const beforeRaw = gitShow(opt.base, f.path)
  if (beforeRaw == null) { entry.errors.push({ code: 'no-base', msg: `${opt.base} 에 이 파일이 없다` }); continue }
  const afterRaw = opt.head ? gitShow(opt.head, f.path) : await fs.readFile(path.join(REPO_ROOT, f.path), 'utf8')
  if (afterRaw == null) { entry.errors.push({ code: 'no-head', msg: `${opt.head} 에 이 파일이 없다` }); continue }

  if (!opt.head) for (const m of eolProblems(afterRaw)) entry.errors.push({ code: 'eol', msg: m })

  const r = checkText(normalize(beforeRaw).text, normalize(afterRaw).text, { volume: opt.volume, voice: opt.voice })
  entry.errors.push(...r.errors)
  entry.warns = r.warns
  entry.notes = r.notes
  if (r.metrics) {
    agg.b.push(r.metrics.before)
    agg.a.push(r.metrics.after)
    agg.dashB += r.metrics.dashB
    agg.dashA += r.metrics.dashA
    agg.charsB += r.metrics.charsB
    agg.charsA += r.metrics.charsA
  }
}

// 파일별 rhythm 을 문장 수로 가중 평균 — 정확한 전체 CV 는 아니지만 방향을 보기엔 충분하다
function pool(list) {
  const w = list.reduce((s, r) => s + r.sentences, 0) || 1
  const wp = list.reduce((s, r) => s + r.paragraphs, 0) || 1
  return {
    sentences: list.reduce((s, r) => s + r.sentences, 0),
    cv: list.reduce((s, r) => s + r.cv * r.sentences, 0) / w,
    short: list.reduce((s, r) => s + r.short * r.sentences, 0) / w,
    oneSentenceParas: list.reduce((s, r) => s + r.oneSentenceParas * r.paragraphs, 0) / wp,
  }
}
const rb = pool(agg.b)
const ra = pool(agg.a)

const nErr = report.reduce((s, r) => s + r.errors.length, 0)
const nWarn = report.reduce((s, r) => s + r.warns.length, 0)
const filesErr = report.filter((r) => r.errors.length).length
const filesWarn = report.filter((r) => !r.errors.length && r.warns.length).length

if (opt.json) {
  console.log(JSON.stringify({ base: opt.base, head: opt.head, files: report, summary: { checked: report.length, errors: nErr, warnings: nWarn, rhythm: { before: rb, after: ra } } }, null, 2))
} else {
  if (!opt.quiet) {
    for (const r of report) {
      if (!r.errors.length && !r.warns.length && !r.notes.length) continue
      console.log(r.path)
      for (const e of r.errors) console.log(`  ✗ [${e.code}]${e.line ? ` ${e.line}행` : ''} ${e.msg}`)
      for (const w of r.warns) console.log(`  ! [${w.code}]${w.line ? ` ${w.line}행` : ''} ${w.msg}`)
      for (const n of r.notes) console.log(`  · [번역투 증가] ${n}`)
    }
  }
  const pct = (x) => `${(x * 100).toFixed(1)}%`
  console.log('')
  console.log(`검사 ${report.length}편 (기준 ${opt.base} → ${opt.head || '작업 트리'}) — 오류 ${nErr}건/${filesErr}편, 경고 ${nWarn}건/${filesWarn}편`)
  if (agg.b.length) {
    console.log(`  리듬(참고)  문장길이 CV ${rb.cv.toFixed(3)} → ${ra.cv.toFixed(3)} · 짧은 문장(≤25자) ${pct(rb.short)} → ${pct(ra.short)} · 한 문장 문단 ${pct(rb.oneSentenceParas)} → ${pct(ra.oneSentenceParas)}`)
    console.log(`  엠대시 ${agg.dashB} → ${agg.dashA} · 산문 ${agg.charsB} → ${agg.charsA}자 (${agg.charsB ? ((agg.charsA / agg.charsB) * 100).toFixed(1) : '-'}%)`)
  }
}

if (nErr > 0) process.exit(1)
if (nWarn > 0) process.exit(opt.strict ? 1 : 2)
process.exit(0)
