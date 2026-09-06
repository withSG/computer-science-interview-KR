export type TreeNode =
  | { type: 'doc'; name: string; path: string }
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }

export interface DiagramRef {
  id: string
  alt: string
  svgPath: string
  hasAscii: boolean
  markerLine: number
}

export interface Doc {
  path: string
  title: string
  html: string
  text: string
  hash: string
  lineCount: number
  outline: { level: number; text: string; line: number }[]
  protectedLines: number[]
  diagrams: DiagramRef[]
}

export interface Validation {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export interface DiagramDetail {
  id: string
  alt: string
  docPath: string
  svgPath: string
  svg: string
  svgHash: string
  ascii: string | null
  section: { heading: string | null; start: number; end: number }
  sectionText: string
  validation: Validation
}

export interface HistoryEntry {
  seq: number
  op: 'svg' | 'text'
  ts: string
  path: string
  instruction?: string
  diagramId?: string
  range?: [number, number]
  model?: string
  undone: boolean
  incomplete: boolean
}

export interface Status {
  repoRoot: string
  ai: { configured: boolean; baseUrl: string; model: string; modelSvg: string }
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as { error?: string }).error || `${res.status} ${res.statusText}`)
  return body as T
}

export const api = {
  status: () => json<Status>('/api/status'),
  tree: () => json<{ children: TreeNode[] }>('/api/tree'),
  doc: (path: string) => json<Doc>(`/api/doc?path=${encodeURIComponent(path)}`),
  diagram: (docPath: string, id: string) =>
    json<DiagramDetail>(`/api/diagram?docPath=${encodeURIComponent(docPath)}&id=${encodeURIComponent(id)}`),
  search: (q: string) =>
    json<{ path: string; titleHit: boolean; hits: { line: number; text: string }[] }[]>(
      `/api/search?q=${encodeURIComponent(q)}`,
    ),
  history: () => json<HistoryEntry[]>('/api/history'),
  undo: (seq?: number) =>
    json<{ path: string; seq: number }>('/api/undo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(seq == null ? {} : { seq }),
    }),
}

export type StreamEvent =
  | { type: 'start'; target: string; model: string; range?: [number, number] }
  | { type: 'attempt'; n: number }
  | { type: 'delta'; text: string }
  | { type: 'retry'; errors: string[] }
  | { type: 'error'; message: string; code?: string; errors?: string[]; replacement?: string }
  | {
      type: 'done'
      seq: number | null
      changed: boolean
      svg?: string
      before?: string
      after?: string
      html?: string
      hash?: string
      warnings?: string[]
      message?: string
    }

/** SSE 스트림을 읽어 이벤트를 하나씩 넘긴다. 중단하려면 signal 을 끊는다. */
export async function stream(
  url: string,
  body: unknown,
  onEvent: (e: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.body) throw new Error('스트림을 열지 못했다')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        onEvent(JSON.parse(line.slice(6)) as StreamEvent)
      } catch {
        /* 부분 프레임은 무시한다 */
      }
    }
  }
}
