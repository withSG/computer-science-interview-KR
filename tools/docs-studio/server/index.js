import express from 'express'
import fss from 'node:fs'
import path from 'node:path'

import { PORT, APP_ROOT, REPO_ROOT, resolveInRepo } from './config.js'
import { buildTree, readDoc, readFileNormalized, existsInRepo, spliceLines } from './docs.js'
import { renderMarkdown, docTitle, outline } from './render.js'
import { parseDiagrams, sectionContext, protectedLines } from './diagram.js'
import { validateSvg, validateMarkdown, extractSvg, extractMarkdown } from './validate.js'
import { buildSvgMessages, buildTextMessages, streamChat, aiStatus, aiConfig } from './ai.js'
import { applyEdit, undo, listHistory } from './history.js'

const app = express()
app.use(express.json({ limit: '4mb' }))

// ────────────────────────────────────────────────────────── 읽기

app.get('/api/status', async (_req, res) => {
  res.json({ repoRoot: REPO_ROOT, ai: aiStatus() })
})

app.get('/api/tree', async (_req, res, next) => {
  try {
    res.json(await buildTree())
  } catch (err) {
    next(err)
  }
})

app.get('/api/doc', async (req, res, next) => {
  try {
    const p = String(req.query.path || '')
    if (!p.endsWith('.md')) return fail(res, 400, '마크다운 문서만 열 수 있다')
    if (!existsInRepo(p)) return fail(res, 404, `없는 문서: ${p}`)

    const doc = await readDoc(p)
    const diagrams = parseDiagrams(doc.text, p)

    res.json({
      path: p,
      title: docTitle(doc.text, path.posix.basename(p)),
      html: renderMarkdown(doc.text, p),
      text: doc.text,
      hash: doc.hash,
      lineCount: doc.text.split('\n').length,
      outline: outline(doc.text),
      protectedLines: [...protectedLines(diagrams)],
      diagrams: diagrams.map((d) => ({
        id: d.id,
        alt: d.alt,
        svgPath: d.svgRepoPath,
        hasAscii: d.ascii != null,
        markerLine: d.markerLine,
      })),
    })
  } catch (err) {
    next(err)
  }
})

/** 다이어그램 패널이 쓰는 상세 정보 */
app.get('/api/diagram', async (req, res, next) => {
  try {
    const docPath = String(req.query.docPath || '')
    const id = String(req.query.id || '')
    const doc = await readDoc(docPath)
    const d = parseDiagrams(doc.text, docPath).find((x) => x.id === id)
    if (!d) return fail(res, 404, `문서 안에 다이어그램 ${id} 가 없다`)

    const svg = await readFileNormalized(d.svgRepoPath)
    res.json({
      id: d.id,
      alt: d.alt,
      docPath,
      svgPath: d.svgRepoPath,
      svg: svg.text,
      svgHash: svg.hash,
      ascii: d.ascii,
      section: d.section,
      sectionText: sectionContext(doc.text, d),
      validation: validateSvg(svg.text),
    })
  } catch (err) {
    next(err)
  }
})

app.get('/api/raw', (req, res, next) => {
  try {
    const abs = resolveInRepo(String(req.query.path || ''))
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(abs)
  } catch (err) {
    next(err)
  }
})

app.get('/api/search', async (req, res, next) => {
  try {
    const { searchDocs } = await import('./docs.js')
    res.json(await searchDocs(String(req.query.q || '')))
  } catch (err) {
    next(err)
  }
})

app.get('/api/history', async (_req, res, next) => {
  try {
    res.json(await listHistory())
  } catch (err) {
    next(err)
  }
})

app.post('/api/undo', async (req, res, next) => {
  try {
    res.json(await undo(req.body?.seq ?? null))
  } catch (err) {
    if (err.code === 'NOTHING') return fail(res, 400, err.message)
    next(err)
  }
})

// ────────────────────────────────────────────────────── AI (SSE)

/** SSE 연결을 연다 */
function openStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`)

  // req 가 아니라 res 의 close 를 본다. IncomingMessage 의 'close' 는
  // 본문을 다 읽은 시점에도 발화해서, 요청을 받자마자 스스로 취소해 버린다.
  const ac = new AbortController()
  res.on('close', () => ac.abort())
  return { send, signal: ac.signal }
}

/**
 * SVG 재생성.
 * 스트리밍으로 받되 파싱·검증은 완성된 뒤에만 한다 — 반쪽 SVG 는 언제나 무효다.
 * 검증에 걸리면 오류를 그대로 모델에 되돌려주고 딱 한 번만 다시 시킨다.
 */
app.post('/api/ai/svg', async (req, res) => {
  const { send, signal } = openStream(req, res)
  try {
    const { docPath, diagramId, instruction } = req.body || {}
    if (!docPath || !diagramId || !instruction?.trim()) {
      send({ type: 'error', message: 'docPath, diagramId, instruction 이 모두 필요하다' })
      return res.end()
    }

    const doc = await readDoc(docPath)
    const d = parseDiagrams(doc.text, docPath).find((x) => x.id === diagramId)
    if (!d) {
      send({ type: 'error', message: `문서 안에 다이어그램 ${diagramId} 가 없다` })
      return res.end()
    }

    const before = await readFileNormalized(d.svgRepoPath)
    const messages = buildSvgMessages({
      diagramId,
      docPath,
      section: sectionContext(doc.text, d),
      ascii: d.ascii,
      currentSvg: before.text,
      instruction,
    })

    send({ type: 'start', target: d.svgRepoPath, model: aiConfig.modelSvg })

    let attempt = 0
    let svg = null
    let check = null
    const convo = [...messages]

    while (attempt < 2) {
      attempt++
      send({ type: 'attempt', n: attempt })

      const raw = await streamChat(convo, {
        model: aiConfig.modelSvg,
        signal,
        onDelta: (t) => send({ type: 'delta', text: t }),
      })

      const candidate = extractSvg(raw)
      if (!candidate) {
        check = { ok: false, errors: ['응답에서 <svg>…</svg> 를 찾지 못했다'], warnings: [] }
      } else {
        check = validateSvg(candidate)
        if (check.ok) {
          svg = candidate
          break
        }
      }

      if (attempt >= 2) break
      send({ type: 'retry', errors: check.errors })
      convo.push(
        { role: 'assistant', content: candidate || raw.slice(0, 2000) },
        {
          role: 'user',
          content:
            '검증에 걸렸다. 아래를 전부 고쳐서 SVG 전문을 다시 내라.\n\n' +
            check.errors.map((e) => `- ${e}`).join('\n'),
        },
      )
    }

    if (!svg) {
      send({ type: 'error', message: '검증을 통과하지 못했다', errors: check?.errors || [] })
      return res.end()
    }

    // 파일명은 언제나 앵커에서 온다. 모델이 낸 이름은 쓰지 않는다 —
    // 대소문자를 구분하지 않는 Windows 에서 camelCase id 가 조용히 뭉개진다.
    const result = await applyEdit({
      repoPath: d.svgRepoPath,
      nextText: svg.endsWith('\n') ? svg : svg + '\n',
      expectHash: before.hash,
      kind: 'svg',
      meta: { diagramId, docPath, instruction, model: aiConfig.modelSvg, baseUrl: aiConfig.baseUrl },
    })

    send({
      type: 'done',
      seq: result.seq,
      changed: result.changed,
      svg,
      before: before.text,
      warnings: check.warnings,
    })
    res.end()
  } catch (err) {
    send({ type: 'error', message: err.message, code: err.code })
    res.end()
  }
})

/** 본문 구간 편집 (inline chat) */
app.post('/api/ai/text', async (req, res) => {
  const { send, signal } = openStream(req, res)
  try {
    const { docPath, startLine, endLine, selected, instruction, expectHash } = req.body || {}
    if (!docPath || !Number.isInteger(startLine) || !Number.isInteger(endLine) || !instruction?.trim()) {
      send({ type: 'error', message: 'docPath, startLine, endLine, instruction 이 모두 필요하다' })
      return res.end()
    }

    const doc = await readDoc(docPath)
    const lines = doc.text.split('\n')
    if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
      send({ type: 'error', message: `줄 범위가 문서를 벗어난다: ${startLine}-${endLine}` })
      return res.end()
    }

    // 다이어그램 마커·이미지·ASCII 보존 주석은 건드리지 않는다
    const guarded = protectedLines(parseDiagrams(doc.text, docPath))
    for (let i = startLine; i <= endLine; i++) {
      if (guarded.has(i)) {
        send({
          type: 'error',
          message: '다이어그램 앵커와 보존된 원본 ASCII 는 편집할 수 없다. 그림은 클릭해서 다시 그려라.',
        })
        return res.end()
      }
    }

    const CTX = 40
    const target = lines.slice(startLine, endLine + 1).join('\n')
    const messages = buildTextMessages({
      docPath,
      contextBefore: lines.slice(Math.max(0, startLine - CTX), startLine).join('\n'),
      target,
      contextAfter: lines.slice(endLine + 1, endLine + 1 + CTX).join('\n'),
      selected,
      instruction,
    })

    send({ type: 'start', target: docPath, range: [startLine, endLine], model: aiConfig.model })

    const raw = await streamChat(messages, {
      model: aiConfig.model,
      signal,
      onDelta: (t) => send({ type: 'delta', text: t }),
    })

    const wasFence = /^\s{0,3}(```|~~~)/.test(lines[startLine])
    const replacement = extractMarkdown(raw, wasFence)
    if (!replacement.trim()) {
      send({ type: 'error', message: '모델이 빈 교체본을 냈다' })
      return res.end()
    }

    const nextText = spliceLines(doc.text, startLine, endLine, replacement)
    if (nextText === doc.text) {
      send({ type: 'done', changed: false, seq: null, message: '달라진 것이 없다' })
      return res.end()
    }

    const check = validateMarkdown(doc.text, nextText, docPath, [startLine, endLine])
    if (!check.ok) {
      send({ type: 'error', message: '검증을 통과하지 못해 쓰지 않았다', errors: check.errors, replacement })
      return res.end()
    }

    const result = await applyEdit({
      repoPath: docPath,
      nextText,
      expectHash: expectHash ?? doc.hash,
      kind: 'text',
      meta: { instruction, range: [startLine, endLine], model: aiConfig.model, baseUrl: aiConfig.baseUrl },
    })

    const fresh = await readDoc(docPath)
    send({
      type: 'done',
      seq: result.seq,
      changed: result.changed,
      before: target,
      after: replacement,
      warnings: check.warnings,
      hash: fresh.hash,
      html: renderMarkdown(fresh.text, docPath),
    })
    res.end()
  } catch (err) {
    send({ type: 'error', message: err.message, code: err.code })
    res.end()
  }
})

// ───────────────────────────────────────────────────────── 정적

const dist = path.join(APP_ROOT, 'web', 'dist')
if (fss.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// ───────────────────────────────────────────────────────── 오류

function fail(res, status, message) {
  res.status(status).json({ error: message })
}

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.code === 'STALE' ? 409 : /저장소 밖|없는 문서/.test(err.message) ? 400 : 500
  res.status(status).json({ error: err.message, code: err.code })
})

app.listen(PORT, '127.0.0.1', () => {
  const st = aiStatus()
  console.log(`\n  docs-studio  http://127.0.0.1:${PORT}`)
  console.log(`  저장소       ${REPO_ROOT}`)
  console.log(`  AI           ${st.configured ? `${st.baseUrl} · ${st.model}` : 'OPENAI_API_KEY 없음 (읽기 전용으로 동작)'}`)
  if (!fss.existsSync(dist)) console.log(`  화면         vite dev 서버(5173)를 따로 띄울 것 — npm run dev\n`)
  else console.log('')
})
