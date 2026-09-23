/**
 * 코퍼스 전수 검사.
 *
 * 뷰어가 246개 문서를 하나도 빠짐없이, 하나도 망가뜨리지 않고 렌더하는지 본다.
 * 계획서의 "검증 방법 1·2"에 해당한다. `npm run check` 로 돌린다.
 */

import path from 'node:path'
import { buildTree, readDoc, existsInRepo } from '../server/docs.js'
import { renderMarkdown, internalLinks, outline } from '../server/render.js'
import { parseDiagrams } from '../server/diagram.js'

const EXPECT = { docs: 246, diagrams: 961, ascii: 921 }

const docs = []
;(function walk(node) {
  for (const c of node.children) {
    if (c.type === 'doc') docs.push(c.path)
    else walk(c)
  }
})(await buildTree())

const fail = []
const warn = []
let diagrams = 0
let ascii = 0
let links = 0
let brokenLinks = 0
let inlinedSvg = 0

for (const p of docs) {
  const { text } = await readDoc(p)
  const lines = text.split('\n')

  // --- 다이어그램 파싱 ---
  const ds = parseDiagrams(text, p)
  diagrams += ds.length
  for (const d of ds) {
    if (d.ascii) ascii++
    if (!existsInRepo(d.svgRepoPath)) fail.push(`${p}: 없는 SVG 참조 ${d.svgRepoPath}`)
    // 마커 id 와 이미지 파일명이 같아야 한다. parseDiagrams 는 둘을 별개 필드로만
    // 들고 있고, render.js 는 이미지 파일명에서 자기 id 를 따로 뽑아 쓰므로 둘이
    // 어긋나도 렌더는 조용히 성공한다.
    const imgBase = path.posix.basename(d.src)
    const imgId = imgBase.endsWith('.svg') ? imgBase.slice(0, -4) : imgBase
    if (imgId !== d.id) fail.push(`${p}: 마커 id '${d.id}' 와 이미지 파일명 '${imgId}' 가 다르다`)
  }

  // --- 렌더 ---
  let html
  try {
    html = renderMarkdown(text, p)
  } catch (err) {
    fail.push(`${p}: 렌더 예외 — ${err.message}`)
    continue
  }

  // 원본 ASCII 가 본문으로 새면 안 된다.
  // 주석 여는 문장이 화면에 남았다는 것은 주석이 통째로 흘렀다는 뜻이다.
  if (html.includes('위 그림이 대체한 원본 ASCII')) {
    fail.push(`${p}: 보존용 ASCII 주석이 본문으로 샜다`)
  }
  // 마커 주석도 마찬가지
  if (/<!--\s*diagram:/.test(html)) {
    fail.push(`${p}: diagram 마커가 본문으로 샜다`)
  }

  // 모든 그림이 인라인 SVG 로 바뀌었는지
  const figures = html.match(/<figure class="diagram"/g) || []
  inlinedSvg += figures.length
  if (figures.length !== ds.length) {
    fail.push(`${p}: 그림 ${ds.length}개 중 ${figures.length}개만 인라인됨`)
  }
  if (html.includes('diagram-missing')) {
    fail.push(`${p}: 인라인 실패한 그림이 있다`)
  }

  // --- 내부 링크 ---
  for (const l of internalLinks(text, p)) {
    links++
    if (!l.target) {
      brokenLinks++
      fail.push(`${p}: 저장소 밖을 가리키는 링크 ${l.href}`)
      continue
    }
    const candidates = [l.target, `${l.target}/README.md`]
    if (!candidates.some(existsInRepo)) {
      brokenLinks++
      fail.push(`${p}: 깨진 내부 링크 ${l.href} -> ${l.target}`)
    }
  }

  // --- 줄 범위 왕복 검사 ---
  // data-src-start/end 가 가리키는 줄이 실제로 문서 안에 있는지, 역전되지 않았는지
  const re = /data-src-start="(\d+)" data-src-end="(\d+)"/g
  let m
  while ((m = re.exec(html)) !== null) {
    const s = Number(m[1])
    const e = Number(m[2])
    if (s > e) fail.push(`${p}: 줄 범위 역전 ${s}-${e}`)
    if (e >= lines.length) fail.push(`${p}: 줄 범위가 문서를 벗어남 ${s}-${e} / ${lines.length}줄`)
  }

  if (outline(text).length === 0) warn.push(`${p}: heading 이 하나도 없다`)
}

const counts = [
  ['문서', docs.length, EXPECT.docs],
  ['다이어그램', diagrams, EXPECT.diagrams],
  ['인라인된 SVG', inlinedSvg, EXPECT.diagrams],
  ['ASCII 보존 주석', ascii, EXPECT.ascii],
]

console.log('')
for (const [label, got, want] of counts) {
  const ok = got === want
  console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(16)} ${String(got).padStart(5)} / ${want}`)
  if (!ok) fail.push(`${label} 개수 불일치: ${got} != ${want}`)
}
console.log(`  ${brokenLinks === 0 ? '✓' : '✗'} ${'내부 링크'.padEnd(16)} ${String(links).padStart(5)} 개 중 깨진 것 ${brokenLinks}`)

if (warn.length) {
  console.log(`\n경고 ${warn.length}건`)
  for (const w of warn.slice(0, 10)) console.log('  · ' + w)
}

if (fail.length) {
  console.log(`\n실패 ${fail.length}건`)
  for (const f of fail.slice(0, 40)) console.log('  ✗ ' + f)
  if (fail.length > 40) console.log(`  … 외 ${fail.length - 40}건`)
  process.exit(1)
}

console.log('\n문제 0건.\n')
