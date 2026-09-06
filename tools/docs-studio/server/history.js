/**
 * 편집 이력 — 백업, 저널, 되돌리기.
 *
 * AI 결과를 곧바로 파일에 쓰기 때문에(사용자 선택) 안전망은 전적으로 여기에 있다.
 * 설계 원칙 셋:
 *
 *  1) 쓰기 전에 원본 전체를 blob 으로 남긴다. 파일이 최대 60 KB, SVG 는 5 KB 라
 *     패치가 아니라 통째로 복사하는 게 코드도 복구도 단순하다.
 *  2) 저널이 디스크에 있으므로 앱을 재시작해도 undo 가 이어진다.
 *  3) 순서를 지킨다 — blob 저장 → 저널 append(fsync) → 원자적 rename.
 *     중간에 죽어도 "백업은 있는데 파일은 안 바뀐" 안전한 쪽으로만 깨진다.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { HISTORY_DIR } from './config.js'
import { sha256, readFileNormalized, writeFileNormalized } from './docs.js'

const JOURNAL = path.join(HISTORY_DIR, 'journal.jsonl')
const BLOBS = path.join(HISTORY_DIR, 'blobs')

/** 같은 파일에 대한 쓰기가 겹치지 않게 하는 경로별 뮤텍스 */
const locks = new Map()

export async function withLock(key, fn) {
  const prev = locks.get(key) || Promise.resolve()
  let release
  const next = new Promise((r) => (release = r))
  locks.set(key, prev.then(() => next))
  await prev
  try {
    return await fn()
  } finally {
    release()
    if (locks.get(key) === next) locks.delete(key)
  }
}

async function ensureDirs() {
  await fs.mkdir(BLOBS, { recursive: true })
}

/** 변경 전 내용을 blob 으로 남기고 해시를 돌려준다 */
async function putBlob(buf) {
  await ensureDirs()
  const hash = sha256(buf)
  const file = path.join(BLOBS, hash)
  try {
    await fs.access(file)
  } catch {
    await fs.writeFile(file, buf)
  }
  return hash
}

async function appendJournal(entry) {
  await ensureDirs()
  const fh = await fs.open(JOURNAL, 'a')
  try {
    await fh.writeFile(JSON.stringify(entry) + '\n', 'utf8')
    await fh.sync()
  } finally {
    await fh.close()
  }
}

export async function readJournal() {
  try {
    const raw = await fs.readFile(JOURNAL, 'utf8')
    return raw
      .split('\n')
      .filter((l) => l.trim() !== '')
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

/**
 * 최근 편집 목록 (되돌려진 것 포함, 최신 순).
 * `commit` 은 쓰기가 끝났음을 표시하는 내부 항목이라 목록에 내지 않는다.
 */
export async function listHistory(limit = 100) {
  const all = await readJournal()
  const undone = new Set(all.filter((e) => e.op === 'undo').map((e) => e.targetSeq))
  const committed = new Set(all.filter((e) => e.op === 'commit').map((e) => e.of))
  return all
    .filter((e) => e.op !== 'undo' && e.op !== 'commit')
    .map((e) => ({
      seq: e.seq,
      op: e.op,
      ts: e.ts,
      path: e.path,
      instruction: e.instruction,
      diagramId: e.diagramId,
      range: e.range,
      model: e.model,
      undone: undone.has(e.seq),
      // commit 이 없으면 쓰기 도중에 죽었다는 뜻이다 — 파일은 안 바뀐 안전한 쪽이다
      incomplete: !committed.has(e.seq),
    }))
    .reverse()
    .slice(0, limit)
}

/**
 * 편집을 적용한다. 백업 → 저널 → 쓰기 순서를 지킨다.
 *
 * @param {object} p
 * @param {string} p.repoPath   저장소 기준 경로
 * @param {string} p.nextText   LF 기준 새 내용
 * @param {'\r\n'|'\n'} p.eol
 * @param {boolean} p.bom
 * @param {string} p.expectHash 열었을 때의 디스크 해시 (외부 변경 감지)
 * @param {string} p.kind       'svg' | 'text'
 * @param {object} p.meta       프롬프트·모델 등 기록용
 */
export async function applyEdit({ repoPath, nextText, eol, bom, expectHash, kind, meta = {} }) {
  return withLock(repoPath, async () => {
    const current = await readFileNormalized(repoPath)

    if (expectHash != null && current.hash !== expectHash) {
      const e = new Error(
        '파일이 앱 밖에서 바뀌었다. 문서를 다시 불러온 뒤 시도할 것.',
      )
      e.code = 'STALE'
      throw e
    }
    if (current.text === nextText) {
      return { changed: false, seq: null, hash: current.hash }
    }

    const beforeBuf = Buffer.from(
      eol === '\r\n' ? current.text.replace(/\n/g, '\r\n') : current.text,
      'utf8',
    )
    const beforeBlob = await putBlob(beforeBuf)

    const all = await readJournal()
    const seq = (all.at(-1)?.seq ?? 0) + 1

    const entry = {
      seq,
      op: kind,
      ts: new Date().toISOString(),
      path: repoPath,
      beforeBlob,
      beforeHash: current.hash,
      eol: current.eol,
      bom: current.bom,
      ...meta,
    }

    // 저널을 먼저 확정한다. 이 다음에 죽으면 "기록은 있는데 안 바뀐" 상태 —
    // 되돌리기가 그대로 통하므로 안전하다.
    await appendJournal(entry)

    const res = await writeFileNormalized(repoPath, nextText, {
      eol: current.eol,
      bom: current.bom,
      expectHash: current.hash,
    })

    await appendJournal({ ...entry, op: 'commit', of: seq, afterHash: res.hash })

    return { changed: true, seq, hash: res.hash }
  })
}

/**
 * 되돌리기. seq 를 주면 그 편집을, 안 주면 아직 안 되돌린 가장 최근 편집을 되돌린다.
 * blob 을 통째로 되쓰기 때문에, 그 뒤에 같은 파일을 또 고쳤다면 그 편집도 함께 사라진다 —
 * 그래서 마지막 편집부터 순서대로 되돌리도록 안내한다.
 */
export async function undo(seq = null) {
  const all = await readJournal()
  const undoneSeqs = new Set(all.filter((e) => e.op === 'undo').map((e) => e.targetSeq))
  const edits = all.filter((e) => e.op !== 'undo' && e.op !== 'commit' && !undoneSeqs.has(e.seq))

  const target = seq == null ? edits.at(-1) : edits.find((e) => e.seq === seq)
  if (!target) {
    const e = new Error('되돌릴 편집이 없다')
    e.code = 'NOTHING'
    throw e
  }

  return withLock(target.path, async () => {
    const blob = await fs.readFile(path.join(BLOBS, target.beforeBlob))
    const { normalize } = await import('./eol.js')
    const { text } = normalize(blob.toString('utf8'))

    const res = await writeFileNormalized(target.path, text, {
      eol: target.eol || '\r\n',
      bom: !!target.bom,
    })

    await appendJournal({
      seq: (all.at(-1)?.seq ?? 0) + 1,
      op: 'undo',
      ts: new Date().toISOString(),
      path: target.path,
      targetSeq: target.seq,
    })

    return { path: target.path, seq: target.seq, hash: res.hash }
  })
}
