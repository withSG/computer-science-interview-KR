/**
 * 줄바꿈·BOM 정규화.
 *
 * 이 저장소는 마크다운 244개, SVG 1073개가 전부 CRLF 다 (core.autocrlf=true).
 * markdown-it 은 내부에서 CRLF 를 LF 로 바꿔놓고 token.map 을 매기므로,
 * 파싱·오프셋 계산은 반드시 LF 로 정규화한 문자열 위에서 해야 한다.
 * 디스크로 돌아갈 때는 원래 파일이 쓰던 줄바꿈으로 되돌린다.
 * 이걸 틀리면 244개 파일이 통째로 "수정됨"으로 뜨거나 splice 가 줄을 어긋나게 자른다.
 */

const BOM = '﻿'

/**
 * 디스크에서 읽은 문자열을 LF 로 정규화한다.
 * @returns {{text: string, eol: '\r\n'|'\n', bom: boolean}}
 */
export function normalize(raw) {
  const bom = raw.startsWith(BOM)
  const body = bom ? raw.slice(1) : raw
  const crlf = body.indexOf('\r\n') !== -1
  return { text: body.replace(/\r\n/g, '\n'), eol: crlf ? '\r\n' : '\n', bom }
}

/** LF 문자열을 원래 형식으로 되돌린다. */
export function denormalize(text, { eol = '\n', bom = false } = {}) {
  const body = eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text
  return bom ? BOM + body : body
}
