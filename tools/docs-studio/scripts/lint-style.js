/**
 * 문체·표기 규약 린터.
 *
 * `STYLEGUIDE.md` 가 정한 규약과 실제 문서가 어긋나는 곳을 기계적으로 찾아낸다.
 * `npm run lint` 로 돌린다. `check-corpus.js` 의 형제 스크립트 — 렌더링이 아니라
 * 문체·표기·구조를 검사한다는 점만 다르다.
 *
 * 읽기 전용이다. 어떤 문서도 고치지 않는다.
 */

import path from 'node:path'
import fs from 'node:fs/promises'
import { buildTree, readDoc, existsInRepo } from '../server/docs.js'
import { parseDiagrams } from '../server/diagram.js'
import { REPO_ROOT } from '../server/config.js'
import { maskFormattingArtifacts, stripInlineCode, maskQuotedSpans } from '../server/mask.js'

// ---------------------------------------------------------------------------
// 공통 유틸
// ---------------------------------------------------------------------------

/** 개념 설명 문서인가 (`NN-*.md`, `README.md`/`qna-*.md` 는 제외) */
function isConceptDoc(repoPath) {
  const base = path.posix.basename(repoPath)
  return /^\d+-.*\.md$/.test(base)
}

function isQnaDoc(repoPath) {
  return path.posix.basename(repoPath).startsWith('qna-')
}

/**
 * `STYLEGUIDE.md` 자신은 표기 규약 표에 비표준 표기(디렉토리, 쓰레드 …)를
 * 예시로 나열한다. 그 문장을 실제 위반으로 잡으면 규약 문서가 규약을 어긴
 * 것처럼 보이는 자기지시적 오탐이 생긴다 — 검사 대상(코퍼스 245편)이 아니라
 * 검사 기준 그 자체이므로 표기·번역투 검사에서는 제외한다.
 */
function isStyleguideItself(repoPath) {
  return repoPath === 'STYLEGUIDE.md'
}

const HEADING_RE = /^(#{1,6})\s+(.*)$/

/** 문서(마스킹된 텍스트) 안의 H2(`## `) 헤딩만 뽑는다 — 구역 추적 기준. */
function h2Headings(maskedText) {
  const out = []
  const lines = maskedText.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = HEADING_RE.exec(lines[i])
    if (m && m[1].length === 2) out.push({ line: i, text: m[2].trim() })
  }
  return out
}

// ---------------------------------------------------------------------------
// 규칙 1: register — 합니다체 단일 규칙 (STYLEGUIDE.md 1절)
// ---------------------------------------------------------------------------
//
// 문서 245편 전체에서 마침표로 끝나는 해라체 종결(~한다./~이다./~된다. 등)을 잡는다.
// 문서 종류별 예외나 절 구분은 없다 — qna-*.md 도, README.md 도, 「면접 포인트」
// 절 안팎도 똑같이 검사한다.
//
// 판정은 마침표 앞의 "한글 + 다" 패턴을 전부 찾은 뒤, 그 종결이 합쇼체(~니다)인지를
// 종성으로 가려낸다. 'X니다'에서 X(니 바로 앞 음절)의 종성이 ㅂ(28종성 목록의
// 인덱스 17)이면 합니다/입니다/습니다/됩니다 같은 합쇼체이므로 통과시킨다. 개별
// 어미를 하드코딩하지 않고 종성으로 판정하므로 '갑니다', '옵니다', '먹습니다'처럼
// STYLEGUIDE.md의 활용형 대응표에 없는 형태도 정확히 통과한다.
//
// 마침표를 필수로 요구하는 것이 핵심이다 — 이 저장소는 산문을 110자 안팎에서
// 강제 개행하므로, 마침표 없이 '다'로 끝나는 줄에는 강제 개행으로 잘린 '~보다'
// (비교 조사) 같은 오탐이 섞이고, 헤딩·체크리스트 항목(STYLEGUIDE.md 1.1 —
// 규약 대상 밖)도 여기 걸린다.
//
// `>` 인용 블록은 더 이상 예외로 두지 않는다 — 실측 결과 이 저장소의 `>` 인용은
// 리드문·비유 설명 등 문서 자신의 목소리가 대부분이고, 진짜 타인 발화는 큰따옴표
// 안에 있어 maskQuotedSpans가 이미 걸러낸다.

// 볼드/이탤릭 마커(**, __, *, _)가 어간과 '다' 사이, '다'와 마침표 사이, 또는
// 마침표 뒤에 끼어들어도(예: "**주어**다.", "**중요하다**.", "**프록시다.**")
// 종결로 인식해야 한다 — convert-register.js의 같은 이름 상수와 반드시 동일하게
// 유지한다.
const EMPHASIS_RE = '(?:\\*{1,2}|_{1,2})?'
const SENTENCE_FINAL_RE = new RegExp(`([가-힣]+)${EMPHASIS_RE}다${EMPHASIS_RE}\\.${EMPHASIS_RE}(?=\\s|$)`, 'g')

/**
 * 'X니다' 또는 'X시다' 형태의 합쇼체 종결인가. word는 마지막 '다' 앞부분(예:
 * 확인합니다의 '확인합니', 봅시다의 '봅시'). word가 '니' 또는 '시'로 끝나고,
 * 그 앞 음절(X)의 종성이 ㅂ이면 합쇼체다 — '니'는 합니다/습니다/입니다/됩니다,
 * '시'는 '-ㅂ시다/-읍시다' 청유형(갑시다, 봅시다, 합시다)이다. 우연히 '시'로
 * 끝나는 명사(프록시다 등)는 그 앞 음절 종성이 ㅂ일 일이 거의 없어 오탐 위험이
 * 낮다.
 */
function isPoliteEnding(word) {
  const n = word.length
  if (n < 2 || (word[n - 1] !== '니' && word[n - 1] !== '시')) return false
  const c = word.charCodeAt(n - 2)
  if (c < 0xac00 || c > 0xd7a3) return false
  return (c - 0xac00) % 28 === 17 // 28종성 목록 인덱스 17 = ㅂ
}

function checkRegister(repoPath, maskedText) {
  const violations = []
  if (isStyleguideItself(repoPath)) return violations // 활용형 대응표 자체가 '~한다' 등을 예시로 나열한다

  const lines = maskQuotedSpans(maskedText).split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (HEADING_RE.test(lines[i])) continue // 헤딩은 제목 — STYLEGUIDE.md 1.1
    const line = stripInlineCode(lines[i])
    SENTENCE_FINAL_RE.lastIndex = 0
    let m
    while ((m = SENTENCE_FINAL_RE.exec(line)) !== null) {
      if (isPoliteEnding(m[1])) continue
      violations.push({
        path: repoPath,
        line: i + 1,
        ruleId: 'register-plain-leak',
        severity: 'error',
        message: `해라체 종결이 남아 있다: "…${line.slice(Math.max(0, m.index - 24), SENTENCE_FINAL_RE.lastIndex)}"`,
      })
    }
  }
  return violations
}

// ---------------------------------------------------------------------------
// 규칙 2: spelling — 표기 표준
// ---------------------------------------------------------------------------

const SPELLING_MAP = [
  ['디렉토리', '디렉터리'],
  ['쓰레드', '스레드'],
  ['메세지', '메시지'],
  ['트랜색션', '트랜잭션'],
  ['어플리케이션', '애플리케이션'],
  ['컨텐츠', '콘텐츠'],
]

function checkSpelling(repoPath, maskedText) {
  const violations = []
  if (isStyleguideItself(repoPath)) return violations

  const lines = maskedText.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const stripped = stripInlineCode(lines[i])
    for (const [bad, good] of SPELLING_MAP) {
      let from = 0
      while (true) {
        const at = stripped.indexOf(bad, from)
        if (at === -1) break
        violations.push({
          path: repoPath,
          line: i + 1,
          ruleId: 'spelling',
          severity: 'error',
          message: `비표준 표기 '${bad}' → '${good}' 로 통일`,
        })
        from = at + bad.length
      }
    }
  }
  return violations
}

// ---------------------------------------------------------------------------
// 규칙 3: translationese — 번역투 과용 (경고)
// ---------------------------------------------------------------------------

// STYLEGUIDE.md 8절: "금지가 아니라 과용을 피하는 기준" — 한 문서에서 같은
// 패턴이 이 값을 넘게 반복되면 기계적으로 느껴진다고 보고 경고한다. 245편
// 규모 코퍼스에서 자연스러운 글이라면 같은 관용구가 한 문서 안에 여섯 번
// 이상 반복되는 일은 드물다는 관찰에 따라 5(초과)로 잡았다 — "금지"가 아니라
// "과용 감지"이므로 넉넉하게 잡는 편이 오탐을 줄인다.
const TRANSLATIONESE_THRESHOLD = 5

const PLURAL_WORDS = ['정보들', '데이터들', '기능들', '요소들', '값들', '경우들', '방법들', '문제들', '장점들', '단점들']

const TRANSLATIONESE_PATTERNS = [
  { key: '에-대한', label: "'~에 대한' 남용", count: (t) => countOccurrences(t, '에 대한') },
  { key: '통해', label: "'~를/을 통해' 남용", count: (t) => countOccurrences(t, '를 통해') + countOccurrences(t, '을 통해') },
  {
    key: '불필요한-들',
    label: '불필요한 ~들 복수형 남용',
    count: (t) => PLURAL_WORDS.reduce((sum, w) => sum + countOccurrences(t, w), 0),
  },
  { key: '핵심은', label: "상투적 도입 '핵심은' 반복", count: (t) => countOccurrences(t, '핵심은') },
]

function countOccurrences(haystack, needle) {
  let count = 0
  let from = 0
  while (true) {
    const at = haystack.indexOf(needle, from)
    if (at === -1) break
    count++
    from = at + needle.length
  }
  return count
}

function checkTranslationese(repoPath, maskedText) {
  const violations = []
  if (isStyleguideItself(repoPath)) return violations

  // 인라인 코드까지 한 번에 지우고 문서 전체를 하나의 문자열로 센다 — 줄 단위가
  // 아니라 "문서당 반복 횟수"가 기준이므로 줄별로 나눌 필요가 없다.
  const cleaned = maskedText
    .split('\n')
    .map(stripInlineCode)
    .join('\n')

  for (const pattern of TRANSLATIONESE_PATTERNS) {
    const n = pattern.count(cleaned)
    if (n > TRANSLATIONESE_THRESHOLD) {
      violations.push({
        path: repoPath,
        line: 1,
        ruleId: 'translationese',
        severity: 'warn',
        message: `${pattern.label}: 문서 안에서 ${n}회 (기준 ${TRANSLATIONESE_THRESHOLD}회 초과)`,
      })
    }
  }
  return violations
}

// ---------------------------------------------------------------------------
// 규칙 4: diagram-triplet
// ---------------------------------------------------------------------------

// parseDiagrams 는 마커 다음 줄이 이미지가 아니면 그 마커를 조용히 건너뛴다
// (server/diagram.js 48-51행). "마커는 있는데 다음 줄이 이미지가 아닌" 깨진
// 세트를 잡아내려면 마커 자체를 별도로 세어 parseDiagrams 결과 수와 비교해야
// 한다 — 파싱 로직 자체는 그대로 재사용하고, 이 한 가지 보충 검사만 얹는다.
const MARKER_RE = /^<!--\s*diagram:([A-Za-z0-9_-]+)\s*-->\s*$/

function checkDiagramTriplet(repoPath, text) {
  const violations = []
  const lines = text.split('\n')

  const markerLines = []
  for (let i = 0; i < lines.length; i++) {
    if (MARKER_RE.test(lines[i])) markerLines.push(i)
  }

  const diagrams = parseDiagrams(text, repoPath)
  const resolvedMarkerLines = new Set(diagrams.map((d) => d.markerLine))

  for (const ln of markerLines) {
    if (!resolvedMarkerLines.has(ln)) {
      violations.push({
        path: repoPath,
        line: ln + 1,
        ruleId: 'diagram-triplet',
        severity: 'error',
        message: '마커 다음의 첫 비어있지 않은 줄이 이미지 참조(![...](...)) 형식이 아니다',
      })
    }
  }

  for (const d of diagrams) {
    if (!existsInRepo(d.svgRepoPath)) {
      violations.push({
        path: repoPath,
        line: d.imageLine + 1,
        ruleId: 'diagram-triplet',
        severity: 'error',
        message: `참조한 SVG가 저장소에 없다: ${d.svgRepoPath}`,
      })
    }
    // 마커 id(<!-- diagram:ID -->)와 이미지 파일명(![...](.../ID.svg))이 같아야 한다.
    // parseDiagrams 는 이 둘을 별개 필드(id, src)로만 들고 있고 서로 맞는지는
    // 확인하지 않는다 — render.js 도 이미지 파일명에서 자기 id 를 따로 뽑아 쓰므로
    // 두 값이 조용히 어긋날 수 있는 지점이다.
    const imgBase = path.posix.basename(d.src)
    const imgId = imgBase.endsWith('.svg') ? imgBase.slice(0, -4) : imgBase
    if (imgId !== d.id) {
      violations.push({
        path: repoPath,
        line: d.imageLine + 1,
        ruleId: 'diagram-triplet',
        severity: 'error',
        message: `마커 id '${d.id}' 와 이미지 파일명 '${imgId}' 가 다르다`,
      })
    }
    if (!d.ascii) {
      // STYLEGUIDE.md 6절 — 912건은 원본 ASCII 보존 주석이 있고, 나머지 49건은
      // 직접 설계한 다이어그램이라 없을 수 있다. 없다고 해서 항상 잘못은
      // 아니므로 경고만 한다.
      violations.push({
        path: repoPath,
        line: d.imageLine + 1,
        ruleId: 'diagram-triplet',
        severity: 'warn',
        message: `다이어그램 '${d.id}' 에 원본 ASCII 보존 주석이 없다 (직접 설계한 다이어그램이면 정상)`,
      })
    }
  }
  return violations
}

// ---------------------------------------------------------------------------
// 규칙 5: eol — 개행·BOM
// ---------------------------------------------------------------------------

// STYLEGUIDE.md 7절의 "인코딩/개행" 규약은 코퍼스 245편에 국한되지 않는
// 저장소 전체의 파일 규약이다. 그래서 buildTree(assets/tools 제외)가 아니라
// node_modules/.git/tools/docs-studio/web/dist 만 제외한 별도 전수 순회를 쓴다.
const EOL_SKIP_DIRS = new Set(['.git', 'node_modules'])

async function collectAllMarkdown(dirAbs) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true })
  let out = []
  for (const e of entries) {
    if (EOL_SKIP_DIRS.has(e.name)) continue
    const abs = path.join(dirAbs, e.name)
    if (e.isDirectory()) {
      const rel = path.relative(REPO_ROOT, abs).split(path.sep).join('/')
      if (rel === 'tools/docs-studio/web/dist') continue
      out = out.concat(await collectAllMarkdown(abs))
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(abs)
    }
  }
  return out
}

function analyzeEol(raw) {
  const bom = raw.charCodeAt(0) === 0xfeff
  const body = bom ? raw.slice(1) : raw
  let crlf = 0
  let lone = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '\n') {
      if (i > 0 && body[i - 1] === '\r') crlf++
      else lone++
    }
  }
  const kind = crlf > 0 && lone > 0 ? 'mixed' : crlf > 0 ? 'crlf' : lone > 0 ? 'lf' : 'none'
  return { bom, kind }
}

async function checkEol() {
  const violations = []
  const files = await collectAllMarkdown(REPO_ROOT)
  for (const abs of files) {
    const repoPath = path.relative(REPO_ROOT, abs).split(path.sep).join('/')
    const buf = await fs.readFile(abs)
    const raw = buf.toString('utf8')
    const { bom, kind } = analyzeEol(raw)

    if (bom) {
      violations.push({ path: repoPath, line: 1, ruleId: 'eol', severity: 'error', message: 'UTF-8 BOM이 있다 — BOM 없이 저장해야 한다' })
    }
    if (kind === 'lf') {
      violations.push({ path: repoPath, line: 1, ruleId: 'eol', severity: 'error', message: '개행이 순수 LF다 — 저장소 규약은 CRLF' })
    } else if (kind === 'mixed') {
      violations.push({ path: repoPath, line: 1, ruleId: 'eol', severity: 'error', message: '개행이 CRLF와 LF로 섞여 있다 — CRLF로 통일해야 한다' })
    }
  }
  return violations
}

// ---------------------------------------------------------------------------
// 규칙 6: template — 개념 설명 문서 골격
// ---------------------------------------------------------------------------

function headingIncludes(headings, needle) {
  return headings.some((h) => h.text.includes(needle))
}

function checkTemplate(repoPath, maskedText) {
  const violations = []
  if (!isConceptDoc(repoPath) || isQnaDoc(repoPath)) return violations

  const headings = h2Headings(maskedText)

  const required = [
    { needle: '학습 목표', label: '학습 목표' },
    { needle: '선행 지식', label: '선행 지식' },
    { needle: '면접 포인트', label: '면접 포인트' },
    { needle: '자주 하는 실수', label: '자주 하는 실수' },
  ]
  for (const { needle, label } of required) {
    if (!headingIncludes(headings, needle)) {
      violations.push({
        path: repoPath,
        line: 1,
        ruleId: 'template',
        severity: 'error',
        message: `필수 절 '${label}' 에 해당하는 H2 헤딩이 없다`,
      })
    }
  }

  // '한 줄 정리' 또는 (숫자 접두 제외) 정확히 '정리' 인 마무리 절
  const hasWrapUp =
    headingIncludes(headings, '한 줄 정리') ||
    headings.some((h) => /^(\d+\.\s*)?정리$/.test(h.text.trim()))
  if (!hasWrapUp) {
    violations.push({
      path: repoPath,
      line: 1,
      ruleId: 'template',
      severity: 'error',
      message: "마무리 절('한 줄 정리' 또는 '정리')에 해당하는 H2 헤딩이 없다",
    })
  }

  // '연관 개념' / '함께 읽' / '다음 문서'
  const hasRelated =
    headingIncludes(headings, '연관 개념') ||
    headingIncludes(headings, '함께 읽') ||
    headingIncludes(headings, '다음 문서')
  if (!hasRelated) {
    violations.push({
      path: repoPath,
      line: 1,
      ruleId: 'template',
      severity: 'error',
      message: "'연관 개념'/'함께 읽'/'다음 문서'에 해당하는 절이 없다",
    })
  }

  // '왜 필요한가' — STYLEGUIDE.md 4.1: 절차 서술 문서는 생략 가능하므로 경고만.
  // 실제 문서는 "왜 필요한가"를 그대로 쓰기보다 "왜 계층으로 나눴나"처럼 주제에 맞춘
  // 표현을 쓰는 경우가 많아, '필요한가' 리터럴이 아니라 "N. 왜 ..." 형태(2번 절의
  // 관례적 위치)로 넓게 잡는다.
  const hasWhyNeeded = headings.some((h) => /^(\d+\.\s*)?왜\s/.test(h.text.trim()))
  if (!hasWhyNeeded) {
    violations.push({
      path: repoPath,
      line: 1,
      ruleId: 'template',
      severity: 'warn',
      message: "'왜 필요한가'에 해당하는 H2 헤딩이 없다 (절차 서술 문서는 생략 가능 — STYLEGUIDE.md 4.1)",
    })
  }

  return violations
}

// ---------------------------------------------------------------------------
// 실행
// ---------------------------------------------------------------------------

const docs = []
;(function walk(node) {
  for (const c of node.children) {
    if (c.type === 'doc') docs.push(c.path)
    else walk(c)
  }
})(await buildTree())

const all = []

for (const p of docs) {
  const { text } = await readDoc(p)
  const masked = maskFormattingArtifacts(text)

  all.push(...checkRegister(p, masked))
  all.push(...checkSpelling(p, masked))
  all.push(...checkTranslationese(p, masked))
  all.push(...checkDiagramTriplet(p, text)) // 원문 그대로 — parseDiagrams 가 자체적으로 안전하다
  all.push(...checkTemplate(p, masked))
}

all.push(...(await checkEol()))

// 파일 → 줄 순으로 정렬해야 사람이 훑기 좋다
all.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line)

for (const v of all) {
  console.log(`${v.path}:${v.line}  [${v.ruleId}]  ${v.message}`)
}

const errors = all.filter((v) => v.severity === 'error')
const warns = all.filter((v) => v.severity === 'warn')

// 위반이 0건인 규칙도 "실행은 됐고 위반이 없었다"를 보여주기 위해 0/0으로 미리 채운다.
const RULE_IDS = [
  'diagram-triplet',
  'eol',
  'register-plain-leak',
  'spelling',
  'template',
  'translationese',
]
const byRule = new Map(RULE_IDS.map((id) => [id, { error: 0, warn: 0 }]))
for (const v of all) {
  const rec = byRule.get(v.ruleId) || { error: 0, warn: 0 }
  rec[v.severity]++
  byRule.set(v.ruleId, rec)
}

console.log('')
console.log('규칙별 위반 수 (오류 / 경고)')
for (const [rule, rec] of [...byRule.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${rule.padEnd(16)} ${String(rec.error).padStart(4)} / ${String(rec.warn).padStart(4)}`)
}

console.log('')
console.log(`총 ${all.length}건 — 오류 ${errors.length}건, 경고 ${warns.length}건`)

if (errors.length > 0) {
  process.exit(1)
}
