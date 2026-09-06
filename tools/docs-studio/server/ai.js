/**
 * OpenAI 호환 chat/completions 클라이언트와 프롬프트.
 *
 * SDK 를 쓰지 않는다. 필요한 엔드포인트가 하나뿐이고, SDK 를 넣는 순간
 * baseUrl 을 바꿔 vLLM·Ollama·사내 프록시에 붙이는 게 오히려 까다로워진다.
 * 키는 이 서버에만 있고 브라우저로 내려가지 않는다.
 */

import { ai as cfg } from './config.js'

const HOUSE_STYLE = `너는 이 저장소의 SVG 다이어그램을 그린다. 저장소에는 961장이 있고 전부 같은 규격이다.
규격에서 벗어나면 GitHub 에서 그림이 깨지므로 아래를 정확히 지켜라.

[루트]
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 H" width="880" height="H"
     font-family="'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Segoe UI',sans-serif"
     role="img" aria-labelledby="t d">
- 폭은 예외 없이 880 이다. 높이 H 만 내용에 맞춰 정한다 (기존 값은 340~1020 범위).
- width/height 속성값은 viewBox 의 값과 반드시 같아야 한다.

[필수 순서]
1. <title id="t">…</title>  — 한국어 제목
2. <desc id="d">…</desc>    — 한국어 한 문장 설명
3. <rect width="880" height="H" fill="#ffffff"/>  — 전면 흰 배경. 없으면 다크 테마에서 글자가 사라진다
4. <defs> 안에 화살표 마커 (필요하면)
5. 도형

[팔레트] 이 색만 쓴다
  글자 #1f2933 / 흐린 글자 #52606d / 테두리 #9aa5b1 / 배경 #ffffff
  파랑 #2563eb + 면 #eff6ff · 빨강 #dc2626 + 면 #fef2f2 · 초록 #059669 + 면 #ecfdf5
  보라 #7c3aed + 면 #f5f3ff · 주황 #d97706 + 면 #fffbeb · 중립 면 #f8fafc

[치수 관례] 박스는 rx="4" ry="4", stroke-width="2".
  본문 글자 font-size="14", 제목 17, 라벨·범례 11~11.5.

[금지] GitHub 이 걸러내므로 절대 쓰지 마라.
  <script> <foreignObject> <style> <image> <iframe> <a> <animate*>
  on* 이벤트 속성, javascript:, @import, 외부 URL(http/https) 참조, CSS 클래스, 외부 폰트

[한글 폭 계산] 너는 글자를 실측할 수 없다. font-size="14" 기준으로
  한글 한 글자 ≈ 14px, 영문·숫자 한 글자 ≈ 8px 로 잡고 박스 폭을 정해라.
  좌우 여백을 각 12px 씩 더해라. 이걸 안 하면 글자가 박스를 넘친다.

[출력] SVG 문서만 낸다. <svg 로 시작해 </svg> 로 끝난다.
  설명 문장도, 코드 펜스도 붙이지 마라.`

const TEXT_SYSTEM = `너는 한국어 기술 문서(마크다운)의 한 구간을 고쳐 쓴다.

[문체] 이 저장소는 해라체 평서문을 쓴다. "~한다", "~이다". 존댓말·구어체로 바꾸지 마라.
[형식] GFM 이다. 표 문법, heading 레벨, 목록 기호, 들여쓰기를 그대로 지켜라.
[범위] 지시받은 구간만 고친다. 앞뒤 문맥은 참고용이지 출력 대상이 아니다.
[금지] <!-- --> 주석을 새로 만들거나 지우지 마라. 코드 펜스 개수를 바꾸지 마라.
       ![](...) 이미지 참조를 건드리지 마라. 이 셋 중 하나라도 어기면 문서가 깨진다.

[출력] 구간을 대체할 마크다운만 낸다. 설명도, 감싸는 코드 펜스도 붙이지 마라.
       (원래 구간 자체가 코드 펜스였다면 그때는 펜스를 포함해서 낸다.)
지시를 만족시킬 수 없으면 구간을 그대로 돌려줘라.`

/** SVG 재생성 메시지 */
export function buildSvgMessages({ diagramId, docPath, section, ascii, currentSvg, instruction }) {
  const parts = [
    `# 대상`,
    `다이어그램 id: ${diagramId}`,
    `문서: ${docPath}`,
    '',
    `# 이 그림이 들어가는 문서 문맥`,
    '```markdown',
    section || '(문맥 없음)',
    '```',
  ]

  if (ascii) {
    parts.push(
      '',
      '# 이 그림이 대체한 원본 ASCII 다이어그램',
      '이 그림의 정답은 아래 ASCII 다. 구조를 바꾸지 말고 표현만 다듬어라.',
      '```',
      ascii,
      '```',
    )
  } else {
    parts.push('', '# 원본 ASCII', '이 그림은 ASCII 를 옮긴 것이 아니라 직접 설계한 것이다. 대응하는 원본이 없다.')
  }

  parts.push(
    '',
    '# 현재 SVG',
    currentSvg,
    '',
    '# 지시',
    instruction,
    '',
    '위 지시에 따라 고친 SVG 전문을 내라.',
  )

  return [
    { role: 'system', content: HOUSE_STYLE },
    { role: 'user', content: parts.join('\n') },
  ]
}

/**
 * 본문 구간 편집 메시지.
 * 고칠 구간은 문맥 안에 «SEL»…«/SEL» 로 표시한다.
 * 줄 번호로 지목하면 모델이 자주 잘못 센다 — 문자 표식이 훨씬 정확하다.
 */
export function buildTextMessages({ docPath, contextBefore, target, contextAfter, selected, instruction }) {
  const parts = [
    `# 문서`,
    docPath,
    '',
    '# 문맥 (참고용, 출력 대상 아님)',
    '```markdown',
    contextBefore,
    '«SEL»',
    target,
    '«/SEL»',
    contextAfter,
    '```',
  ]

  if (selected && selected.trim() && selected.trim() !== target.trim()) {
    parts.push(
      '',
      '# 사용자가 실제로 드래그한 부분',
      '구간 전체를 돌려주되, 아래 부분에 초점을 맞춰 고쳐라. 나머지는 되도록 그대로 둔다.',
      '```',
      selected.trim(),
      '```',
    )
  }

  parts.push(
    '',
    '# 지시',
    instruction,
    '',
    '«SEL»…«/SEL» 사이 구간을 대체할 마크다운만 내라. 표식 자체는 출력에 포함하지 마라.',
  )

  return [
    { role: 'system', content: TEXT_SYSTEM },
    { role: 'user', content: parts.join('\n') },
  ]
}

export function aiStatus() {
  return {
    configured: cfg.key.length > 0,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    modelSvg: cfg.modelSvg,
  }
}

/**
 * chat/completions 를 스트리밍으로 부른다.
 * @returns {Promise<string>} 이어붙인 전체 응답
 */
export async function streamChat(messages, { model, signal, onDelta, temperature = 0.2 } = {}) {
  if (!cfg.key) {
    const e = new Error(
      'OPENAI_API_KEY 가 없다. tools/docs-studio/.env 에 넣거나 환경변수로 넘길 것.',
    )
    e.code = 'NO_KEY'
    throw e
  }

  const timeout = AbortSignal.timeout(cfg.timeoutMs)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let res
  try {
    res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cfg.key}`,
      },
      body: JSON.stringify({
        model: model || cfg.model,
        messages,
        temperature,
        stream: true,
      }),
      signal: combined,
    })
  } catch (err) {
    if (err.name === 'TimeoutError') throw new Error(`응답이 ${cfg.timeoutMs}ms 안에 오지 않았다`)
    if (err.name === 'AbortError') throw err
    throw new Error(`${cfg.baseUrl} 에 연결하지 못했다: ${err.message}`)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API 오류 ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 500)}` : ''}`)
  }

  let full = ''
  let buf = ''
  const decoder = new TextDecoder()

  for await (const chunk of res.body) {
    buf += decoder.decode(chunk, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const payload = t.slice(5).trim()
      if (payload === '[DONE]') continue
      let json
      try {
        json = JSON.parse(payload)
      } catch {
        continue
      }
      if (json.error) throw new Error(`API 오류: ${json.error.message || JSON.stringify(json.error)}`)
      const delta = json.choices?.[0]?.delta?.content
      if (delta) {
        full += delta
        onDelta?.(delta)
      }
    }
  }

  if (full.trim() === '') throw new Error('모델이 빈 응답을 냈다')
  return full
}

export { cfg as aiConfig }
