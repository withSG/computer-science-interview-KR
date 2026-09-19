/**
 * 마크다운 블록 분할기와 산문 서명.
 *
 * 문서를 "고칠 수 있는 산문"과 "바이트 그대로 보존할 구조"로 가른다. 재작성 검사기
 * (scripts/check-rewrite.js)와 산문 추출기가 같은 기준을 써야 하므로 한 곳에 둔다.
 *
 * 블록 종류
 *   고정   comment · fence · heading · hr · table · checklist · image · html
 *   반쯤   list  — 항목 개수·마커·들여쓰기는 고정, 항목 안의 글은 자유
 *   자유   prose — 문단·인용문. 문단 경계는 덩어리 안에서 합치거나 쪼갤 수 있다
 *
 * 분류 순서가 중요하다. HTML 주석은 코드 펜스보다 먼저 본다 — 다이어그램 ASCII 보존
 * 주석 안에는 ``` 로 감싼 원본이 들어 있어서, 펜스를 먼저 토글하면 그 뒤 문서를
 * 통째로 삼킨다. 위에서 아래로 한 줄씩 훑으며 "여는 줄을 만난 블록이 닫는 줄까지
 * 통째로 먹는" 방식이라 이 순서가 자연히 지켜진다.
 *
 * 입력은 반드시 LF 로 정규화된 문자열이다 (server/eol.js 의 normalize).
 */

const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/
const COMMENT_OPEN_RE = /^\s*<!--/
const HEADING_RE = /^#{1,6}(\s|$)/
const HR_RE = /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/
const TABLE_RE = /^\s*\|/
const CHECK_RE = /^\s*[-*+] \[[ xX]\](\s|$)/
const IMAGE_RE = /^!\[.*\]\([^)]*\)\s*$/
const HTML_RE = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(\s|>|\/|$)/
const LIST_RE = /^(\s*)([-*+]|\d+[.)])(\s+)(.*)$/

const isBlank = (l) => l.trim() === ''

function fenceOpen(line) {
  const m = FENCE_RE.exec(line)
  if (!m) return null
  // 백틱 펜스의 정보 문자열에는 백틱이 들어갈 수 없다 — ```foo``` 같은 인라인은 펜스가 아니다
  if (m[2][0] === '`' && m[3].includes('`')) return null
  return { ch: m[2][0], len: m[2].length, info: m[3].trim() }
}

function isFenceClose(line, open) {
  const m = /^\s*(`{3,}|~{3,})\s*$/.exec(line)
  return !!m && m[1][0] === open.ch && m[1].length >= open.len
}

/** 산문·목록에 속하지 않는 "구조" 줄이면 그 종류를, 아니면 null. */
function structuralKind(line) {
  if (COMMENT_OPEN_RE.test(line)) return 'comment'
  if (fenceOpen(line)) return 'fence'
  if (HEADING_RE.test(line)) return 'heading'
  if (HR_RE.test(line)) return 'hr'
  if (TABLE_RE.test(line)) return 'table'
  if (CHECK_RE.test(line)) return 'checklist'
  if (IMAGE_RE.test(line)) return 'image'
  if (HTML_RE.test(line)) return 'html'
  return null
}

/**
 * @typedef {object} Block
 * @property {string} kind
 * @property {number} start  첫 줄(0부터)
 * @property {number} end    마지막 줄(포함)
 * @property {string[]} lines
 * @property {Array<{indent:string, marker:string}>} [items]  list 전용
 * @property {boolean} [unclosed]  comment·fence 가 닫히지 않은 채 끝남
 * @property {string} [info]  fence 전용 — 정보 문자열
 */

/** @returns {Block[]} */
export function segment(text) {
  const lines = text.split('\n')
  const n = lines.length
  const blocks = []
  let i = 0

  const push = (kind, start, end, extra = {}) => {
    blocks.push({ kind, start, end, lines: lines.slice(start, end + 1), ...extra })
  }

  while (i < n) {
    const line = lines[i]
    const kind = isBlank(line) ? null : structuralKind(line)

    if (kind === 'comment') {
      let j = i
      let closed = false
      const open = line.indexOf('<!--')
      if (line.indexOf('-->', open + 4) !== -1) closed = true
      else {
        for (j = i + 1; j < n; j++) {
          if (lines[j].includes('-->')) { closed = true; break }
        }
      }
      const end = closed ? (line.indexOf('-->', open + 4) !== -1 ? i : j) : n - 1
      push('comment', i, end, closed ? {} : { unclosed: true })
      i = end + 1
      continue
    }

    if (kind === 'fence') {
      const open = fenceOpen(line)
      let end = -1
      for (let j = i + 1; j < n; j++) {
        if (isFenceClose(lines[j], open)) { end = j; break }
      }
      if (end === -1) push('fence', i, n - 1, { unclosed: true, info: open.info })
      else push('fence', i, end, { info: open.info })
      i = (end === -1 ? n - 1 : end) + 1
      continue
    }

    if (kind === 'table' || kind === 'checklist') {
      let j = i
      while (j + 1 < n && !isBlank(lines[j + 1]) && structuralKind(lines[j + 1]) === kind) j++
      push(kind, i, j)
      i = j + 1
      continue
    }

    if (kind) {
      // heading · hr · image · html — 한 줄짜리
      push(kind, i, i)
      i++
      continue
    }

    // 여기부터는 구조 줄이 아니다: 목록이거나 산문(빈 줄 포함)
    if (!isBlank(line) && LIST_RE.test(line)) {
      const items = []
      let j = i
      let last = i
      while (j < n) {
        const l = lines[j]
        if (isBlank(l)) {
          let k = j + 1
          while (k < n && isBlank(lines[k])) k++
          if (k < n && !structuralKind(lines[k]) && (LIST_RE.test(lines[k]) || /^\s{2,}\S/.test(lines[k]))) {
            j = k
            continue
          }
          break
        }
        if (structuralKind(l)) break
        const m = LIST_RE.exec(l)
        if (m) items.push({ indent: m[1], marker: m[2] })
        // m 이 없으면 항목의 이어지는 줄(들여쓴 줄이거나 게으른 이어쓰기)이다
        last = j
        j++
      }
      push('list', i, last, { items })
      i = last + 1
      continue
    }

    // 산문: 구조 줄이나 목록 시작을 만날 때까지. 빈 줄은 그대로 삼킨다.
    let j = i
    while (j < n && (isBlank(lines[j]) || (!structuralKind(lines[j]) && !LIST_RE.test(lines[j])))) j++
    push('prose', i, j - 1)
    i = j
  }
  return blocks
}

// ---------------------------------------------------------------------------
// 펜스 안의 한국어 산문
// ---------------------------------------------------------------------------

const PROSE_FENCE_INFOS = new Set(['', 'text', 'txt', 'plaintext', 'markdown', 'md'])
const HANGUL_RE = /[가-힣]/g
const BOX_RE = /[─-▟]/

/** 펜스 본문 통계. 분류 기준을 눈으로 확인할 때도 쓴다. */
export function fenceStats(block) {
  const body = block.lines.slice(1, block.unclosed ? undefined : -1)
  const joined = body.join('\n')
  const compact = joined.replace(/\s+/g, '')
  const hangul = (compact.match(HANGUL_RE) || []).length
  const sentences = (joined.match(/[가-힣][.?]\s*(\n|$)/g) || []).length
  return {
    chars: compact.length,
    hangul,
    ratio: compact.length ? hangul / compact.length : 0,
    box: BOX_RE.test(joined),
    sentences,
    lines: body.length,
  }
}

/**
 * 코드가 아니라 한국어 문장이 들어 있는 펜스인가. 이런 펜스의 본문은 재작성 대상이다
 * (면접 답변 예시·자기소개 템플릿 등). 여는 줄과 닫는 줄은 여전히 고정이다.
 */
export function isProseFence(block) {
  if (block.kind !== 'fence' || block.unclosed) return false
  if (!PROSE_FENCE_INFOS.has(block.info.toLowerCase())) return false
  const s = fenceStats(block)
  if (s.box || s.chars < 40 || s.ratio < 0.45 || s.sentences < 1) return false
  // 글자 사이에 공백 3칸 이상이 끼면 열을 맞춘 표·정렬 텍스트다. 줄을 다시 짜면 정렬이 깨진다.
  if (/\S {3,}\S/.test(block.lines.slice(1, -1).join('\n'))) return false
  return true
}

// ---------------------------------------------------------------------------
// 블록의 "본문 글" 과 서명
// ---------------------------------------------------------------------------

/**
 * 재작성 대상 글을 뽑는다. 산문은 줄 그대로, 목록은 항목 마커를 뗀 글, 산문 펜스는
 * 여닫는 줄을 뺀 본문.
 */
export function bodyText(block, proseFence = false) {
  if (block.kind === 'prose') return block.lines.join('\n')
  if (block.kind === 'list') {
    return block.lines.map((l) => {
      const m = LIST_RE.exec(l)
      return m ? m[4] : l
    }).join('\n')
  }
  if (block.kind === 'fence' && proseFence) return block.lines.slice(1, -1).join('\n')
  return ''
}

/** 재작성 대상 블록인가 (산문·목록·산문 펜스). 글이 실제로 있어야 한다. */
export function isFree(block, proseFence = false) {
  if (block.kind === 'fence') return proseFence
  if (block.kind !== 'prose' && block.kind !== 'list') return false
  return block.lines.some((l) => !isBlank(l))
}

/**
 * 뼈대 토큰. 두 문서의 뼈대 배열이 같아야 "구조는 그대로"다.
 * 줄 수가 바뀌어도, 문단을 합쳐도 같다. 고정 블록은 원문 그대로, 자유 블록은 성격만.
 * @param {Set<number>|null} proseFenceIdx  fence 블록 중 산문 펜스인 것의 fence 순번.
 *   null 이면 isProseFence 로 직접 판정한다. after 쪽은 before 의 판정을 넘겨받아야
 *   한다 — 내용이 바뀌면 판정이 뒤집힐 수 있기 때문이다.
 */
export function skeletonEntries(blocks, proseFenceIdx = null) {
  const out = []
  let fenceNo = 0
  for (const b of blocks) {
    if (b.kind === 'fence') {
      const prose = proseFenceIdx ? proseFenceIdx.has(fenceNo) : isProseFence(b)
      fenceNo++
      if (prose) out.push({ block: b, token: `PROSEFENCE\0${b.lines[0]}\0${b.lines[b.lines.length - 1]}` })
      else out.push({ block: b, token: `fence\0${b.lines.join('\n')}` })
    } else if (b.kind === 'list') {
      out.push({ block: b, token: 'LIST\0' + b.items.map((it) => it.indent.length + it.marker).join(',') })
    } else if (b.kind === 'prose') {
      if (isFree(b)) out.push({ block: b, token: 'PROSE' })
    } else {
      out.push({ block: b, token: `${b.kind}\0${b.lines.join('\n')}` })
    }
  }
  return out
}

export function skeleton(blocks, proseFenceIdx = null) {
  return skeletonEntries(blocks, proseFenceIdx).map((e) => e.token)
}

/** before 문서에서 산문 펜스인 fence 의 순번 집합. */
export function proseFenceIndexes(blocks) {
  const set = new Set()
  let fenceNo = 0
  for (const b of blocks) {
    if (b.kind !== 'fence') continue
    if (isProseFence(b)) set.add(fenceNo)
    fenceNo++
  }
  return set
}

/** 스켈레톤과 같은 순서로, 자유 블록만 {block, text} 로 돌려준다. */
export function freeBlocks(blocks, proseFenceIdx = null) {
  const out = []
  let fenceNo = 0
  for (const b of blocks) {
    let pf = false
    if (b.kind === 'fence') {
      pf = proseFenceIdx ? proseFenceIdx.has(fenceNo) : isProseFence(b)
      fenceNo++
    }
    if (isFree(b, pf)) out.push({ block: b, text: bodyText(b, pf) })
  }
  return out
}

// ---------------------------------------------------------------------------
// 서명: 글이 바뀌어도 그대로여야 하는 것들
// ---------------------------------------------------------------------------

const CODE_SPAN_RE = /`[^`\n]*`/g
const LINK_DEST_RE = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const NUMBER_RE = /\d+(?:\.\d+)?/g
const LATIN_RE = /[A-Za-z_][A-Za-z0-9_.-]*/g
const BOLD_RE = /\*\*[^*\n]+?\*\*/g
const SYMBOLS = ['⭐', '✅', '❎']

function countMap(items) {
  const m = new Map()
  for (const x of items) m.set(x, (m.get(x) || 0) + 1)
  return m
}

/** 글 한 덩어리의 서명. */
export function signature(text) {
  const codeSpans = text.match(CODE_SPAN_RE) || []
  const links = [...text.matchAll(LINK_DEST_RE)].map((m) => m[1])
  // 코드 스팬과 링크 목적지는 위에서 따로 비교하므로, 숫자·영문 추출에서는 지운다
  const plain = text.replace(CODE_SPAN_RE, ' ').replace(LINK_DEST_RE, ']')
  const numbers = plain.match(NUMBER_RE) || []
  // 문장부호로 끝나는 토큰("Java.", "API-")의 후행 . - 는 토큰의 일부가 아니다
  const latin = (plain.match(LATIN_RE) || []).map((t) => t.replace(/[.-]+$/, '')).filter(Boolean)
  const symbols = {}
  for (const s of SYMBOLS) symbols[s] = text.split(s).length - 1
  return {
    numbers: countMap(numbers),
    latin: countMap(latin),
    codeSpans: countMap(codeSpans),
    links,
    symbols,
    bold: (text.match(BOLD_RE) || []).length,
    emDash: text.split('—').length - 1,
    chars: text.replace(/\s+/g, '').length,
  }
}

/** 두 Map(개수표)의 차이. 사라진 것·새로 생긴 것·개수만 달라진 것. */
export function diffCounts(a, b) {
  const gone = []
  const added = []
  const changed = []
  for (const [k, v] of a) {
    if (!b.has(k)) gone.push(k)
    else if (b.get(k) !== v) changed.push(`${k} ${v}→${b.get(k)}`)
  }
  for (const k of b.keys()) if (!a.has(k)) added.push(k)
  return { gone, added, changed, same: !gone.length && !added.length && !changed.length }
}

// ---------------------------------------------------------------------------
// 리듬 지표 (참고용)
// ---------------------------------------------------------------------------

/** 문장으로 자른다. 코드 스팬은 먼저 지워 그 안의 마침표에 속지 않는다. */
export function sentencesOf(paragraph) {
  const flat = paragraph.replace(CODE_SPAN_RE, 'X').replace(/\s+/g, ' ').trim()
  if (!flat) return []
  return flat.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean)
}

/** 산문 블록들의 문단·문장 길이 통계. */
export function rhythm(proseTexts) {
  const lens = []
  let paragraphs = 0
  let oneSentence = 0
  for (const text of proseTexts) {
    for (const para of text.split(/\n\s*\n/)) {
      const flat = para.replace(/^\s*>\s?/gm, '')
      const ss = sentencesOf(flat)
      if (!ss.length) continue
      paragraphs++
      if (ss.length === 1) oneSentence++
      for (const s of ss) lens.push(s.length) // 공백 포함 — sentencesOf 가 이미 공백을 하나로 접었다
    }
  }
  const n = lens.length
  const mean = n ? lens.reduce((a, b) => a + b, 0) / n : 0
  const sd = n ? Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / n) : 0
  return {
    sentences: n,
    paragraphs,
    cv: mean ? sd / mean : 0,
    short: n ? lens.filter((x) => x <= 25).length / n : 0,
    oneSentenceParas: paragraphs ? oneSentence / paragraphs : 0,
  }
}
