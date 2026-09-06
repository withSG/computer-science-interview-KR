import { useEffect, useState } from 'react'
import { api, type HistoryEntry } from './api'

interface Props {
  refreshKey: number
  onClose: () => void
  onUndone: (path: string) => void
  onError: (m: string) => void
}

export default function HistoryPanel({ refreshKey, onClose, onUndone, onError }: Props) {
  const [items, setItems] = useState<HistoryEntry[]>([])
  const [busy, setBusy] = useState<number | null>(null)

  useEffect(() => {
    api.history().then(setItems).catch((e) => onError((e as Error).message))
  }, [refreshKey])

  async function undo(seq: number, path: string) {
    setBusy(seq)
    try {
      await api.undo(seq)
      setItems(await api.history())
      onUndone(path)
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const live = items.filter((i) => !i.undone)

  return (
    <aside className="panel">
      <div className="head">
        <h2>편집 이력</h2>
        <span className="pill">{live.length}건 살아 있음</span>
        <span className="spacer" />
        <button className="ghost" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="scroll">
        {items.length === 0 ? (
          <div className="empty">아직 고친 것이 없다.</div>
        ) : (
          <ul className="hist">
            {items.map((e) => (
              <li key={e.seq} className={e.undone ? 'undone' : ''}>
                <div className="meta">
                  <span>#{e.seq}</span>
                  <span>{e.op === 'svg' ? '그림' : '본문'}</span>
                  <span>{new Date(e.ts).toLocaleTimeString('ko-KR')}</span>
                  <span className="spacer" />
                  {e.undone ? (
                    <span>되돌려짐</span>
                  ) : (
                    <button
                      className="ghost"
                      disabled={busy === e.seq}
                      onClick={() => void undo(e.seq, e.path)}
                      title="이 편집을 되돌린다"
                    >
                      {busy === e.seq ? '…' : '되돌리기'}
                    </button>
                  )}
                </div>
                <div className="what">
                  {e.diagramId ?? e.path}
                  {e.range ? ` · ${e.range[0] + 1}–${e.range[1] + 1}줄` : ''}
                </div>
                {e.instruction && <div className="instr">{e.instruction}</div>}
                {e.incomplete && (
                  <div style={{ fontSize: 11, color: 'var(--warn)' }}>
                    쓰기가 끝나기 전에 앱이 멈췄다 — 파일은 바뀌지 않았을 가능성이 높다
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="notice warn" style={{ marginTop: 16 }}>
          되돌리기는 그 편집 직전의 파일 전체를 되쓴다. 같은 파일을 그 뒤에 또 고쳤다면
          최신 것부터 차례로 되돌리는 편이 안전하다.
        </div>
      </div>
    </aside>
  )
}
