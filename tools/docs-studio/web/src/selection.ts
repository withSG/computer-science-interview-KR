/**
 * 렌더된 화면의 선택 영역 → 마크다운 원문의 줄 범위.
 *
 * 문자 단위로 되짚지 않는다. 렌더된 텍스트와 원문은 인라인 문법(**, 링크, 코드) 때문에
 * 일대일이 아니라서, 문자 오프셋을 정확히 되돌리려면 렌더러를 직접 짜야 한다.
 *
 * 대신 서버가 모든 블록에 심어둔 data-src-start/end 로 **블록 단위로 스냅**한다.
 * 줄 범위로 splice 하므로 원문이 어긋날 수가 없고, 사용자가 드래그한 실제 문자열은
 * 프롬프트에 따로 실어 "여기를 고쳐라"를 모델에 알린다.
 */

export interface BlockRange {
  /** 원문 줄 번호 (0-based, 양끝 포함) */
  start: number
  end: number
  /** 사용자가 실제로 드래그한 텍스트 */
  selected: string
  /** 떠오르는 입력창을 띄울 위치 */
  rect: DOMRect
  /** 스냅된 구간에 해당하는 요소들 — 하이라이트용 */
  elements: HTMLElement[]
}

function closestBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let el: Node | null = node
  while (el && el !== root) {
    if (el.nodeType === 1) {
      const e = el as HTMLElement
      if (e.dataset.srcStart != null) return e
    }
    el = el.parentNode
  }
  return null
}

/** 현재 선택으로부터 편집 대상 블록 범위를 구한다. 편집할 수 없으면 null. */
export function blockRangeFromSelection(root: HTMLElement): BlockRange | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null

  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null

  const selected = sel.toString()
  if (selected.trim().length === 0) return null

  const startEl = closestBlock(range.startContainer, root)
  const endEl = closestBlock(range.endContainer, root)
  if (!startEl || !endEl) return null

  // 그림 안쪽과 보존 구역은 드래그 편집 대상이 아니다.
  // 그림은 클릭해서 다시 그리고, 보존된 원본 ASCII 는 손대지 않는다.
  for (const el of [startEl, endEl]) {
    if (el.closest('[data-noedit]') || el.closest('figure.diagram')) return null
  }

  const a = Number(startEl.dataset.srcStart)
  const b = Number(endEl.dataset.srcEnd)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null

  const start = Math.min(a, b)
  const end = Math.max(a, b)

  return { start, end, selected, rect: range.getBoundingClientRect(), elements: blocksIn(root, start, end) }
}

/**
 * 줄 범위 안에 완전히 들어가는 블록 중 가장 바깥쪽만 고른다.
 * 문단과 그 안의 목록 항목을 겹쳐 칠하지 않기 위한 것이다.
 */
export function blocksIn(root: HTMLElement, start: number, end: number): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>('[data-src-start]')).filter((el) => {
    const s = Number(el.dataset.srcStart)
    const e = Number(el.dataset.srcEnd)
    return Number.isFinite(s) && Number.isFinite(e) && s >= start && e <= end
  })
  return all.filter((el) => !all.some((other) => other !== el && other.contains(el)))
}

const HL = 'sel-block'

export function highlight(elements: HTMLElement[]) {
  for (const el of elements) el.classList.add(HL)
}

export function clearHighlight(root: HTMLElement) {
  for (const el of root.querySelectorAll<HTMLElement>('.' + HL)) el.classList.remove(HL)
}
