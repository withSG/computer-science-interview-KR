/**
 * OpenAI 호환 목 서버.
 *
 * 실제 키 없이 스트리밍·검증·되돌리기 경로를 전부 태우기 위한 것이다.
 *   node scripts/mock-ai.js
 *   OPENAI_BASE_URL=http://127.0.0.1:5199/v1 OPENAI_API_KEY=dummy npm run start
 *
 * 시나리오는 요청 안의 지시문 문자열로 고른다.
 *   "MOCK:bad-svg"  → 검증에 걸리는 SVG (<script> 포함)
 *   "MOCK:slow"     → 천천히 흘려보내기
 *   "MOCK:error"    → 500 응답
 *   그 밖의 SVG 요청 → 현재 SVG 의 <title> 만 바꿔 돌려준다 (규격은 유지)
 *   그 밖의 본문 요청 → 구간 앞에 표식을 붙여 돌려준다
 */

import http from 'node:http'

const PORT = Number(process.env.MOCK_PORT || 5199)

const GOOD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 300" width="880" height="300" font-family="'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Segoe UI',sans-serif" role="img" aria-labelledby="t d">
  <title id="t">목 서버가 만든 그림</title>
  <desc id="d">목 서버가 검증 경로를 시험하려고 만든 다이어그램이다.</desc>
  <rect width="880" height="300" fill="#ffffff"/>
  <rect x="40" y="60" width="200" height="60" rx="4" ry="4" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <text x="140" y="96" font-size="14" fill="#1f2933" text-anchor="middle">가짜 상자</text>
</svg>`

// 일부러 여러 규칙을 한꺼번에 어긴다 — script, 잘못된 폭, 폰트 폴백 없음, title/desc 없음
const BAD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" width="640" height="300" role="img">
  <script>alert(1)</script>
  <rect width="640" height="300" fill="#ffffff"/>
  <rect x="40" y="60" width="200" height="60" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <text x="140" y="96" font-size="14" fill="#1f2933" text-anchor="middle">규격을 어긴 상자</text>
  <text x="140" y="140" font-size="11" fill="#52606d" text-anchor="middle">검증기가 이걸 반드시 막아야 한다</text>
</svg>`

function chunksOf(s, n) {
  const out = []
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n))
  return out
}

const server = http.createServer((req, res) => {
  if (!req.url.endsWith('/chat/completions')) {
    res.writeHead(404).end('not found')
    return
  }

  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', async () => {
    let parsed
    try {
      parsed = JSON.parse(body)
    } catch {
      res.writeHead(400).end('bad json')
      return
    }

    const user = parsed.messages?.map((m) => m.content).join('\n') || ''
    const isSvg = user.includes('# 현재 SVG')

    if (user.includes('MOCK:error')) {
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: { message: '목 서버가 일부러 낸 오류' } }))
      return
    }

    let out
    if (isSvg) {
      // 재시도 경로 확인용: 두 번째 턴(검증 오류를 되돌려준 뒤)에는 올바른 걸 낸다
      const isRetry = user.includes('검증에 걸렸다')
      out = user.includes('MOCK:bad-svg') && !isRetry ? BAD_SVG : GOOD_SVG
    } else {
      const m = /«SEL»\n([\s\S]*?)\n«\/SEL»/.exec(user)
      const target = m ? m[1] : '(구간을 못 찾음)'
      out = `${target}\n\n> 목 서버가 덧붙인 줄.`
    }

    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
    })

    const slow = user.includes('MOCK:slow')
    for (const c of chunksOf(out, 40)) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`)
      if (slow) await new Promise((r) => setTimeout(r, 60))
    }
    res.write('data: [DONE]\n\n')
    res.end()
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`목 AI 서버: http://127.0.0.1:${PORT}/v1`)
})
