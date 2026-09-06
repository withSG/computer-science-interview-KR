/**
 * SVG 를 HTML 에 인라인하기 위한 손질.
 *
 * 961개 파일이 전부 같은 하우스 스타일이라 id 가 겹친다 —
 * `id="t"`, `id="d"`, 마커 `a-ink`/`a-blue`/… 가 파일마다 동일하다.
 * 한 페이지에 여러 장을 인라인하면 마지막에 정의된 것이 이겨서
 * 화살촉 색이 뒤엉키고 스크린리더가 엉뚱한 제목을 읽는다. 접두사를 붙여 격리한다.
 */

const ID_RE = /\bid="([^"]+)"/g

/**
 * @param {string} svg 원본 SVG 소스
 * @param {string} prefix 이 그림에만 붙는 접두사 (보통 diagram id)
 */
export function inlineSvg(svg, prefix) {
  const ids = new Set()
  let m
  ID_RE.lastIndex = 0
  while ((m = ID_RE.exec(svg)) !== null) ids.add(m[1])

  let out = svg
  for (const id of ids) {
    const q = escapeRe(id)
    const p = `${prefix}__${id}`
    out = out
      .replace(new RegExp(`\\bid="${q}"`, 'g'), `id="${p}"`)
      .replace(new RegExp(`url\\(#${q}\\)`, 'g'), `url(#${p})`)
      .replace(new RegExp(`\\bhref="#${q}"`, 'g'), `href="#${p}"`)
      .replace(new RegExp(`\\bxlink:href="#${q}"`, 'g'), `xlink:href="#${p}"`)
  }

  // aria-labelledby 는 id 목록이라 토큰 단위로 갈아준다
  out = out.replace(/\baria-labelledby="([^"]+)"/g, (_all, list) => {
    const mapped = list
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => (ids.has(t) ? `${prefix}__${t}` : t))
      .join(' ')
    return `aria-labelledby="${mapped}"`
  })

  // 루트의 고정 width/height 를 걷어내 반응형으로 만든다. viewBox 는 그대로 둔다.
  out = out.replace(/^(\s*<svg\b[^>]*?)\s+width="[\d.]+"\s+height="[\d.]+"/, '$1')

  return out.trim()
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
