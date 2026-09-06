/**
 * 목 AI 서버를 상대로 쓰기 경로 전체를 태우는 검사.
 *
 *   node scripts/mock-ai.js &
 *   OPENAI_API_KEY=dummy OPENAI_BASE_URL=http://127.0.0.1:5199/v1 npm start &
 *   node scripts/e2e.js
 *
 * 실제 파일을 고쳤다가 되돌리므로, 끝나면 git 작업 트리가 처음 상태여야 한다.
 */

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5174'
const DOC = '08-security/03-https-tls.md'
const DIAGRAM = 'sec-https-tls-1'

let pass = 0
let fail = 0

function check(name, ok, detail = '') {
  if (ok) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function sse(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const events = []
  let buf = ''
  const dec = new TextDecoder()
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const l of lines) {
      if (l.startsWith('data: ')) events.push(JSON.parse(l.slice(6)))
    }
  }
  return events
}

const get = (p) => fetch(BASE + p).then((r) => r.json())
const post = (p, b = {}) =>
  fetch(BASE + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(b),
  }).then(async (r) => ({ status: r.status, body: await r.json() }))

console.log('\n1. SVG 재생성 — 정상 경로')
{
  const before = await get(`/api/diagram?docPath=${DOC}&id=${DIAGRAM}`)
  const ev = await sse('/api/ai/svg', { docPath: DOC, diagramId: DIAGRAM, instruction: '색을 정리해라' })
  const done = ev.find((e) => e.type === 'done')
  const deltas = ev.filter((e) => e.type === 'delta')

  check('스트리밍 델타가 온다', deltas.length > 1, `${deltas.length}개`)
  check('done 이벤트가 온다', !!done, JSON.stringify(ev.at(-1)))
  check('파일이 실제로 바뀌었다', done?.changed === true)
  check('되돌리기 번호를 받았다', typeof done?.seq === 'number')

  const after = await get(`/api/diagram?docPath=${DOC}&id=${DIAGRAM}`)
  check('디스크의 SVG 가 새것이다', after.svg !== before.svg)
  check('새 SVG 도 검증을 통과한다', after.validation.ok, JSON.stringify(after.validation.errors))

  const u = await post('/api/undo', { seq: done?.seq })
  check('되돌리기가 성공한다', u.status === 200, JSON.stringify(u.body))

  const restored = await get(`/api/diagram?docPath=${DOC}&id=${DIAGRAM}`)
  check('원본으로 정확히 복구됐다', restored.svg === before.svg)
  check('해시까지 같다', restored.svgHash === before.svgHash)
}

console.log('\n2. SVG 재생성 — 검증 실패 후 자동 재시도')
{
  const before = await get(`/api/diagram?docPath=${DOC}&id=${DIAGRAM}`)
  const ev = await sse('/api/ai/svg', {
    docPath: DOC,
    diagramId: DIAGRAM,
    instruction: 'MOCK:bad-svg 로 한 번 실패시켜라',
  })
  const retry = ev.find((e) => e.type === 'retry')
  const done = ev.find((e) => e.type === 'done')

  check('첫 응답이 검증에 걸린다', !!retry)
  check('걸린 이유가 <script> 다', retry?.errors?.some((e) => e.includes('script')), JSON.stringify(retry?.errors))
  check('두 번째 시도가 성공한다', !!done)
  check('시도 횟수가 2다', ev.filter((e) => e.type === 'attempt').length === 2)

  if (done?.seq) await post('/api/undo', { seq: done.seq })
  const restored = await get(`/api/diagram?docPath=${DOC}&id=${DIAGRAM}`)
  check('원본으로 복구됐다', restored.svg === before.svg)
}

console.log('\n3. 본문 구간 편집')
{
  const before = await get(`/api/doc?path=${DOC}`)
  const lines = before.text.split('\n')

  // 보호되지 않은 평범한 문단 한 줄을 고른다
  const guarded = new Set(before.protectedLines)
  let start = -1
  for (let i = 26; i < lines.length; i++) {
    if (!guarded.has(i) && lines[i].trim().length > 20 && !lines[i].startsWith('#') && !lines[i].startsWith('|')) {
      start = i
      break
    }
  }

  const ev = await sse('/api/ai/text', {
    docPath: DOC,
    startLine: start,
    endLine: start,
    selected: lines[start],
    instruction: '더 명확하게 고쳐라',
    expectHash: before.hash,
  })
  const done = ev.find((e) => e.type === 'done')

  check('done 이벤트가 온다', !!done, JSON.stringify(ev.at(-1)))
  check('파일이 바뀌었다', done?.changed === true)
  check('새 HTML 을 함께 받는다', typeof done?.html === 'string' && done.html.length > 1000)

  const mid = await get(`/api/doc?path=${DOC}`)
  check('그림 개수가 그대로다', mid.diagrams.length === before.diagrams.length)

  if (done?.seq) await post('/api/undo', { seq: done.seq })
  const after = await get(`/api/doc?path=${DOC}`)
  check('원본으로 정확히 복구됐다', after.text === before.text)
  check('해시까지 같다', after.hash === before.hash)
}

console.log('\n4. 보호 구역은 편집을 거부한다')
{
  const doc = await get(`/api/doc?path=${DOC}`)
  const markerLine = doc.diagrams[0].markerLine
  const ev = await sse('/api/ai/text', {
    docPath: DOC,
    startLine: markerLine,
    endLine: markerLine,
    instruction: '아무거나',
    expectHash: doc.hash,
  })
  const err = ev.find((e) => e.type === 'error')
  check('다이어그램 앵커 편집이 거부된다', !!err && err.message.includes('편집할 수 없다'), JSON.stringify(ev))
}

console.log('\n5. 외부 변경 감지 (낙관적 잠금)')
{
  const doc = await get(`/api/doc?path=${DOC}`)
  const ev = await sse('/api/ai/text', {
    docPath: DOC,
    startLine: 5,
    endLine: 5,
    instruction: '뭐든',
    expectHash: 'deadbeef'.repeat(8),
  })
  const err = ev.find((e) => e.type === 'error')
  check('낡은 해시로는 쓰지 않는다', !!err && err.code === 'STALE', JSON.stringify(ev.at(-1)))
}

console.log('\n6. API 오류가 그대로 전달된다')
{
  const ev = await sse('/api/ai/svg', {
    docPath: DOC,
    diagramId: DIAGRAM,
    instruction: 'MOCK:error',
  })
  const err = ev.find((e) => e.type === 'error')
  check('업스트림 오류가 UI 로 전달된다', !!err && /500/.test(err.message), JSON.stringify(ev.at(-1)))
}

console.log(`\n통과 ${pass}, 실패 ${fail}\n`)
process.exit(fail === 0 ? 0 : 1)
