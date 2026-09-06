import fss from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { resolveInRepo, REPO_ROOT } from './config.js'
import { normalize } from './eol.js'
import { inlineSvg } from './svgtool.js'

/**
 * markdown-it 설정 — 이 저장소에 맞춘 세 가지 결정
 *
 *  html: true         본문이 HTML 주석과 <br> 을 쓴다. 로컬 전용이라 sanitize 하지 않는다.
 *  linkify: false     맨 URL 을 자동 링크로 바꾸면 원문에 없던 <a> 가 생겨
 *                     렌더 텍스트와 원문의 대응이 흐트러진다.
 *  typographer: false 따옴표·대시를 예쁘게 바꾸면 원문 문자가 달라진다. 편집기에서는 독이다.
 */
const md = new MarkdownIt({ html: true, linkify: false, typographer: false, breaks: false })

const ASCII_COMMENT_RE = /^<!--\s*위 그림이 대체한 원본 ASCII/
const DIAGRAM_MARKER_RE = /^<!--\s*diagram:([A-Za-z0-9_-]+)\s*-->/

/** 모든 블록 토큰에 원문 줄 범위를 심는다. 이게 선택 → 원문 매핑의 뿌리다. */
md.core.ruler.push('src_map', (state) => {
  for (const t of state.tokens) annotate(t)

  function annotate(t) {
    if (t.map && t.type !== 'inline') {
      // token.map 은 [시작, 끝) — 끝이 배타적이라 1을 빼서 포함 범위로 심는다
      t.attrSet('data-src-start', String(t.map[0]))
      t.attrSet('data-src-end', String(Math.max(t.map[0], t.map[1] - 1)))
    }
    if (t.children) for (const c of t.children) annotate(c)
  }
})

/**
 * GFM 체크리스트(`- [ ]`, `- [x]`)를 진짜 체크박스로 낸다.
 *
 * 이 저장소의 README 들은 학습 진도를 이 문법으로 관리한다. 글자 그대로 `[ ]` 로
 * 보이면 읽기가 나쁘다. 다만 **체크는 파일에 쓰지 않는다** — 개인의 진도라
 * 브라우저 localStorage 에만 남긴다. 그래서 여기서는 상태를 저장할 열쇠만 심어준다.
 *
 * 열쇠는 줄 번호가 아니라 항목 글자의 해시다. 문서가 편집돼 줄이 밀려도
 * 체크가 엉뚱한 항목으로 옮겨가지 않는다. 다만 같은 이름의 항목이 한 문서에
 * 여러 번 나오므로(루트 README 에만 40건) 등장 순서를 뒤에 붙여 구분한다.
 */
md.core.ruler.after('inline', 'task_lists', (state) => {
  const tokens = state.tokens
  const seen = new Map()

  for (let i = 2; i < tokens.length; i++) {
    if (tokens[i].type !== 'inline') continue
    if (tokens[i - 1].type !== 'paragraph_open') continue
    const li = tokens[i - 2]
    if (li.type !== 'list_item_open') continue

    const first = tokens[i].children?.[0]
    if (!first || first.type !== 'text') continue
    const m = /^\[([ xX])\]\s+/.exec(first.content)
    if (!m) continue

    const checked = m[1] !== ' '
    first.content = first.content.slice(m[0].length)
    const label = tokens[i].content.slice(m[0].length)

    const base = taskKey(label)
    const nth = (seen.get(base) ?? 0) + 1
    seen.set(base, nth)
    const key = nth === 1 ? base : `${base}.${nth}`

    const box = new state.Token('html_inline', '', 0)
    box.content =
      `<input type="checkbox" class="task" data-task-key="${key}"` +
      `${checked ? ' checked' : ''} data-nomap="1">`
    tokens[i].children.unshift(box)
    li.attrJoin('class', 'task-item')
  }
})

/** 항목 글자로부터 만드는 짧고 안정적인 열쇠 (FNV-1a) */
function taskKey(label) {
  let h = 0x811c9dc5
  const s = label.trim()
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}

/** 렌더러 규칙이 attrs 를 안 쓰는 토큰들은 감싸서 줄 범위를 남긴다 */
function wrapWithSrc(defaultRender) {
  return (tokens, idx, options, env, self) => {
    const t = tokens[idx]
    const html = defaultRender(tokens, idx, options, env, self)
    if (!t.map) return html
    const s = t.attrGet('data-src-start')
    const e = t.attrGet('data-src-end')
    return `<div class="blk" data-src-start="${s}" data-src-end="${e}">${html}</div>`
  }
}

const defFence = md.renderer.rules.fence
md.renderer.rules.fence = wrapWithSrc(defFence)

const defCode = md.renderer.rules.code_block
md.renderer.rules.code_block = wrapWithSrc(defCode)

md.renderer.rules.hr = wrapWithSrc((tokens, idx, options, _env, self) =>
  self.renderToken(tokens, idx, options),
)

/**
 * 원시 HTML 블록.
 *
 * ASCII 보존 주석은 화면에 아무것도 내지 않는다. 안에 코드 펜스가 들어 있어서
 * 그대로 흘리면 편집 대상 계산이 지저분해지고, 이 저장소에서 가장 망가지기 쉬운
 * 구간이기도 하다. 원본 ASCII 가 필요한 곳(다이어그램 패널)은 API 로 따로 받는다.
 */
md.renderer.rules.html_block = (tokens, idx) => {
  const t = tokens[idx]
  const src = t.content

  if (ASCII_COMMENT_RE.test(src)) {
    return '<div class="ascii-original" data-noedit="1" hidden></div>'
  }

  const marker = DIAGRAM_MARKER_RE.exec(src)
  if (marker) {
    return `<div class="diagram-anchor" data-noedit="1" data-diagram-id="${esc(marker[1])}" hidden></div>`
  }

  if (!t.map) return src
  return `<div class="blk" data-src-start="${t.attrGet('data-src-start')}" data-src-end="${t.attrGet('data-src-end')}">${src}</div>`
}

md.renderer.rules.html_inline = (tokens, idx) => tokens[idx].content

/** 이미지: assets/diagrams 아래면 SVG 를 통째로 인라인한다 */
md.renderer.rules.image = (tokens, idx, options, env) => {
  const t = tokens[idx]
  const src = t.attrGet('src') || ''
  const alt = t.content || ''
  const repoPath = resolveRelative(env.docPath, src)

  if (repoPath && /^assets\/diagrams\/.+\.svg$/i.test(repoPath)) {
    const id = path.posix.basename(repoPath, '.svg')
    let svg
    try {
      svg = normalize(fss.readFileSync(resolveInRepo(repoPath), 'utf8')).text
    } catch {
      return `<span class="diagram-missing">그림을 찾을 수 없다: ${esc(repoPath)}</span>`
    }
    return (
      `<figure class="diagram" data-diagram-id="${esc(id)}" data-svg-path="${esc(repoPath)}"` +
      ` tabindex="0" role="button" aria-label="${esc(alt)} — 클릭하면 다시 그리기">` +
      inlineSvg(svg, `dg-${cssId(id)}`) +
      (alt ? `<figcaption>${esc(alt)}</figcaption>` : '') +
      '</figure>'
    )
  }

  const url = repoPath ? `/api/raw?path=${encodeURIComponent(repoPath)}` : src
  return `<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy">`
}

/** 링크: 저장소 안의 상대 링크는 앱 라우트로 돌린다 */
const defLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const t = tokens[idx]
  const href = t.attrGet('href') || ''

  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) {
    t.attrSet('target', '_blank')
    t.attrSet('rel', 'noreferrer noopener')
    return defLinkOpen(tokens, idx, options, env, self)
  }
  if (href.startsWith('#') || href === '') {
    return defLinkOpen(tokens, idx, options, env, self)
  }

  const [pathPart, hash] = splitHash(href)
  let repoPath = resolveRelative(env.docPath, pathPart)

  if (repoPath) {
    // 디렉터리를 가리키는 링크(루트 README 가 그렇게 쓴다)는 그 안의 README.md 로
    if (pathPart.endsWith('/') || !/\.[a-z0-9]+$/i.test(pathPart)) {
      const asDir = path.posix.join(repoPath, 'README.md')
      if (fss.existsSync(path.join(REPO_ROOT, asDir))) repoPath = asDir
    }
    if (repoPath.endsWith('.md')) {
      t.attrSet('href', `#/doc/${repoPath}${hash}`)
      t.attrSet('data-doc-path', repoPath)
    } else {
      t.attrSet('href', `/api/raw?path=${encodeURIComponent(repoPath)}`)
    }
  }
  return defLinkOpen(tokens, idx, options, env, self)
}

/** 문서 하나를 HTML 로. docPath 가 있어야 상대 경로가 풀린다. */
export function renderMarkdown(text, docPath) {
  return md.render(text, { docPath })
}

/** 링크 검증용 — 문서 안의 내부 링크 대상을 저장소 경로로 모아준다 */
export function internalLinks(text, docPath) {
  const out = []
  const tokens = md.parse(text, { docPath })
  const walk = (list) => {
    for (const t of list) {
      if (t.type === 'link_open') {
        const href = t.attrGet('href') || ''
        if (!/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#') && href !== '') {
          const [p] = splitHash(href)
          out.push({ href, target: resolveRelative(docPath, p), isDir: p.endsWith('/') })
        }
      }
      if (t.children) walk(t.children)
    }
  }
  walk(tokens)
  return out
}

/** 첫 번째 `# ` 제목 */
export function docTitle(text, fallback) {
  const m = /^#\s+(.+)$/m.exec(text)
  return m ? m[1].trim() : fallback
}

/** 문서 안의 heading 목차. 코드 펜스 안의 `#` 은 세지 않는다. */
export function outline(text) {
  const out = []
  let inFence = false
  text.split('\n').forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) {
      inFence = !inFence
      return
    }
    if (inFence) return
    const m = /^(#{1,4})\s+(.+)$/.exec(l)
    if (m) out.push({ level: m[1].length, text: m[2].trim(), line: i })
  })
  return out
}

function splitHash(href) {
  const i = href.indexOf('#')
  return i === -1 ? [href, ''] : [href.slice(0, i), href.slice(i)]
}

/** 문서 기준 상대 경로 → 저장소 기준 POSIX 경로. 저장소 밖이면 null. */
function resolveRelative(docPath, rel) {
  if (!docPath || !rel) return null
  try {
    const joined = path.posix.normalize(
      path.posix.join(path.posix.dirname(docPath), decodeURI(rel)),
    )
    if (joined.startsWith('..')) return null
    return joined.replace(/^\.\//, '').replace(/\/$/, '')
  } catch {
    return null
  }
}

function cssId(s) {
  return s.replace(/[^A-Za-z0-9_-]/g, '_')
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
