import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { stream, type StreamEvent } from './api'
import type { BlockRange } from './selection'

interface Props {
  docPath: string
  docHash: string
  range: BlockRange
  onClose: () => void
  /** 편집이 적용됐다. 새 HTML·해시로 화면을 갈아끼운다. */
  onApplied: (r: { seq: number | null; html?: string; hash?: string; warnings?: string[] }) => void
  onError: (message: string) => void
}

/**
 * Copilot 의 inline chat 을 본뜬 떠오르는 입력창.
 * 선택 바로 아래에 뜨고, 지시를 받아 그 구간만 고친다.
 */
export default function InlineChat({ docPath, docHash, range, onClose, onApplied, onError }: Props) {
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState('')
  const [phase, setPhase] = useState<string | null>(null)

  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const outRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    return () => abortRef.current?.abort()
  }, [])

  // 선택 위치 아래에 붙이되 화면 밖으로 나가지 않게 잡아둔다
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const gap = 8
    let left = range.rect.left
    let top = range.rect.bottom + gap
    left = Math.min(Math.max(12, left), window.innerWidth - width - 12)
    if (top + height > window.innerHeight - 12) {
      top = Math.max(12, range.rect.top - height - gap)
    }
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [range, out, busy])

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight
  }, [out])

  async function submit() {
    const text = instruction.trim()
    if (!text || busy) return

    setBusy(true)
    setOut('')
    setPhase('보내는 중')

    const ac = new AbortController()
    abortRef.current = ac

    try {
      await stream(
        '/api/ai/text',
        {
          docPath,
          startLine: range.start,
          endLine: range.end,
          selected: range.selected,
          instruction: text,
          expectHash: docHash,
        },
        (e: StreamEvent) => {
          if (e.type === 'start') setPhase(`${e.model} 이 고치는 중`)
          else if (e.type === 'delta') setOut((s) => s + e.text)
          else if (e.type === 'error') {
            onError(e.errors?.length ? `${e.message}\n· ${e.errors.join('\n· ')}` : e.message)
            setBusy(false)
            setPhase(null)
          } else if (e.type === 'done') {
            onApplied({ seq: e.seq, html: e.html, hash: e.hash, warnings: e.warnings })
            onClose()
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

  const lineLabel =
    range.start === range.end ? `${range.start + 1}줄` : `${range.start + 1}–${range.end + 1}줄`

  return (
    <div
      className="inline-chat"
      ref={boxRef}
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="선택한 구간 고치기"
    >
      <div className="head">
        {busy && <span className="spin" />}
        <strong>{phase ?? '이 구간을 고친다'}</strong>
        <span>· {lineLabel}</span>
        <span className="spacer" />
        <button className="ghost" onClick={onClose} title="닫기 (Esc)">
          ✕
        </button>
      </div>

      <div className="body">
        <textarea
          ref={inputRef}
          value={instruction}
          disabled={busy}
          placeholder="어떻게 고칠지 적는다. 예) 더 짧게, 예시를 하나 넣어라, 표로 바꿔라"
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void submit()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
            }
          }}
        />

        <div className="actions">
          <span className="hint">
            {busy ? '멈추려면 중단' : 'Ctrl+Enter 로 실행 · 블록 전체가 대상이다'}
          </span>
          <span className="spacer" />
          {busy ? (
            <button onClick={() => abortRef.current?.abort()}>중단</button>
          ) : (
            <>
              <button className="ghost" onClick={onClose}>
                취소
              </button>
              <button className="primary" onClick={() => void submit()} disabled={!instruction.trim()}>
                고치기
              </button>
            </>
          )}
        </div>

        {out && (
          <div className="out" ref={outRef}>
            {out}
          </div>
        )}
      </div>
    </div>
  )
}
