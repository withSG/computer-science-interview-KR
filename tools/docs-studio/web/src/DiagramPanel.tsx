import { useEffect, useRef, useState } from 'react'
import { api, stream, type DiagramDetail, type StreamEvent } from './api'

interface Props {
  docPath: string
  diagramId: string
  onClose: () => void
  /** 그림이 새로 저장됐다 */
  onApplied: (r: { seq: number | null; svg: string; warnings?: string[] }) => void
  onError: (message: string) => void
}

export default function DiagramPanel({ docPath, diagramId, onClose, onApplied, onError }: Props) {
  const [detail, setDetail] = useState<DiagramDetail | null>(null)
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<string | null>(null)
  const [raw, setRaw] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [retryErrors, setRetryErrors] = useState<string[] | null>(null)
  const [before, setBefore] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const rawRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    setDetail(null)
    setRaw('')
    setBefore(null)
    setRetryErrors(null)
    api
      .diagram(docPath, diagramId)
      .then((d) => alive && setDetail(d))
      .catch((e) => onError((e as Error).message))
    return () => {
      alive = false
      abortRef.current?.abort()
    }
  }, [docPath, diagramId])

  useEffect(() => {
    if (rawRef.current) rawRef.current.scrollTop = rawRef.current.scrollHeight
  }, [raw])

  async function regenerate() {
    const text = instruction.trim()
    if (!text || busy) return

    setBusy(true)
    setRaw('')
    setAttempt(0)
    setRetryErrors(null)
    setPhase('보내는 중')

    const ac = new AbortController()
    abortRef.current = ac

    try {
      await stream(
        '/api/ai/svg',
        { docPath, diagramId, instruction: text },
        (e: StreamEvent) => {
          if (e.type === 'start') setPhase(`${e.model} 이 다시 그리는 중`)
          else if (e.type === 'attempt') {
            setAttempt(e.n)
            setRaw('')
          } else if (e.type === 'delta') setRaw((s) => s + e.text)
          else if (e.type === 'retry') {
            setRetryErrors(e.errors)
            setPhase('검증에 걸렸다 — 오류를 알려주고 다시 시킨다')
          } else if (e.type === 'error') {
            onError(e.errors?.length ? `${e.message}\n· ${e.errors.join('\n· ')}` : e.message)
            setBusy(false)
            setPhase(null)
          } else if (e.type === 'done' && e.svg) {
            setBefore(e.before ?? null)
            setDetail((d) => (d ? { ...d, svg: e.svg! } : d))
            onApplied({ seq: e.seq, svg: e.svg, warnings: e.warnings })
            setBusy(false)
            setPhase(null)
            setInstruction('')
          }
        },
        ac.signal,
      )
    } catch (err) {
      if ((err as Error).name !== 'AbortError') onError((err as Error).message)
    } finally {
      setBusy(false)
      setPhase(null)
      abortRef.current = null
    }
  }

  return (
    <aside className="panel">
      <div className="head">
        <h2>그림 다시 그리기</h2>
        <span className="spacer" />
        <button className="ghost" onClick={onClose} title="닫기">
          ✕
        </button>
      </div>

      <div className="scroll">
        {!detail ? (
          <div className="empty">불러오는 중…</div>
        ) : (
          <>
            <div className="label id">{detail.id}</div>
            <div className="preview" dangerouslySetInnerHTML={{ __html: detail.svg }} />
            <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 6 }}>
              {detail.svgPath} · {detail.section.heading ?? '섹션 없음'}
            </div>

            {!detail.validation.ok && (
              <div className="notice err">
                지금 파일이 규격을 벗어나 있다
                <ul>
                  {detail.validation.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="label">지시</div>
            <textarea
              rows={3}
              value={instruction}
              disabled={busy}
              placeholder="예) 화살표 방향을 뒤집어라 · 3단계를 4단계로 늘려라 · 글자가 상자를 넘친다"
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  void regenerate()
                }
              }}
            />
            <div className="actions" style={{ display: 'flex', gap: 7, marginTop: 8 }}>
              {busy ? (
                <>
                  <span className="spin" />
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                    {phase}
                    {attempt > 1 ? ` (${attempt}번째 시도)` : ''}
                  </span>
                  <span style={{ flex: 1 }} />
                  <button onClick={() => abortRef.current?.abort()}>중단</button>
                </>
              ) : (
                <>
                  <span className="hint" style={{ fontSize: 11, color: 'var(--ink-faint)', flex: 1 }}>
                    Ctrl+Enter · 검증을 통과해야 저장된다
                  </span>
                  <button className="primary" onClick={() => void regenerate()} disabled={!instruction.trim()}>
                    다시 그리기
                  </button>
                </>
              )}
            </div>

            {retryErrors && (
              <div className="notice warn">
                첫 응답이 규격을 어겨 되돌려 보냈다
                <ul>
                  {retryErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {raw && busy && (
              <>
                <div className="label">받는 중</div>
                <div className="out" ref={rawRef} style={{ maxHeight: 200 }}>
                  {raw}
                </div>
              </>
            )}

            {before && (
              <>
                <div className="label">바뀌기 전</div>
                <div className="preview" dangerouslySetInnerHTML={{ __html: before }} />
              </>
            )}

            {detail.ascii ? (
              <>
                <div className="label">이 그림이 대체한 원본 ASCII</div>
                <pre className="ascii">{detail.ascii}</pre>
              </>
            ) : (
              <>
                <div className="label">원본 ASCII</div>
                <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                  이 그림은 ASCII 를 옮긴 것이 아니라 직접 설계한 것이라 대응하는 원본이 없다.
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
