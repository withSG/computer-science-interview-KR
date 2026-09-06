/**
 * 쓰기 전 검증. Fail-closed — 하나라도 걸리면 파일에 쓰지 않는다.
 *
 * 즉시 저장 방식이라 이 파일이 마지막 방어선이다. 여기서 막지 못한 것은
 * 되돌리기와 git 만 남는다.
 */

import path from 'node:path'
import { DOMParser } from '@xmldom/xmldom'
import MarkdownIt from 'markdown-it'
import { existsInRepo } from './docs.js'

// ─────────────────────────────────────────────────────────── SVG

/** GitHub 이 걸러내는 것들. 하나라도 있으면 저장소에서 그림이 깨진다. */
const FORBIDDEN_TAGS = new Set([
  'script', 'foreignobject', 'style', 'image', 'iframe', 'a',
  'animate', 'animatemotion', 'animatetransform', 'set', 'handler',
])

const HOUSE_WIDTH = 880

export function validateSvg(svg) {
  const errors = []
  const warnings = []
  const src = String(svg || '')

  if (src.length < 200) errors.push('SVG 가 너무 짧다 — 잘렸을 가능성이 높다')
  if (src.length > 200_000) {
    // 이 크기는 파싱 자체가 낭비다. 나머지 검사는 건너뛴다.
    errors.push('SVG 가 200 KB 를 넘는다')
    return { ok: false, errors, warnings }
  }

  // --- XML 파싱 ---
  const problems = []
  const parser = new DOMParser({
    onError: (level, msg) => {
      if (level === 'error' || level === 'fatalError') problems.push(msg)
    },
  })

  let doc
  try {
    doc = parser.parseFromString(src, 'image/svg+xml')
  } catch (err) {
    return { ok: false, errors: [`XML 파싱 실패: ${err.message}`], warnings }
  }
  if (problems.length) {
    errors.push(`XML 이 올바르지 않다: ${problems.slice(0, 3).join(' / ')}`)
  }

  const root = doc.documentElement
  if (!root || root.nodeName.toLowerCase() !== 'svg') {
    errors.push('루트 요소가 <svg> 가 아니다')
    return { ok: false, errors, warnings }
  }
  if (root.getAttribute('xmlns') !== 'http://www.w3.org/2000/svg') {
    errors.push('루트에 SVG 네임스페이스(xmlns)가 없다')
  }

  // --- viewBox: 이 저장소는 폭이 예외 없이 880 이다 ---
  const vb = (root.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number)
  if (vb.length !== 4 || vb.some((n) => !Number.isFinite(n))) {
    errors.push('viewBox 가 없거나 숫자 4개가 아니다')
  } else {
    const [minX, minY, w, h] = vb
    if (minX !== 0 || minY !== 0) errors.push(`viewBox 는 "0 0 ..." 으로 시작해야 한다 (지금: ${vb.join(' ')})`)
    if (w !== HOUSE_WIDTH) errors.push(`viewBox 폭은 ${HOUSE_WIDTH} 여야 한다 (지금: ${w})`)
    if (!(h > 0)) errors.push('viewBox 높이가 0 이하다')

    const aw = root.getAttribute('width')
    const ah = root.getAttribute('height')
    if (aw != null && Number(aw) !== w) warnings.push(`width 속성(${aw})이 viewBox 폭(${w})과 다르다`)
    if (ah != null && Number(ah) !== h) warnings.push(`height 속성(${ah})이 viewBox 높이(${h})와 다르다`)

    checkGeometry(root, w, h, warnings)
  }

  // --- 한글 폰트 폴백 ---
  const ff = root.getAttribute('font-family') || ''
  if (!/Malgun Gothic|Apple SD Gothic Neo|Noto Sans KR/.test(ff)) {
    errors.push('루트에 한글 폰트 폴백(font-family)이 없다 — 다른 환경에서 글자가 깨진다')
  }

  // --- 요소·속성 화이트리스트 ---
  const ids = new Set()
  let hasTitle = false
  let hasDesc = false
  let hasBackground = false

  walk(root, (el) => {
    const tag = el.nodeName.toLowerCase()
    if (FORBIDDEN_TAGS.has(tag)) {
      errors.push(`<${tag}> 은 쓸 수 없다 — GitHub 이 걸러낸다`)
    }
    if (tag === 'title' && text(el).trim()) hasTitle = true
    if (tag === 'desc' && text(el).trim()) hasDesc = true

    const attrs = el.attributes || []
    for (let i = 0; i < attrs.length; i++) {
      const name = attrs[i].name
      const value = attrs[i].value || ''
      const ln = name.toLowerCase()
      if (ln === 'id') ids.add(value)
      if (ln.startsWith('on')) errors.push(`이벤트 핸들러 속성 ${name} 은 쓸 수 없다`)
      if (/javascript:/i.test(value)) errors.push(`${name} 에 javascript: 가 있다`)
      if (/@import/i.test(value)) errors.push(`${name} 에 @import 가 있다`)
      if (/url\(\s*['"]?https?:/i.test(value)) errors.push(`${name} 이 외부 리소스를 참조한다`)
      if ((ln === 'href' || ln === 'xlink:href') && /^https?:/i.test(value)) {
        errors.push(`${name} 이 외부 URL 을 가리킨다`)
      }
    }

    // 전면 흰 배경 — 없으면 다크 테마에서 글자가 사라진다
    if (tag === 'rect' && (el.getAttribute('fill') || '').toLowerCase() === '#ffffff') {
      const rw = Number(el.getAttribute('width'))
      const rh = Number(el.getAttribute('height'))
      const rx = Number(el.getAttribute('x') || 0)
      const ry = Number(el.getAttribute('y') || 0)
      if (rx === 0 && ry === 0 && rw >= HOUSE_WIDTH * 0.99 && rh > 0) hasBackground = true
    }
  })

  if (!hasTitle) errors.push('<title> 이 없거나 비어 있다')
  if (!hasDesc) errors.push('<desc> 가 없거나 비어 있다')
  if (!hasBackground) errors.push('전면 흰 배경 <rect fill="#ffffff"> 가 없다 — 다크 테마에서 글자가 사라진다')

  const labelled = (root.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean)
  for (const ref of labelled) {
    if (!ids.has(ref)) errors.push(`aria-labelledby 가 없는 id "${ref}" 를 가리킨다`)
  }

  return { ok: errors.length === 0, errors, warnings }
}

/** 좌표 기하 검사 — 글자·도형이 캔버스를 벗어나는지 */
function checkGeometry(root, w, h, warnings) {
  let outside = 0
  walk(root, (el) => {
    const tag = el.nodeName.toLowerCase()
    if (tag !== 'text' && tag !== 'rect' && tag !== 'circle') return
    const x = Number(el.getAttribute('x'))
    const y = Number(el.getAttribute('y'))
    if (Number.isFinite(x) && (x < -8 || x > w + 8)) outside++
    else if (Number.isFinite(y) && (y < -8 || y > h + 8)) outside++
  })
  if (outside > 0) {
    warnings.push(`캔버스를 벗어난 요소가 ${outside}개 있다 — 잘려 보일 수 있다`)
  }
}

function walk(node, fn) {
  if (node.nodeType === 1) fn(node)
  let c = node.firstChild
  while (c) {
    walk(c, fn)
    c = c.nextSibling
  }
}

function text(el) {
  let out = ''
  let c = el.firstChild
  while (c) {
    if (c.nodeType === 3 || c.nodeType === 4) out += c.nodeValue
    c = c.nextSibling
  }
  return out
}

/**
 * 모델 응답에서 SVG 만 뽑아낸다.
 * 펜스 휴리스틱을 쓰지 않고 첫 `<svg` 부터 마지막 `</svg>` 까지 잘라낸다 — 이쪽이 훨씬 튼튼하다.
 */
export function extractSvg(raw) {
  const s = String(raw || '')
  const start = s.indexOf('<svg')
  const end = s.lastIndexOf('</svg>')
  if (start === -1 || end === -1 || end < start) return null
  return s.slice(start, end + '</svg>'.length).trim()
}

// ─────────────────────────────────────────────────────── 마크다운

const mdParser = new MarkdownIt({ html: true, linkify: false, typographer: false })

const FENCE_RE = /^\s{0,3}(```|~~~)/
const DIAGRAM_MARKER_RE = /^<!--\s*diagram:([A-Za-z0-9_-]+)\s*-->\s*$/
const IMAGE_RE = /^!\[(.*)\]\(([^)]+)\)\s*$/

/**
 * 편집을 반영한 문서 전체를 검사한다. 바뀐 구간만이 아니라 파일 전체를 본다 —
 * splice 하나가 나머지 문서 전체의 파싱을 뒤집는 게 이 코퍼스의 전형적 실패다.
 *
 * @param {string} before 편집 전 전문 (LF)
 * @param {string} after  편집 후 전문 (LF)
 * @param {string} docPath
 * @param {[number, number]} editedRange 편집한 줄 범위 (before 기준, 양끝 포함)
 */
export function validateMarkdown(before, after, docPath, editedRange) {
  const errors = []
  const warnings = []

  const b = countStructures(before)
  const a = countStructures(after)

  // --- 코드 펜스 ---
  if (a.fences % 2 !== 0) {
    errors.push(`코드 펜스가 홀수(${a.fences})다 — 문서 나머지가 통째로 코드 블록이 된다`)
  }
  if (a.fences !== b.fences) {
    warnings.push(`코드 펜스 개수가 ${b.fences} → ${a.fences} 로 바뀌었다`)
  }

  // --- HTML 주석 ---
  // 이 저장소에서 가장 위험한 지점. 주석이 어긋나면 GitHub 에서만 조용히 깨진다.
  if (a.commentOpen !== a.commentClose) {
    errors.push(`HTML 주석 짝이 안 맞는다 (여는 것 ${a.commentOpen}, 닫는 것 ${a.commentClose})`)
  }
  if (a.commentOpen !== b.commentOpen || a.commentClose !== b.commentClose) {
    errors.push(
      `HTML 주석 개수가 바뀌었다 (${b.commentOpen}/${b.commentClose} → ${a.commentOpen}/${a.commentClose}) — ` +
        '보존된 원본 ASCII 가 본문으로 샐 수 있다',
    )
  }

  // --- 다이어그램 앵커 ---
  const bj = JSON.stringify(b.anchors)
  const aj = JSON.stringify(a.anchors)
  if (bj !== aj) {
    errors.push('다이어그램 앵커(마커 id + 이미지 경로)가 바뀌었다')
  }

  // --- 링크 ---
  for (const href of a.links) {
    if (b.links.includes(href)) continue
    const target = resolveRel(docPath, href.split('#')[0])
    if (!target) {
      errors.push(`새로 생긴 링크가 저장소 밖을 가리킨다: ${href}`)
    } else if (!existsInRepo(target) && !existsInRepo(path.posix.join(target, 'README.md'))) {
      errors.push(`새로 생긴 링크가 없는 파일을 가리킨다: ${href}`)
    }
  }

  // --- 구조 재파싱: 편집 구간 바깥의 블록 구조가 그대로인지 ---
  const tailBefore = blockTail(before, editedRange[1])
  const delta = after.split('\n').length - before.split('\n').length
  const tailAfter = blockTail(after, editedRange[1] + delta)
  if (tailBefore.join('|') !== tailAfter.join('|')) {
    errors.push('편집 구간 뒤쪽 문서 구조가 달라졌다 — splice 가 나머지 문서의 파싱을 바꿨다')
  }

  return { ok: errors.length === 0, errors, warnings }
}

function countStructures(text) {
  const lines = text.split('\n')
  let fences = 0
  const anchors = []
  const links = []

  lines.forEach((l, i) => {
    if (FENCE_RE.test(l)) fences++
    const m = DIAGRAM_MARKER_RE.exec(l)
    if (m) {
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++
      const img = j < lines.length ? IMAGE_RE.exec(lines[j]) : null
      anchors.push([m[1], img ? img[2] : null])
    }
  })

  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = m[1]
    if (!/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#')) links.push(href)
  }

  return {
    fences,
    commentOpen: (text.match(/<!--/g) || []).length,
    commentClose: (text.match(/-->/g) || []).length,
    anchors,
    links,
  }
}

/** 주어진 줄 이후에 나오는 블록 토큰 타입 순서 */
function blockTail(text, afterLine) {
  return mdParser
    .parse(text, {})
    .filter((t) => t.map && t.map[0] > afterLine && t.type !== 'inline')
    .map((t) => t.type)
}

function resolveRel(docPath, rel) {
  if (!rel) return null
  try {
    const joined = path.posix.normalize(path.posix.join(path.posix.dirname(docPath), rel))
    return joined.startsWith('..') ? null : joined.replace(/\/$/, '')
  } catch {
    return null
  }
}

/**
 * 모델 응답에서 마크다운 교체본만 뽑아낸다.
 * 응답 전체가 하나의 펜스일 때만 벗겨낸다 — 과하게 벗기면 내용을 조용히 먹는다.
 */
export function extractMarkdown(raw, originalWasFence = false) {
  let s = String(raw || '').replace(/\r\n/g, '\n').trim()
  if (originalWasFence) return s

  const whole = /^(```|~~~)[^\n]*\n([\s\S]*?)\n?\1\s*$/.exec(s)
  if (whole) return whole[2]

  // "다음은 …입니다:" 류의 서두 한 줄 + 빈 줄이 붙은 경우만 걷어낸다
  const preamble = /^(?:다음은|아래는|수정한|Here(?:'s| is)|Sure)[^\n]{0,120}[:：]\s*\n\n/i
  if (preamble.test(s)) s = s.replace(preamble, '')

  return s.trim()
}
