/**
 * 다이어그램 삽입 블록 파서.
 *
 * 저장소의 961개 삽입은 전부 아래 3부분 구조다.
 *
 *   <!-- diagram:sec-https-tls-1 -->
 *   ![1. 왜 필요한가](../assets/diagrams/sec-https-tls-1.svg)
 *
 *   <!-- 위 그림이 대체한 원본 ASCII.
 *        내용을 고칠 때는 그림도 함께 갱신할 것.
 *   ```
 *   ...원본...
 *   ```
 *   -->
 *
 * 세 번째 부분(ASCII 보존 주석)은 921건에만 있다. 나머지 40건은 직접 설계한
 * 다이어그램이라 대체한 ASCII 자체가 없거나, 본문 코드 펜스로 남아 있다.
 */

import path from 'node:path'

const MARKER_RE = /^<!--\s*diagram:([A-Za-z0-9_-]+)\s*-->\s*$/
// alt 안에 대괄호가 들어간 경우가 있다 (예: `![왜 [선택]이 가장 비싼가](...)`).
// greedy `.*` 로 마지막 `](` 까지 잡는다.
const IMAGE_RE = /^!\[(.*)\]\(([^)]+)\)\s*$/
// 919건은 `… ASCII.` 로 끝나지만, 2건은 괄호를 열어 주석 조기 종료를
// 피하는 방법을 적어둔다. 문장부호까지 묶지 않고 접두어만 본다.
const ASCII_OPEN_RE = /^<!--\s*위 그림이 대체한 원본 ASCII/
const COMMENT_CLOSE_RE = /^\s*-->\s*$/
const HEADING_RE = /^(#{1,6})\s+(.*)$/

/**
 * 문서의 모든 다이어그램 삽입을 찾는다.
 * @param {string} markdown 문서 원문
 * @param {string} docRepoPath 저장소 기준 문서 경로 (예: '08-security/03-https-tls.md')
 */
export function parseDiagrams(markdown, docRepoPath) {
  const lines = markdown.split('\n')
  const docDir = path.posix.dirname(docRepoPath)
  const out = []

  for (let i = 0; i < lines.length; i++) {
    const m = MARKER_RE.exec(lines[i])
    if (!m) continue
    const id = m[1]

    // 마커 다음의 첫 비어 있지 않은 줄이 이미지여야 한다
    let j = i + 1
    while (j < lines.length && lines[j].trim() === '') j++
    const img = j < lines.length ? IMAGE_RE.exec(lines[j]) : null
    if (!img) continue

    const [, alt, src] = img
    const svgRepoPath = path.posix.normalize(path.posix.join(docDir, src))

    const ascii = findAsciiComment(lines, j + 1)

    out.push({
      id,
      alt,
      src,
      svgRepoPath,
      markerLine: i,
      imageLine: j,
      ascii: ascii ? ascii.text : null,
      asciiRange: ascii ? [ascii.start, ascii.end] : null,
      section: sectionRangeAt(lines, i),
    })
  }
  return out
}

/**
 * 이미지 줄 다음에 오는 ASCII 보존 주석을 찾는다.
 * 사이에 빈 줄만 허용한다 — 본문이 끼어들면 그 이미지는 주석이 없는 것으로 본다.
 */
function findAsciiComment(lines, from) {
  let i = from
  while (i < lines.length && lines[i].trim() === '') i++
  if (i >= lines.length || !ASCII_OPEN_RE.test(lines[i])) return null

  const start = i
  let end = -1
  for (let k = i + 1; k < lines.length; k++) {
    if (COMMENT_CLOSE_RE.test(lines[k])) { end = k; break }
  }
  if (end === -1) return null

  // 주석 안의 코드 펜스 사이가 원본 ASCII 다
  const body = lines.slice(start + 1, end)
  const first = body.findIndex((l) => l.trimStart().startsWith('```'))
  if (first === -1) return { text: body.join('\n').trim(), start, end }
  let last = -1
  for (let k = body.length - 1; k > first; k--) {
    if (body[k].trimStart().startsWith('```')) { last = k; break }
  }
  const text = last === -1 ? body.slice(first + 1).join('\n') : body.slice(first + 1, last).join('\n')
  return { text, start, end }
}

/** 주어진 줄을 감싸는 섹션(가장 가까운 위쪽 heading ~ 같거나 상위 레벨 heading 직전) */
export function sectionRangeAt(lines, lineIdx) {
  let headingIdx = -1
  let level = 0
  for (let i = Math.min(lineIdx, lines.length - 1); i >= 0; i--) {
    const h = HEADING_RE.exec(lines[i])
    if (h) { headingIdx = i; level = h[1].length; break }
  }
  if (headingIdx === -1) return { start: 0, end: lines.length - 1, heading: null, level: 0 }

  let end = lines.length - 1
  for (let i = headingIdx + 1; i < lines.length; i++) {
    const h = HEADING_RE.exec(lines[i])
    if (h && h[1].length <= level) { end = i - 1; break }
  }
  return { start: headingIdx, end, heading: HEADING_RE.exec(lines[headingIdx])[2], level }
}

/**
 * 모델에 줄 문서 문맥. 다이어그램이 속한 섹션 본문에서
 * ASCII 보존 주석은 빼고(따로 주므로) 넘긴다. 너무 길면 앞뒤로 자른다.
 */
export function sectionContext(markdown, diagram, maxChars = 4000) {
  const lines = markdown.split('\n')
  const { start, end } = diagram.section
  const skip = diagram.asciiRange
  const kept = []
  for (let i = start; i <= end; i++) {
    if (skip && i >= skip[0] && i <= skip[1]) continue
    kept.push(lines[i])
  }
  const text = kept.join('\n').trim()
  if (text.length <= maxChars) return text
  const half = Math.floor(maxChars / 2)
  return text.slice(0, half) + '\n\n[…중략…]\n\n' + text.slice(-half)
}

/** 편집 금지 줄 집합 — 마커 줄, 이미지 줄, ASCII 보존 주석 전체 */
export function protectedLines(diagrams) {
  const set = new Set()
  for (const d of diagrams) {
    set.add(d.markerLine)
    set.add(d.imageLine)
    if (d.asciiRange) {
      for (let i = d.asciiRange[0]; i <= d.asciiRange[1]; i++) set.add(i)
    }
  }
  return set
}
