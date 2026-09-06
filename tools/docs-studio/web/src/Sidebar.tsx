import { useEffect, useMemo, useState } from 'react'
import { api, type TreeNode } from './api'

interface Props {
  current: string | null
  onOpen: (path: string, line?: number) => void
}

export default function Sidebar({ current, onOpen }: Props) {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<{ path: string; hits: { line: number; text: string }[] }[]>([])
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.tree().then((t) => setTree(t.children)).catch(() => {})
  }, [])

  // 현재 문서까지의 경로는 자동으로 펼친다
  useEffect(() => {
    if (!current) return
    setOpen((prev) => {
      const next = new Set(prev)
      const parts = current.split('/')
      for (let i = 1; i < parts.length; i++) next.add(parts.slice(0, i).join('/'))
      return next
    })
  }, [current])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setHits([])
      return
    }
    const t = setTimeout(() => {
      api.search(term).then(setHits).catch(() => setHits([]))
    }, 220)
    return () => clearTimeout(t)
  }, [q])

  const searching = q.trim().length >= 2

  return (
    <nav className="sidebar">
      <div className="brand">
        <h1>Docs Studio</h1>
        <span className="sub">computer-science-interview-KR</span>
      </div>

      <div className="search-box">
        <input
          value={q}
          placeholder="문서 검색"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setQ('')}
        />
      </div>

      {searching ? (
        <div className="tree search-results">
          {hits.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12, color: 'var(--ink-faint)' }}>결과 없음</div>
          ) : (
            hits.map((h) => (
              <div key={h.path}>
                <div className="hit" onClick={() => onOpen(h.path, h.hits[0]?.line)}>
                  <div className="p">{h.path}</div>
                  {h.hits[0] && <div className="t">{h.hits[0].text}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="tree">
          {tree.map((n) => (
            <Node key={n.path} node={n} depth={0} current={current} open={open} setOpen={setOpen} onOpen={onOpen} />
          ))}
        </div>
      )}
    </nav>
  )
}

function Node({
  node,
  depth,
  current,
  open,
  setOpen,
  onOpen,
}: {
  node: TreeNode
  depth: number
  current: string | null
  open: Set<string>
  setOpen: (f: (s: Set<string>) => Set<string>) => void
  onOpen: (p: string) => void
}) {
  const label = useMemo(() => node.name.replace(/\.md$/, ''), [node.name])

  if (node.type === 'doc') {
    return (
      <div
        className={`row${current === node.path ? ' active' : ''}`}
        onClick={() => onOpen(node.path)}
        title={node.path}
      >
        <span className="caret" />
        <span>{label}</span>
      </div>
    )
  }

  const isOpen = open.has(node.path)
  const docCount = countDocs(node)

  return (
    <div className="tree-dir">
      <div
        className="row"
        onClick={() =>
          setOpen((s) => {
            const next = new Set(s)
            next.has(node.path) ? next.delete(node.path) : next.add(node.path)
            return next
          })
        }
      >
        <span className="caret">{isOpen ? '▾' : '▸'}</span>
        <span>{node.name}</span>
        <span className="badge">{docCount}</span>
      </div>
      {isOpen && (
        <div className="kids">
          {node.children.map((c) => (
            <Node key={c.path} node={c} depth={depth + 1} current={current} open={open} setOpen={setOpen} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}

function countDocs(n: TreeNode): number {
  if (n.type === 'doc') return 1
  return n.children.reduce((s, c) => s + countDocs(c), 0)
}
