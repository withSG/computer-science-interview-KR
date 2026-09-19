/**
 * 재작성 전후 비교 — 산문 바깥이 그대로이고, 산문 속 사실 부품이 남아 있는지 본다.
 *
 * `scripts/check-rewrite.js`(git 기준 전수 검사)와 `scripts/humanize-prose.js`(되꽂기
 * 게이트)가 같은 판정을 쓰도록 여기에 둔다. 두 입력은 모두 LF 로 정규화된 문자열이다.
 *
 * 문체를 감시하지 않는다. 산문이 어떻게 바뀌었는지는 상관하지 않는다.
 *
 *   오류  뼈대 · 숫자 · 영문 토큰 · 인라인 코드 · 링크 · ⭐/✅/❎ · 해라체 증가 ·
 *         비표준 표기 증가 · 분량 급변 · (voice 옵션) 금지 구문 증가
 *   경고  영문 토큰/코드/볼드 개수 · 엠대시 급변 · 분량 변화 · (voice) 상한 초과
 */

import {
  segment,
  skeletonEntries,
  proseFenceIndexes,
  freeBlocks,
  signature,
  diffCounts,
  rhythm,
} from './prose.js'
import { countPlainEndings } from './register.js'

// 분량이 이 범위 밖이면 오류다. 경고 범위(opts.volume)보다 넓게 잡는다.
const VOLUME_ERROR = [0.6, 1.5]
const FILE_VOLUME_ERROR = [0.7, 1.4]
const MIN_CHARS_FOR_RATIO = 120

const SPELLING_BAD = ['디렉토리', '쓰레드', '메세지', '트랜색션', '어플리케이션', '컨텐츠']

const TRANSLATIONESE = [
  ['에 대한', (t) => t.split('에 대한').length - 1],
  ['를/을 통해', (t) => t.split('를 통해').length + t.split('을 통해').length - 2],
  ['핵심은', (t) => t.split('핵심은').length - 1],
]

// 금지 구문. 하나라도 늘면 오류다(줄어들거나 그대로면 된다).
const KEEP_SYMBOLS = new Set(['⭐', '✅', '❎'])
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}]/gu
const VOICE_S1 = [
  ['를/을 통해(서)', /[를을] 통해/g],
  ['에 대해(서)/대하여', /에 대(?:해|하여)/g],
  ['에 있어(서)', /에 있어/g],
  ['되어지다', /되어지/g],
  ['지게 됩니다', /지게 (?:됩니다|되었)/g],
  ['라고 할/볼 수 있', /라고 (?:할|볼) 수 있/g],
  ['결론적으로', /결론적으로/g],
  ['요약하면', /요약하면/g],
  ['정리하자면', /정리하자면/g],
  ['이러한', /이러한/g],
  ['이와 같은', /이와 같은/g],
  ['매우 중요', /매우 중요/g],
  ['간과할 수 없', /간과할 수 없/g],
  ['느낌표', /!/g],
  ['이모지', null], // 아래에서 따로 센다
]
// 문서당 상한. 원래부터 넘던 문서는 늘리지만 않으면 된다. 경고만 한다.
const VOICE_S2 = [
  ['~적인', /적인/g, 3],
  ['~적으로', /적으로/g, 6],
  ['~수 있습니다', /수 있습니다/g, 6],
  ['~것입니다', /것입니다/g, 3],
  ['~때문입니다', /때문입니다/g, 4],
  ['~기반으로', /기반으로/g, 1],
]

const count = (t, re) => (t.match(re) || []).length
const stripCode = (t) => t.replace(/`[^`\n]*`/g, ' ')
const countEmoji = (t) => (t.match(EMOJI_RE) || []).filter((c) => !KEEP_SYMBOLS.has(c)).length
const fmtList = (xs, max = 6) => xs.slice(0, max).join(', ') + (xs.length > max ? ` … 외 ${xs.length - max}` : '')

/**
 * @param {string} before  재작성 전 (LF)
 * @param {string} after   재작성 후 (LF)
 * @param {{volume?:[number,number], voice?:boolean}} [opts]
 * @returns {{errors:Array<{code:string,msg:string,line?:number,unit?:number}>, warns:Array<...>, notes:string[], metrics:object|null}}
 */
export function checkText(before, after, opts = {}) {
  const volume = opts.volume || [0.75, 1.35]
  const errors = []
  const warns = []
  const notes = []
  const err = (code, msg, line, unit) => errors.push({ code, msg, line, unit })
  const warn = (code, msg, line, unit) => warns.push({ code, msg, line, unit })

  const bb = segment(before)
  const ab = segment(after)
  const pf = proseFenceIndexes(bb) // after 는 before 의 판정을 넘겨받는다
  const eb = skeletonEntries(bb, pf)
  const ea = skeletonEntries(ab, pf)

  // --- 뼈대 ---
  let firstDiff = -1
  for (let i = 0; i < Math.max(eb.length, ea.length); i++) {
    if (!eb[i] || !ea[i] || eb[i].token !== ea[i].token) { firstDiff = i; break }
  }
  if (firstDiff !== -1) {
    const tokB = eb[firstDiff]?.token
    const tokA = ea[firstDiff]?.token
    const kindOf = (t) => (t ? t.split('\0')[0] : '없음')
    const lineA = (ea[firstDiff]?.block.start ?? ab[ab.length - 1]?.end ?? 0) + 1
    const restB = eb.slice(firstDiff).map((e) => e.token)
    const restA = ea.slice(firstDiff).map((e) => e.token)
    let what
    if (restA.length === restB.length + 1 && restA.slice(1).every((t, k) => t === restB[k])) {
      what = `${kindOf(tokA)} 블록이 새로 끼어들었다`
    } else if (restB.length === restA.length + 1 && restB.slice(1).every((t, k) => t === restA[k])) {
      what = `${kindOf(tokB)} 블록이 사라졌다`
    } else if (kindOf(tokB) === kindOf(tokA) && kindOf(tokB) !== 'PROSE') {
      const lb = eb[firstDiff].block.lines
      const la = ea[firstDiff].block.lines
      let k = 0
      while (k < lb.length && k < la.length && lb[k] === la[k]) k++
      what = `${kindOf(tokB)} 블록 내용이 바뀌었다 — 원문 ${JSON.stringify((lb[k] ?? '(끝)').slice(0, 60))} → ${JSON.stringify((la[k] ?? '(끝)').slice(0, 60))}`
    } else {
      what = `${kindOf(tokB)} 자리에 ${kindOf(tokA)} 가 왔다`
    }
    err('skeleton', `뼈대가 다르다 (블록 ${firstDiff + 1}/${eb.length}) — ${what}`, lineA)
    // 뼈대가 어긋나면 덩어리를 짝지을 수 없다. 나머지 검사는 건너뛴다.
    return { errors, warns, notes, metrics: null }
  }

  // --- 짝지은 자유 덩어리 ---
  const fb = freeBlocks(bb, pf)
  const fa = freeBlocks(ab, pf)
  let charsB = 0
  let charsA = 0
  for (let k = 0; k < fb.length; k++) {
    const sb = signature(fb[k].text)
    const sa = signature(fa[k].text)
    const line = fa[k].block.start + 1
    charsB += sb.chars
    charsA += sa.chars

    const num = diffCounts(sb.numbers, sa.numbers)
    if (!num.same) {
      err('numbers', `수치가 바뀌었다 — 사라짐 [${fmtList(num.gone)}] 새로 생김 [${fmtList(num.added)}] 개수 변화 [${fmtList(num.changed)}]`, line, k)
    }

    const lat = diffCounts(sb.latin, sa.latin)
    if (lat.gone.length || lat.added.length) {
      err('latin', `영문 토큰이 바뀌었다 — 사라짐 [${fmtList(lat.gone)}] 새로 생김 [${fmtList(lat.added)}]`, line, k)
    } else if (lat.changed.length) {
      warn('latin-count', `영문 토큰 개수 변화 [${fmtList(lat.changed)}]`, line, k)
    }

    const code = diffCounts(sb.codeSpans, sa.codeSpans)
    if (code.gone.length || code.added.length) {
      err('code', `인라인 코드가 바뀌었다 — 사라짐 [${fmtList(code.gone)}] 새로 생김 [${fmtList(code.added)}]`, line, k)
    } else if (code.changed.length) {
      warn('code-count', `인라인 코드 개수 변화 [${fmtList(code.changed)}]`, line, k)
    }

    if (sb.links.join('\0') !== sa.links.join('\0')) {
      err('links', `링크 목적지 순서열이 바뀌었다 — ${fmtList(sb.links)} → ${fmtList(sa.links)}`, line, k)
    }

    for (const s of Object.keys(sb.symbols)) {
      if (sb.symbols[s] !== sa.symbols[s]) err('symbol', `${s} 개수가 바뀌었다 (${sb.symbols[s]} → ${sa.symbols[s]})`, line, k)
    }
    if (sb.bold !== sa.bold) warn('bold', `볼드 개수가 바뀌었다 (${sb.bold} → ${sa.bold})`, line, k)

    // 해라체 종결은 덩어리마다 본다 — 이미 새는 덩어리에 더 얹으면 안 된다
    const pb = countPlainEndings(fb[k].text)
    const pa = countPlainEndings(fa[k].text)
    if (pa > pb) err('register', `해라체 종결이 늘었다 (${pb} → ${pa})`, line, k)

    if (sb.chars >= MIN_CHARS_FOR_RATIO) {
      const r = sa.chars / sb.chars
      const pct = `${(r * 100).toFixed(0)}% (${sb.chars} → ${sa.chars}자)`
      if (r < VOLUME_ERROR[0] || r > VOLUME_ERROR[1]) err('volume', `이 덩어리의 분량이 크게 바뀌었다: ${pct}`, line, k)
      else if (r < volume[0] || r > volume[1]) warn('volume', `이 덩어리의 분량 변화: ${pct}`, line, k)
    }
  }

  // --- 파일 단위 ---
  if (charsB >= 500) {
    const r = charsA / charsB
    if (r < FILE_VOLUME_ERROR[0] || r > FILE_VOLUME_ERROR[1]) {
      err('volume-file', `산문 전체 분량이 크게 바뀌었다: ${(r * 100).toFixed(0)}% (${charsB} → ${charsA}자)`)
    }
  }

  const allB = fb.map((f) => f.text).join('\n\n')
  const allA = fa.map((f) => f.text).join('\n\n')

  const spell = (t) => SPELLING_BAD.reduce((n, w) => n + (stripCode(t).split(w).length - 1), 0)
  if (spell(allA) > spell(allB)) err('spelling', `비표준 표기가 늘었다 (${spell(allB)} → ${spell(allA)}) — ${SPELLING_BAD.join('/')}`)

  for (const [label, counter] of TRANSLATIONESE) {
    const cb = counter(allB)
    const ca = counter(allA)
    if (ca > cb) notes.push(`'${label}' ${cb} → ${ca}`)
  }

  const dashB = allB.split('—').length - 1
  const dashA = allA.split('—').length - 1
  if (dashB >= 5 && (dashA < dashB * 0.6 || dashA > dashB * 1.4)) warn('em-dash', `엠대시가 크게 달라졌다 (${dashB} → ${dashA})`)

  if (opts.voice) {
    const pb = stripCode(allB)
    const pa = stripCode(allA)
    for (const [label, re] of VOICE_S1) {
      const cb = re ? count(pb, re) : countEmoji(pb)
      const ca = re ? count(pa, re) : countEmoji(pa)
      if (ca > cb) err('banned', `금지 구문 '${label}' 이 늘었다 (${cb} → ${ca})`)
    }
    for (const [label, re, cap] of VOICE_S2) {
      const cb = count(pb, re)
      const ca = count(pa, re)
      if (ca > cap && ca > cb) warn('cap', `'${label}' 가 상한 ${cap} 을 넘었다 (${cb} → ${ca})`)
    }
  }

  const proseOnly = (list) => list.filter((f) => f.block.kind === 'prose').map((f) => f.text)
  return {
    errors,
    warns,
    notes,
    metrics: { before: rhythm(proseOnly(fb)), after: rhythm(proseOnly(fa)), dashB, dashA, charsB, charsA, units: fb.length },
  }
}
