import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Doc, type Status } from './api'
import Sidebar from './Sidebar'
import InlineChat from './InlineChat'
import DiagramPanel from './DiagramPanel'
import HistoryPanel from './HistoryPanel'
import { blockRangeFromSelection, clearHighlight, highlight, type BlockRange } from './selection'

type Toast = { id: number; kind: 'ok' | 'err' | 'info'; text: string; undo?: number }
type Panel = { kind: 'diagram'; id: string } | { kind: 'history' } | null

const HOME = 'README.md'

export default function App() {
  const [status, setStatus] = useState<Status | null>(null)
  const [doc, setDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [range, setRange] = useState<BlockRange | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [histKey, setHistKey] = useState(0)

  const bodyRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const toastId = useRef(1)

  const toast = useCallback((kind: Toast['kind'], text: string, undo?: number) => {
    const id = toastId.current++
    setToasts((t) => [...t, { id, kind, text, undo }])
    // 되돌리기 버튼이 달린 알림은 스스로 사라지지 않는다 — 파일이 이미 바뀐 뒤라
    // 사라지는 순간 사용자가 손쓸 방법을 잃는다. 오류도 마찬가지로 남긴다.
    if (kind !== 'err' && undo == null) {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000)
    }
  }, [])

  useEffect(() => {
    api.status().then(setStatus).catch(() => {})
  }, [])

  // ── 라우팅: #/doc/<path>
  const load = useCallback(
    async (path: string, scrollToLine?: number) => {
      setLoading(true)
      try {
        const d = await api.doc(path)
        setDoc(d)
        setPanel(null)
        setRange(null)
        requestAnimationFrame(() => {
          if (scrollToLine != null) {
            const el = bodyRef.current?.querySelector<HTMLElement>(`[data-src-start="${scrollToLine}"]`)
            if (el) {
              el.scrollIntoView({ block: 'center' })
              return
            }
          }
          mainRef.current?.scrollTo({ top: 0 })
        })
      } catch (e) {
        toast('err', (e as Error).message)
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    const go = () => {
      const m = /^#\/doc\/(.+?)(?:#.*)?$/.exec(location.hash)
      void load(m ? decodeURIComponent(m[1]) : HOME)
    }
    go()
    window.addEventListener('hashchange', go)
    return () => window.removeEventListener('hashchange', go)
  }, [load])

  const open = useCallback((path: string, line?: number) => {
    if (line != null) void loadWithLine(path, line)
    else location.hash = `#/doc/${path}`
  }, [])

  const loadWithLine = useCallback(
    async (path: string, line: number) => {
      if (location.hash === `#/doc/${path}`) await load(path, line)
      else {
        location.hash = `#/doc/${path}`
        setTimeout(() => void load(path, line), 60)
      }
    },
    [load],
  )

  // ── 학습 체크박스
  // 개인 진도라 md 파일에는 절대 쓰지 않는다. 이 브라우저의 localStorage 에만 남는다.
  useEffect(() => {
    const el = bodyRef.current
    if (!el || !doc) return

    const storeKey = `docs-studio-tasks:${doc.path}`
    const read = (): Record<string, boolean> => {
      try {
        return JSON.parse(localStorage.getItem(storeKey) || '{}')
      } catch {
        return {}
      }
    }

    // 저장해 둔 체크 상태를 덮어씌운다. 없으면 원문의 [x] 를 그대로 쓴다.
    const saved = read()
    for (const box of el.querySelectorAll<HTMLInputElement>('input.task[data-task-key]')) {
      const k = box.dataset.taskKey
      if (k && k in saved) box.checked = saved[k]
    }

    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement
      if (!(t instanceof HTMLInputElement) || !t.classList.contains('task')) return
      const k = t.dataset.taskKey
      if (!k) return
      const next = read()
      next[k] = t.checked
      try {
        localStorage.setItem(storeKey, JSON.stringify(next))
      } catch {
        toast('err', '체크 상태를 저장하지 못했다 (localStorage 사용 불가)')
      }
    }

    el.addEventListener('change', onChange)
    return () => el.removeEventListener('change', onChange)
  }, [doc, toast])

  // ── 그림 클릭 → 재생성 패널
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const fig = (e.target as HTMLElement).closest<HTMLElement>('figure.diagram')
      if (!fig) return
      e.preventDefault()
      const id = fig.dataset.diagramId
      if (id) {
        setRange(null)
        setPanel({ kind: 'diagram', id })
      }
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [doc])

  // ── 드래그 선택 → inline chat
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return

    const onUp = () => {
      // 브라우저가 선택을 확정한 뒤에 읽는다
      setTimeout(() => {
        const r = blockRangeFromSelection(el)
        clearHighlight(el)
        if (!r) {
          setRange(null)
          return
        }
        highlight(r.elements)
        setRange(r)
      }, 0)
    }

    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.inline-chat')) return
      clearHighlight(el)
      setRange(null)
    }

    el.addEventListener('mouseup', onUp)
    document.addEventListener('mousedown', onDown)
    return () => {
      el.removeEventListener('mouseup', onUp)
      document.removeEventListener('mousedown', onDown)
    }
  }, [doc])

  // ── 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRange(null)
        if (bodyRef.current) clearHighlight(bodyRef.current)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        const el = bodyRef.current
        if (!el) return
        const r = blockRangeFromSelection(el)
        if (r) {
          highlight(r.elements)
          setRange(r)
        } else toast('info', '먼저 고칠 부분을 드래그해라')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toast])

  function closeChat() {
    setRange(null)
    if (bodyRef.current) clearHighlight(bodyRef.current)
    window.getSelection()?.removeAllRanges()
  }

  async function undoSeq(seq: number) {
    try {
      const r = await api.undo(seq)
      toast('ok', `#${seq} 되돌렸다 — ${r.path}`)
      setHistKey((k) => k + 1)
      if (doc) await load(doc.path)
    } catch (e) {
      toast('err', (e as Error).message)
    }
  }

  const themeDark = document.documentElement.dataset.theme === 'dark'

  return (
    <div className={`app${panel ? ' with-panel' : ''}`}>
      <Sidebar current={doc?.path ?? null} onOpen={open} />

      <div className="main" ref={mainRef}>
        <div className="topbar">
          <span className="path">{doc?.path ?? '…'}</span>
          {loading && <span className="spin" />}
          <span className="spacer" />
          {status && (
            <span className={`pill ${status.ai.configured ? 'ok' : 'off'}`} title={status.ai.baseUrl}>
              {status.ai.configured ? status.ai.model : 'API 키 없음 — 읽기 전용'}
            </span>
          )}
          {doc && <span className="pill">그림 {doc.diagrams.length}</span>}
          <button className="ghost" onClick={() => setPanel({ kind: 'history' })}>
            이력
          </button>
          <button
            className="ghost"
            title="테마"
            onClick={() => {
              const next = themeDark ? 'light' : 'dark'
              document.documentElement.dataset.theme = next
              localStorage.setItem('docs-studio-theme', next)
              setToasts((t) => [...t])
            }}
          >
            {themeDark ? '☀' : '☾'}
          </button>
        </div>

        {doc ? (
          <article
            className="doc"
            ref={bodyRef}
            dangerouslySetInnerHTML={{ __html: doc.html }}
            onClickCapture={(e) => {
              // 문서 간 이동은 해시 라우팅으로 처리한다
              const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-doc-path]')
              if (!a) return
              e.preventDefault()
              location.hash = a.getAttribute('href') || ''
            }}
          />
        ) : (
          <div className="empty">문서를 고르면 여기에 나온다.</div>
        )}
      </div>

      {panel?.kind === 'diagram' && doc && (
        <DiagramPanel
          docPath={doc.path}
          diagramId={panel.id}
          onClose={() => setPanel(null)}
          onError={(m) => toast('err', m)}
          onApplied={({ seq, warnings }) => {
            toast('ok', '그림을 새로 저장했다.', seq ?? undefined)
            for (const w of warnings ?? []) toast('info', w)
            setHistKey((k) => k + 1)
            void load(doc.path)
          }}
        />
      )}

      {panel?.kind === 'history' && (
        <HistoryPanel
          refreshKey={histKey}
          onClose={() => setPanel(null)}
          onError={(m) => toast('err', m)}
          onUndone={(path) => {
            toast('ok', `되돌렸다 — ${path}`)
            if (doc) void load(doc.path)
          }}
        />
      )}

      {range && doc && (
        <InlineChat
          docPath={doc.path}
          docHash={doc.hash}
          range={range}
          onClose={closeChat}
          onError={(m) => toast('err', m)}
          onApplied={({ seq, html, hash, warnings }) => {
            if (html && hash) setDoc({ ...doc, html, hash })
            toast('ok', '본문을 고쳐 저장했다.', seq ?? undefined)
            for (const w of warnings ?? []) toast('info', w)
            setHistKey((k) => k + 1)
          }}
        />
      )}

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <span style={{ whiteSpace: 'pre-wrap', flex: 1 }}>{t.text}</span>
            {t.undo != null && (
              <button
                onClick={() => {
                  void undoSeq(t.undo!)
                  setToasts((x) => x.filter((y) => y.id !== t.id))
                }}
              >
                되돌리기
              </button>
            )}
            <button className="ghost" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
