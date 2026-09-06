/**
 * 해라체 → 합니다체 변환기.
 *
 * STYLEGUIDE.md 1절(합니다체 단일 규칙)에 맞춰 `lint-style.js`의 register-plain-leak
 * 규칙이 잡아내는 해라체 종결을 실제로 고쳐 쓴다. `lint-style.js`와 같은
 * `server/mask.js` 마스킹 함수를 써서, 린터가 "위반 없음"이라 판정하는 텍스트와
 * 이 스크립트가 "손댈 후보"로 보는 텍스트가 항상 같은 기준에서 나오게 한다.
 *
 * 종결어미 변환은 문자열 치환이 아니라 활용형 변환이다. 판정 순서는 다음과 같다.
 *
 *   1. 종결 직전 음절이 '는' 이면 — 자음 어간의 현재형 표지('-는다')다.
 *      '는'을 떼고 어간에 '습니다'를 붙인다. (읽는다 → 읽습니다)
 *   2. 종결 직전 음절의 종성이 ㄴ 또는 ㄹ이면 — '-ㄴ다'/'-ㄹ다' 현재형 표지다.
 *      그 음절의 종성을 ㅂ으로 바꾸고 '니다'를 붙인다. (쓴다 → 씁니다, 만든다 → 만듭니다)
 *   3. 종성이 없는 개방음절이면서 그 음절이 '하' 또는 '이'이면 — '-하다'(용언화
 *      접미사)나 'N이다'(계사) 패턴은 항상 안전하게 그 음절에 종성 ㅂ을 붙여
 *      융합한다. (가능하다 → 가능합니다, 책이다 → 책입니다)
 *   4. 그 밖의 개방음절('다르다', '이유다'처럼 이미 축약된 명사+다 등)은 용언
 *      어간(뒤에 ㅂ을 융합)인지 명사+계사 축약(뒤에 '입니다'를 새 음절로 붙임)인지
 *      기계적으로 가릴 수 없다 — '마찬가지다'가 접미사 매칭으로 '마찬가집니다'가
 *      되는 식의 오분류가 실제로 일어난다. 완전일치 결정표(t2-decision-table.json)를
 *      조회하고, 표에 없으면 건드리지 않고 --report/--apply 출력에 '미등재'로 남긴다.
 *   5. 그 밖의 자음 어간(높다·많다·과거형 등)은 어간에 '습니다'를 그대로 붙인다.
 *
 * 사용법
 *   node scripts/convert-register.js --report [prefix]
 *     전 코퍼스(또는 prefix로 시작하는 문서만)를 스캔해 변환 후보를 규칙별로
 *     집계하고, 결정표에 없는 개방음절 어간(T2 미등재)을 빈도순으로 나열한다.
 *     파일은 건드리지 않는다.
 *   node scripts/convert-register.js --dry-run <prefix>
 *     prefix로 시작하는 문서에서 실제 치환 전/후 문장 쌍을 보여준다. 파일은
 *     건드리지 않는다.
 *   node scripts/convert-register.js --apply <prefix>
 *     prefix로 시작하는 문서를 실제로 고쳐 쓴다. 파일마다 불변식(줄 수, 엠대시
 *     횟수, 수치·영문 토큰 다중집합, 다이어그램 마커 수)을 먼저 확인하고, 하나라도
 *     깨지면 그 파일은 쓰지 않고 이유를 출력한다. CRLF·BOM은 원래 형식대로 되살린다.
 *
 * 읽기 전용이 아니다(--apply 모드에 한해 문서를 고쳐 쓴다). 그 밖의 모드는 읽기 전용이다.
 */

import path from 'node:path'
import fs from 'node:fs/promises'
import { buildTree, readFileNormalized, writeFileNormalized } from '../server/docs.js'
import { maskFormattingArtifacts, maskQuotedSpans } from '../server/mask.js'
import { APP_ROOT } from '../server/config.js'

const HEADING_RE = /^(#{1,6})\s+(.*)$/
const SENTENCE_FINAL_RE = /([가-힣]+)다\.(?=\s|$)/g

/** 한 줄 안의 인라인 코드 스팬(`...`)을 같은 길이의 공백으로 지운다.
 *  lint-style.js의 stripInlineCode와 달리 스팬을 제거하지 않고 블랭크 처리한다 —
 *  이 스크립트는 줄 안의 오프셋으로 원문을 그대로 잘라 붙이므로, 길이가 바뀌면
 *  오프셋이 어긋난다. */
function blankInlineCode(line) {
  return line.replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length))
}

function isPoliteEnding(word) {
  const n = word.length
  if (n < 2 || word[n - 1] !== '니') return false
  const c = word.charCodeAt(n - 2)
  if (c < 0xac00 || c > 0xd7a3) return false
  return (c - 0xac00) % 28 === 17
}

/** word의 마지막 음절 종성을 ㅂ(인덱스 17)으로 바꾸고(기존 종성이 무엇이든, 없어도)
 *  '니다'를 붙인다. */
function fuseAndAppendNida(word) {
  const n = word.length
  const lastCode = word.charCodeAt(n - 1)
  const jong = (lastCode - 0xac00) % 28
  const newLast = String.fromCharCode(lastCode - jong + 17)
  return word.slice(0, -1) + newLast + '니다'
}

/**
 * word(종결 '다' 앞부분)를 합니다체 종결로 바꾼다.
 * @returns {string|{unknown:true}} 변환 결과 문자열, 또는 결정표에 없어 판단을
 *   보류해야 하면 {unknown:true}.
 */
function transformEnding(word, t2Table) {
  const n = word.length
  const last = word[n - 1]
  const lastCode = last.charCodeAt(0)
  if (lastCode < 0xac00 || lastCode > 0xd7a3) return { unknown: true, reason: 'non-hangul-last-char' }

  if (last === '는') {
    return word.slice(0, -1) + '습니다' // -는다 (자음 어간 현재형) → -습니다
  }

  const jong = (lastCode - 0xac00) % 28
  if (jong === 4 || jong === 8) {
    return fuseAndAppendNida(word) // -ㄴ다 / -ㄹ다 → -ㅂ니다
  }
  if (jong === 0) {
    if (last === '하' || last === '이') {
      return fuseAndAppendNida(word) // -하다 / N-이다 → 항상 안전하게 융합
    }
    const verdict = t2Table[word]
    if (verdict === 'verb') return fuseAndAppendNida(word)
    if (verdict === 'noun') return word + '입니다'
    return { unknown: true, reason: 'open-syllable-not-in-table' }
  }
  return word + '습니다' // 그 밖의 자음 어간(과거형 포함)
}

async function loadT2Table() {
  const p = path.join(APP_ROOT, 'scripts', 't2-decision-table.json')
  try {
    const raw = await fs.readFile(p, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err.code === 'ENOENT') return {}
    throw err
  }
}

async function listDocs(prefix) {
  const docs = []
  ;(function walk(node) {
    for (const c of node.children) {
      if (c.type === 'doc') docs.push(c.path)
      else walk(c)
    }
  })(await buildTree())
  return prefix ? docs.filter((p) => p.startsWith(prefix)) : docs
}

/**
 * 문서 하나를 스캔해서 변환 후보 목록을 만든다. 파일은 건드리지 않는다.
 * @returns {{ path:string, text:string, lines:string[], edits: Array<{lineIdx:number,start:number,end:number,before:string,after:string|null,unknownReason?:string,word:string}> }}
 */
function scanDoc(repoPath, text, t2Table) {
  if (repoPath === 'STYLEGUIDE.md') return { path: repoPath, text, lines: text.split('\n'), edits: [] }

  const afterFences = maskFormattingArtifacts(text)
  const afterQuotes = maskQuotedSpans(afterFences)
  const scanLines = afterQuotes.split('\n').map(blankInlineCode)
  const originalLines = text.split('\n')
  const edits = []

  for (let i = 0; i < scanLines.length; i++) {
    const scanLine = scanLines[i]
    if (HEADING_RE.test(scanLine)) continue

    SENTENCE_FINAL_RE.lastIndex = 0
    let m
    while ((m = SENTENCE_FINAL_RE.exec(scanLine)) !== null) {
      const word = m[1]
      const start = m.index
      const end = SENTENCE_FINAL_RE.lastIndex
      if (isPoliteEnding(word)) continue
      const result = transformEnding(word, t2Table)
      const before = originalLines[i].slice(start, end)
      if (typeof result === 'string') {
        edits.push({ lineIdx: i, start, end, before, after: result + '.', word })
      } else {
        edits.push({ lineIdx: i, start, end, before, after: null, unknownReason: result.reason, word })
      }
    }
  }
  return { path: repoPath, text, lines: originalLines, edits }
}

function applyEdits(lines, edits) {
  const byLine = new Map()
  for (const e of edits) {
    if (e.after == null) continue
    if (!byLine.has(e.lineIdx)) byLine.set(e.lineIdx, [])
    byLine.get(e.lineIdx).push(e)
  }
  const out = lines.slice()
  for (const [lineIdx, lineEdits] of byLine) {
    lineEdits.sort((a, b) => b.start - a.start) // 뒤에서부터 잘라 붙여야 앞쪽 오프셋이 안 틀어진다
    let line = out[lineIdx]
    for (const e of lineEdits) {
      line = line.slice(0, e.start) + e.after + line.slice(e.end)
    }
    out[lineIdx] = line
  }
  return out.join('\n')
}

// ---------------------------------------------------------------------------
// 불변식 검사 — --apply 가 쓰기 전에 확인한다
// ---------------------------------------------------------------------------

const NUMBER_RE = /\d+(\.\d+)?/g
const LATIN_TOKEN_RE = /[A-Za-z_][A-Za-z0-9_.-]*/g
const DIAGRAM_MARKER_RE = /<!--\s*diagram:/g

function multiset(text, re) {
  const m = new Map()
  for (const tok of text.match(re) || []) m.set(tok, (m.get(tok) || 0) + 1)
  return m
}

function multisetEqual(a, b) {
  if (a.size !== b.size) return false
  for (const [k, v] of a) if (b.get(k) !== v) return false
  return true
}

function checkInvariants(before, after) {
  const problems = []
  if (before.split('\n').length !== after.split('\n').length) problems.push('줄 수가 바뀌었다')
  const dashBefore = (before.match(/—/g) || []).length
  const dashAfter = (after.match(/—/g) || []).length
  if (dashBefore !== dashAfter) problems.push(`엠대시 개수가 바뀌었다 (${dashBefore} → ${dashAfter})`)
  if (!multisetEqual(multiset(before, NUMBER_RE), multiset(after, NUMBER_RE))) problems.push('수치 다중집합이 바뀌었다')
  if (!multisetEqual(multiset(before, LATIN_TOKEN_RE), multiset(after, LATIN_TOKEN_RE))) problems.push('영문 토큰 다중집합이 바뀌었다')
  const markerBefore = (before.match(DIAGRAM_MARKER_RE) || []).length
  const markerAfter = (after.match(DIAGRAM_MARKER_RE) || []).length
  if (markerBefore !== markerAfter) problems.push(`다이어그램 마커 수가 바뀌었다 (${markerBefore} → ${markerAfter})`)
  return problems
}

// ---------------------------------------------------------------------------
// 모드
// ---------------------------------------------------------------------------

async function runReport(prefix) {
  const t2Table = await loadT2Table()
  const docs = await listDocs(prefix)

  const byKind = new Map() // 'strip-neun' | 'fuse-consonant' | 'fuse-ha-i' | 't2-verb' | 't2-noun' | 'append-seupnida' | 'unknown'
  const unknownWords = new Map() // word -> count
  let totalEdits = 0

  for (const p of docs) {
    const { text } = await readFileNormalized(p)
    const { edits } = scanDoc(p, text, t2Table)
    for (const e of edits) {
      totalEdits++
      let kind
      if (e.after == null) {
        kind = 'unknown'
        unknownWords.set(e.word, (unknownWords.get(e.word) || 0) + 1)
      } else if (e.word[e.word.length - 1] === '는') {
        kind = 'strip-neun'
      } else {
        const lastCode = e.word.charCodeAt(e.word.length - 1)
        const jong = (lastCode - 0xac00) % 28
        if (jong === 4 || jong === 8) kind = 'fuse-consonant'
        else if (jong === 0 && (e.word[e.word.length - 1] === '하' || e.word[e.word.length - 1] === '이')) kind = 'fuse-ha-i'
        else if (jong === 0) kind = t2Table[e.word] === 'verb' ? 't2-verb' : 't2-noun'
        else kind = 'append-seupnida'
      }
      byKind.set(kind, (byKind.get(kind) || 0) + 1)
    }
  }

  console.log(`대상 문서: ${docs.length}편${prefix ? ` (prefix: ${prefix})` : ''}`)
  console.log(`변환 후보 총 ${totalEdits}건`)
  console.log('')
  console.log('종류별 집계')
  for (const [kind, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${kind.padEnd(18)} ${n}`)
  }

  if (unknownWords.size > 0) {
    console.log('')
    console.log(`결정표 미등재 개방음절 어간 ${unknownWords.size}종 (빈도순, 표 t2-decision-table.json에 'verb' 또는 'noun'으로 등재 필요)`)
    for (const [word, n] of [...unknownWords.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)}  ${word}`)
    }
  }
}

async function runDryRun(prefix) {
  const t2Table = await loadT2Table()
  const docs = await listDocs(prefix)
  for (const p of docs) {
    const { text } = await readFileNormalized(p)
    const { lines, edits } = scanDoc(p, text, t2Table)
    if (edits.length === 0) continue
    console.log(`\n=== ${p} ===`)
    for (const e of edits) {
      const line = lines[e.lineIdx]
      const before = line.slice(Math.max(0, e.start - 20), e.end)
      if (e.after == null) {
        console.log(`  ${e.lineIdx + 1}: [미등재:${e.word}] …${before}`)
      } else {
        const after = before.slice(0, before.length - e.before.length) + e.after
        console.log(`  ${e.lineIdx + 1}: …${before}  →  …${after}`)
      }
    }
  }
}

async function runApply(prefix) {
  if (!prefix) throw new Error('--apply 는 대상 prefix가 필요하다 (전체를 한 번에 쓰지 않는다)')
  const t2Table = await loadT2Table()
  const docs = await listDocs(prefix)

  let writeCount = 0
  let unknownRemain = 0
  const failed = []

  for (const p of docs) {
    const doc = await readFileNormalized(p)
    const { lines, edits } = scanDoc(p, doc.text, t2Table)
    const resolvable = edits.filter((e) => e.after != null)
    const unknown = edits.filter((e) => e.after == null)
    unknownRemain += unknown.length
    if (unknown.length > 0) {
      for (const u of unknown) console.log(`  ${p}:${u.lineIdx + 1}  [미등재] ${u.word} (${u.reason})`)
    }
    if (resolvable.length === 0) continue

    const newText = applyEdits(lines, resolvable)
    const problems = checkInvariants(doc.text, newText)
    if (problems.length > 0) {
      failed.push({ path: p, problems })
      console.log(`  ${p}: 불변식 위반으로 쓰지 않음 — ${problems.join(', ')}`)
      continue
    }

    await writeFileNormalized(p, newText, { eol: doc.eol, bom: doc.bom, expectHash: doc.hash })
    writeCount++
    console.log(`  ${p}: ${resolvable.length}건 변환`)
  }

  console.log('')
  console.log(`완료 — 문서 ${writeCount}편 변환, 결정표 미등재 ${unknownRemain}건 남음, 불변식 위반 ${failed.length}편`)
  if (failed.length > 0) process.exitCode = 1
}

const args = process.argv.slice(2)
const mode = args[0]
const prefix = args[1]

if (mode === '--report') {
  await runReport(prefix)
} else if (mode === '--dry-run') {
  await runDryRun(prefix)
} else if (mode === '--apply') {
  await runApply(prefix)
} else {
  console.error('사용법: node scripts/convert-register.js --report [prefix] | --dry-run <prefix> | --apply <prefix>')
  process.exitCode = 1
}
