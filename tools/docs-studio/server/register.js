/**
 * 합니다체 종결 판정.
 *
 * 마침표로 끝나는 평서문의 어미가 '~니다.' 계열이 아니면(해라체 '~한다.' 등) 세어 낸다.
 * `scripts/check-rewrite.js` 가 재작성 전후의 해라체 개수를 비교할 때 쓴다.
 *
 * 마침표를 요구하는 이유: 이 저장소는 한 문단을 ~110자에서 접어 쓰는 파일이 많아서,
 * 줄 끝의 '다' 만 보면 '~보다' 같은 비교 조사가 줄바꿈 자리에 걸려 오탐이 난다.
 */

import { maskQuotedSpans } from './mask.js'

// 볼드/이탤릭 마커(**, __, *, _)가 어간과 '다' 사이, '다'와 마침표 사이, 마침표 뒤에
// 끼어들어도("**주어**다.", "**중요하다**.") 종결로 본다.
const EMPHASIS_RE = '(\\*{1,2}|_{1,2})?'
export const SENTENCE_FINAL_RE = new RegExp(`([가-힣]+)${EMPHASIS_RE}다${EMPHASIS_RE}\\.${EMPHASIS_RE}(?=\\s|$)`, 'g')

/** 'X니다' 또는 'X시다'(청유형 '-ㅂ시다') 형태의 합쇼체 종결인가. 종성 ㅂ(인덱스 17)이 앞 음절에 있는지 본다. */
export function isPoliteEnding(word) {
  const n = word.length
  if (n < 2 || (word[n - 1] !== '니' && word[n - 1] !== '시')) return false
  const c = word.charCodeAt(n - 2)
  if (c < 0xac00 || c > 0xd7a3) return false
  return (c - 0xac00) % 28 === 17
}

/** 인용부와 인라인 코드를 뺀 글에서 해라체 종결 개수. */
export function countPlainEndings(text) {
  const masked = maskQuotedSpans(text).replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length))
  let n = 0
  const re = new RegExp(SENTENCE_FINAL_RE.source, 'g')
  let m
  while ((m = re.exec(masked)) !== null) {
    if (!isPoliteEnding(m[1])) n++
  }
  return n
}
