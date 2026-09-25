/**
 * OpenAI 호환 chat/completions 클라이언트와 프롬프트.
 *
 * SDK 를 쓰지 않는다. 필요한 엔드포인트가 하나뿐이고, SDK 를 넣는 순간
 * baseUrl 을 바꿔 vLLM·Ollama·사내 프록시에 붙이는 게 오히려 까다로워진다.
 * 키는 이 서버에만 있고 브라우저로 내려가지 않는다.
 */

import { ai as cfg } from './config.js'

const HOUSE_STYLE = `너는 이 저장소의 SVG 다이어그램을 그린다. 기준은 하나다.
문서를 읽는 사람이 그림을 보고 요점을 빨리, 정확히 잡는가.
다른 그림의 색·배치를 맞출 필요는 없다. 그 내용에 가장 잘 읽히는 모양을 고른다.
다만 [루트]·[필수 순서]·[금지]는 GitHub 과 이 앱에서 그림이 깨지지 않기 위한 조건이라 정확히 지켜라.

[루트]
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 H" width="880" height="H"
     font-family="'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Segoe UI',sans-serif"
     role="img" aria-labelledby="t d">
- 폭은 예외 없이 880 이다. 높이 H 만 내용에 맞춰 정한다. 글자를 줄일 바에는 높이를 늘린다.
- width/height 속성값은 viewBox 의 값과 반드시 같아야 하고, 이 순서로 붙여 둔다.

[필수 순서]
1. <title id="t">…</title>  — 한국어 제목
2. <desc id="d">…</desc>    — 그림이 보여주는 것을 한두 문장으로
3. <rect width="880" height="H" fill="#ffffff"/>  — 전면 흰 배경. 없으면 다크 테마에서 글자가 사라진다
4. <defs> 안에 화살표 마커 (필요하면)
5. 도형

[가독성 합격선]
- 글자 크기 14 이상. 본문 라벨 15~16, 강조·제목 18~20.
- 글자와 바로 밑 배경의 대비 4.5:1 이상 (24 이상이거나 18.66 이상 굵은 글자는 3:1).
  흰 바탕 위 색 글자는 진한 톤을 쓴다: 파랑 #1d4ed8, 초록 #047857, 빨강 #b91c1c, 주황·갈색 #b45309, 보라 #6d28d9.
  회색 글자는 #4b5563 보다 연하게 가지 않는다. 연한 면색 위에서도 같은 기준이다.
- 글자가 캔버스·박스 밖으로 나가거나, 글자끼리 겹치거나, 선·도형이 글자를 가리거나 관통하면 안 된다.
  화살표 위 라벨은 선에서 비켜 두거나 라벨 뒤에 흰 면을 깐다.
- 색만으로 의미를 싣지 않는다. 색으로 구분했다면 라벨이나 범례를 함께 둔다.
- 읽는 순서가 한눈에 보여야 한다. 흐름은 한 방향으로, 단계가 있으면 번호를 붙인다.

[내용] 원본 ASCII 와 현재 SVG 의 라벨·수치·관계·순서를 빠짐없이 옮긴다. 본문에 없는 사실을 더하지 않는다.

[금지] GitHub 이 걸러내므로 절대 쓰지 마라.
  <script> <foreignObject> <style> <image> <iframe> <a> <animate*> <set>
  on* 이벤트 속성, javascript:, @import, 외부 URL(http/https) 참조, CSS 클래스, 외부 폰트

[한글 폭 계산] 너는 글자를 실측할 수 없다. font-size f 기준으로
  한글 한 글자 ≈ 1.0f, 영문·숫자 ≈ 0.6f, 공백 ≈ 0.3f 로 잡고 박스 폭을 정해라.
  박스 안 글자 좌우 여백은 각 12 이상, 캔버스 가장자리 여백은 24 이상. 이걸 안 하면 글자가 박스를 넘친다.

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
