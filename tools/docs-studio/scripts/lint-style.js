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
 * `99-practical-interview/`의 개념 문서(01~03) 셋은 「면접 포인트」의 'A.' 단락이
 * 다른 개념 문서들과 다른 장르다. 이 폴더 자체가 "면접을 어떻게 준비하는가"를
 * 다루므로, 'A.'는 소리 내어 말할 모범 답변이 아니라 답변을 어떻게 구성할지
 * 설명하는 3인칭 코칭 조언이다 (예: "강점 한 단어 + 그것을 증명하는 구체 사례
 * 순서로 답한다"). 실제로 소리 내어 말할 예시 문장은 그 안에 인용부호로 삽입되어
 * 있고, 그 인용된 부분은 이미 합니다체로 올바르게 쓰여 있으며 `maskQuotedSpans`가
 * 정확히 걸러낸다. 따라서 코칭 조언 문장 자체까지 합니다체로 바꾸면 오히려 어색해져,
 * register-plain-leak 검사에서 이 폴더의 개념 문서만 예외로 둔다.
 */
function isCoachingAdviceDoc(repoPath) {
  return repoPath.startsWith('99-practical-interview/')
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

/**
 * 펜스 코드 블록과 HTML 주석(다이어그램 마커·ASCII 보존 주석 포함)의 내용을
 * 공백으로 지운다. 줄 수·줄바꿈은 그대로 두므로 이후 어떤 검사도 줄 번호가
 * 틀어지지 않는다. register/spelling/translationese/template 이 공통으로
 * 쓰는 전처리 — 코드 예시나 주석 속 텍스트를 본문 위반으로 잘못 잡는 것을
 * 막는다.
 */
function maskFormattingArtifacts(text) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')

  // 1) HTML 주석. 코드 펜스보다 먼저 지운다 — ASCII 보존 주석 안에는 ``` 로
  //    감싼 원본 ASCII 가 들어있는데, 이걸 먼저 지워둬야 아래 펜스 검사가
  //    주석 속 ``` 를 진짜 펜스로 착각해 뒤쪽 내용까지 통째로 지우는 사고를
  //    막을 수 있다.
  let masked = text.replace(/<!--[\s\S]*?-->/g, blank)

  // 2) 펜스 코드 블록 (```lang ... ```)
  masked = masked.replace(/^([ \t]*```[^\n]*)\n([\s\S]*?)\n([ \t]*```[ \t]*)$/gm, (_m, open, body, close) => {
    return blank(open) + '\n' + blank(body) + '\n' + blank(close)
  })

  return masked
}

/** 한 줄 안의 인라인 코드 스팬(`...`)을 지운다. */
function stripInlineCode(line) {
  return line.replace(/`[^`\n]*`/g, '')
}

/** 표 구분선(`|---|---|`)이나 빈 인용부호(`>`) 만 있는 줄 — 검사할 내용이 없다. */
function isPureFormattingLine(line) {
  if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line) && /[-|]/.test(line)) return true
  if (/^\s*>\s*$/.test(line)) return true
  return false
}

/**
 * 마크다운 인용문(`>` 프리픽스, 중첩 인용 `>>` 포함) 줄인가.
 * 이 코퍼스는 "좋은 답변" 같은 모범 답변 예시를 문장 따옴표 대신 `>` 인용 블록으로
 * 옮기는 관례를 쓴다(예: STAR [S]/[T]/[A]/[R] 블록) — 다른 화자의 말을 그대로
 * 옮긴다는 점에서 `"..."`/`「...」` 로 감싼 인용과 의도가 같으므로 register-polite-leak
 * 에서 같은 취급을 한다.
 */
function isBlockquoteLine(line) {
  return /^\s{0,3}>+\s/.test(line) || /^\s{0,3}>+$/.test(line)
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
// 규칙 1: register — 합니다체 구역 판정 (양방향)
// ---------------------------------------------------------------------------
//
// STYLEGUIDE.md 1절은 두 방향을 모두 규정한다.
//   - register-polite-leak: '면접 포인트' 밖에서 합니다체(습니다/입니다/합니다/됩니다).
//     단, 다른 화자의 말을 그대로 옮긴 인용(따옴표로 감싸거나 '라고/라는/라며'로
//     이어지는 자리, 또는 `>` 인용 블록으로 옮긴 모범 답변 예시)은 문서 자신의
//     목소리가 아니므로 대상에서 뺀다 — "자주 하는
//     실수"/"실무에서는" 절이 안티패턴 예시("MongoDB는 CP입니다"라고 단정...)를
//     인용하는 관용구가 매우 흔해서, 이걸 빼지 않으면 진짜 위반이 묻힌다.
//   - register-plain-leak : '면접 포인트' 안, 그중에서도 'A. ...' 모범 답변 문단
//                            안에서 한다체(다다/이다/한다/된다/있다/없다/아니다/같다)
//     "- 꼬리 질문: ... → ... 답한다." 같은 해설 불릿은 모범 답변이 아니라 저자의
//     설명이므로(문서 본문과 같은 한다체가 정상) 검사 대상에서 제외한다 — 'A.' 로
//     시작해 다음 빈 줄/불릿/'Q.'/헤딩 전까지만 "답변 문단"으로 본다.

const POLITE_RE = /(습니다|입니다|합니다|됩니다)/
const PLAIN_ENDING_RE = /(다다|이다|한다|된다|있다|없다|아니다|같다)\./
const QUOTATIVE_AFTER_RE = /^["'」』)]{0,2}\s*(라고|라는|라며)/

/** 인용부(" ... ", 「...」, 『...』)를 통째로 지운다 — 다른 화자의 말을 옮긴 자리는
 *  register 두 규칙 모두에서 "문서 자신의 목소리"로 보지 않는다. */
function maskQuotedSpans(text) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  return text
    .replace(/"[\s\S]*?"/g, blank)
    .replace(/「[\s\S]*?」/g, blank)
    .replace(/『[\s\S]*?』/g, blank)
}

function checkRegister(repoPath, maskedText) {
  const violations = []
  if (!isConceptDoc(repoPath)) return violations // qna-*.md 전체 면제, README.md 대상 아님

  const lines = maskedText.split('\n')
  const quoteLines = maskQuotedSpans(maskedText).split('\n')
  let inInterviewSection = false // '## N. 면접 포인트' 구역 안인가
  let inAnswerParagraph = false // 'A. ...' 모범 답변 문단 안인가

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const h = HEADING_RE.exec(line)
    if (h && h[1].length === 2) {
      inInterviewSection = h[2].includes('면접 포인트')
      inAnswerParagraph = false
      continue // 헤딩 줄 자체는 검사하지 않는다
    }

    if (!inInterviewSection) {
      if (isPureFormattingLine(line)) continue
      // `>` 인용 블록 — 문장부호 인용과 같은 취급으로 register-polite-leak 대상에서 뺀다.
      if (isBlockquoteLine(line)) continue
      // 인용부를 지운 텍스트에서 찾는다 — 인용된 합니다체는 이미 여기서 사라진다.
      const stripped = stripInlineCode(quoteLines[i])
      const m = POLITE_RE.exec(stripped)
      if (m) {
        // 따옴표 없이 그대로 옮긴 인용도 있다 — 어미 바로 뒤가 '라고/라는/라며'면
        // 인용으로 보고 넘어간다.
        const after = stripped.slice(m.index + m[0].length, m.index + m[0].length + 6)
        if (!QUOTATIVE_AFTER_RE.test(after)) {
          violations.push({
            path: repoPath,
            line: i + 1,
            ruleId: 'register-polite-leak',
            severity: 'error',
            message: `'면접 포인트' 구역 밖에서 합니다체가 쓰였다: "${stripInlineCode(line).trim().slice(0, 60)}"`,
          })
        }
      }
      continue
    }

    // '면접 포인트' 구역 안 — 'A.' 답변 문단의 경계를 추적한다
    const trimmed = line.trim()
    if (trimmed === '' || /^-\s/.test(trimmed) || /^\*?\*?Q[.:]/.test(trimmed)) {
      inAnswerParagraph = false
    }
    if (/^A\.\s/.test(trimmed)) {
      inAnswerParagraph = true
    }
    if (!inAnswerParagraph) continue
    if (isCoachingAdviceDoc(repoPath)) continue // 코칭 조언 장르 — 위 설명 참고

    const stripped = stripInlineCode(quoteLines[i])
    if (PLAIN_ENDING_RE.test(stripped)) {
      violations.push({
        path: repoPath,
        line: i + 1,
        ruleId: 'register-plain-leak',
        severity: 'error',
        message: `'면접 포인트' 답변 문단 안에서 한다체가 쓰였다: "${stripped.trim().slice(0, 60)}"`,
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
  'register-polite-leak',
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
