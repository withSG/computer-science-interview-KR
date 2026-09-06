/**
 * 마스킹 유틸 — 코드 펜스·HTML 주석·인용부호처럼 "문서 자신의 산문이 아닌" 구간을
 * 공백으로 지운다. 줄 수·줄바꿈은 그대로 두므로 지운 뒤에도 줄 번호가 원문과
 * 동일하게 유지된다.
 *
 * `tools/docs-studio/scripts/lint-style.js`(register/spelling/translationese/
 * template 검사)와 `tools/docs-studio/scripts/convert-register.js`(해라체→합니다체
 * 변환기)가 함께 가져다 쓴다. 린터가 "위반 없음"이라 판정하는 텍스트와 변환기가
 * "손대지 않음"이라 판정하는 텍스트가 같은 함수에서 나와야, 변환기가 끝난 뒤
 * 린터를 검증 게이트로 신뢰할 수 있다.
 */

/**
 * 펜스 코드 블록과 HTML 주석(다이어그램 마커·ASCII 보존 주석 포함)의 내용을
 * 공백으로 지운다.
 */
export function maskFormattingArtifacts(text) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')

  // 1) HTML 주석. 코드 펜스보다 먼저 지운다 — ASCII 보존 주석 안에는 ``` 로
  //    감싼 원본 ASCII 가 들어있는데, 이걸 먼저 지워둬야 아래 펜스 검사가
  //    주석 속 ``` 를 진짜 펜스로 착각해 뒤쪽 내용까지 통째로 지우는 사고를
  //    막을 수 있다.
  let masked = text.replace(/<!--[\s\S]*?-->/g, blank)

  // 2) 펜스 코드 블록 (```lang ... ```)
  masked = masked.replace(/^([ \t]*```[^\n]*)\n([\s\S]*?)\n([ \t]*```[ \t]*)$/gm, (_m, open, body, close) => {
    return blank(open) + '\n' + blank(body) + '\n' + blank(close)
  })

  return masked
}

/** 한 줄 안의 인라인 코드 스팬(`...`)을 지운다. */
export function stripInlineCode(line) {
  return line.replace(/`[^`\n]*`/g, '')
}

/** 인용부(" ... ", 「...」, 『...』)를 통째로 지운다 — 다른 화자의 말을 옮긴 자리는
 *  문서 자신의 목소리로 보지 않는다. */
export function maskQuotedSpans(text) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  return text
    .replace(/"[\s\S]*?"/g, blank)
    .replace(/「[\s\S]*?」/g, blank)
    .replace(/『[\s\S]*?』/g, blank)
}
