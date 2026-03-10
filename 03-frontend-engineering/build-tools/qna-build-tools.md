# 빌드 도구 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 모듈과 모듈 번들링이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
**모듈**은 프로그래밍 관점에서 특정 기능을 갖는 작은 코드 단위입니다. 웹팩에서는 자바스크립트뿐 아니라 HTML, CSS, 이미지, 폰트 등 웹 애플리케이션을 구성하는 모든 파일을 모듈로 봅니다. **모듈 번들링**은 이러한 수십·수백 개의 모듈 파일들을 파일 간 연관 관계를 파악하여 하나(또는 소수)의 파일로 병합·압축하는 과정입니다.

### 모듈 시스템 종류

| 시스템 | 문법 | 환경 | 특징 |
|--------|------|------|------|
| CommonJS | `require/module.exports` | Node.js | 동기 로딩 |
| AMD | `define/require` | 브라우저 | 비동기 로딩 |
| ESM | `import/export` | 브라우저/Node.js | 정적 분석 가능, 트리 쉐이킹 지원 |

### 모듈 번들링이 필요한 이유

| 이유 | 설명 |
|------|------|
| HTTP 요청 수 감소 | 파일 수가 많을수록 요청 횟수 증가 → 성능 저하 |
| 의존성 관리 | 파일 간 의존 관계를 자동으로 추적·해결 |
| 코드 최적화 | 압축, 난독화, 트리 쉐이킹 등 최적화 가능 |
| 다양한 리소스 처리 | CSS, 이미지 등을 JS와 함께 처리 |

### 면접관이 주목하는 포인트
- 모듈이 왜 필요한지(변수 스코프 문제, 의존성 관리)를 이해하는지
- 번들링이 성능에 미치는 영향을 설명할 수 있는지

### 꼬리 질문 대비
- "ESM이 CommonJS보다 좋은 점은?"
  → ESM은 정적 구조로 빌드 타임에 분석 가능하여 트리 쉐이킹이 효과적. CommonJS는 동적으로 require하여 정적 분석이 어려움

</details>

---

## Q2. Webpack이란 무엇이고 왜 사용하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Webpack은 최신 프론트엔드 프레임워크에서 가장 많이 사용되는 **모듈 번들러**입니다. 웹 애플리케이션을 구성하는 모든 자원(HTML, CSS, JS, 이미지 등)을 모듈로 보고, 이를 조합하여 병합된 결과물을 만드는 도구입니다. 등장 배경은 파일 단위 자바스크립트 모듈 관리의 필요성과 HTTP 요청 수를 줄여 성능을 개선하려는 욕구에서 비롯되었습니다.

### Webpack 사용 이점

| 이점 | 설명 |
|------|------|
| 파일 단위 스코프 | 변수 충돌 방지, 모듈별 독립 스코프 |
| 코드 스플리팅 | 필요한 시점에 코드 로딩 (lazy loading) |
| 트리 쉐이킹 | 사용하지 않는 코드 제거로 번들 크기 감소 |
| 로더/플러그인 | CSS, 이미지 등 다양한 리소스 처리 확장 |
| 개발 서버 | HMR(Hot Module Replacement)로 빠른 개발 |

### 면접관이 주목하는 포인트
- Webpack이 등장한 배경과 해결하는 문제를 설명할 수 있는지
- 코드 스플리팅과 트리 쉐이킹의 개념을 아는지

### 꼬리 질문 대비
- "Webpack 대신 Vite를 사용하는 이유는?"
  → Vite는 개발 시 ESM을 활용한 네이티브 브라우저 모듈 로딩으로 번들링 없이 빠른 HMR 제공. 프로덕션은 Rollup으로 번들링

</details>

---

## Q3. Webpack의 주요 속성(entry, output, loader, plugin)을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Webpack의 4가지 핵심 속성은 **entry(시작점), output(결과물), loader(파일 변환), plugin(결과물 최적화)**입니다. entry는 번들링의 시작 파일 경로, output은 번들 결과물의 경로와 파일명을 지정합니다. loader는 JS 외의 파일을 처리하는 변환기, plugin은 번들 최적화나 환경 변수 주입 등 번들 결과물의 형태를 바꾸는 역할을 합니다.

### 4가지 주요 속성

| 속성 | 역할 | 예시 |
|------|------|------|
| entry | 번들링 시작점 | `./src/index.js` |
| output | 번들 결과물 경로/파일명 | `./dist/bundle.js` |
| loader | JS 외 파일 처리 | css-loader, babel-loader |
| plugin | 번들 최적화, 부가 기능 | HtmlWebpackPlugin |

```js
// webpack.config.js 기본 구조
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 1. entry: 번들링 시작점
  entry: './src/index.js',

  // 2. output: 번들 결과물 설정
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  // 3. loader: JS 외 파일 처리
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // 오른쪽부터 적용
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },

  // 4. plugin: 번들 최적화, 부가 기능
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
```

### 면접관이 주목하는 포인트
- loader와 plugin의 역할 차이를 명확히 구분하는지
- css-loader와 style-loader의 순서와 역할을 아는지

### 꼬리 질문 대비
- "css-loader와 style-loader의 차이는?"
  → css-loader는 CSS 파일을 JS 모듈로 변환, style-loader는 변환된 CSS를 DOM에 `<style>` 태그로 주입. MiniCssExtractPlugin으로 별도 CSS 파일 추출도 가능

</details>

---

## Q4. Babel이란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Babel은 **JavaScript 트랜스파일러**로, 최신 JavaScript 문법(ES6+)을 구형 브라우저에서도 동작하는 코드로 변환해줍니다. 트랜스파일(Transpile)은 비슷한 수준의 언어로 변환하는 것으로, 소스 코드를 다른 소스 코드로 바꾸는 과정입니다. **프리셋(Preset)**은 자주 사용하는 플러그인의 묶음이며, 플러그인 방식으로 기능을 확장할 수 있습니다.

### Babel 동작 예시

```js
// Babel 입력: ES2015 화살표 함수
[1, 2, 3].map((n) => n + 1);

// Babel 출력: ES5 호환 코드
[1, 2, 3].map(function (n) {
  return n + 1;
});
```

### 주요 Babel 프리셋

| 프리셋 | 설명 |
|--------|------|
| `@babel/preset-env` | 타겟 브라우저에 맞게 ES6+ 변환 |
| `@babel/preset-react` | JSX 문법 변환 |
| `@babel/preset-typescript` | TypeScript 문법 제거 (타입 체크는 미수행) |

```json
// .babelrc 설정 예시
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.25%, not dead"
    }],
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties"
  ]
}
```

### 면접관이 주목하는 포인트
- 트랜스파일과 컴파일의 차이를 아는지
- Babel과 TypeScript 컴파일러의 차이를 이해하는지

### 꼬리 질문 대비
- "Babel과 TypeScript 컴파일러(tsc)의 차이는?"
  → Babel은 타입 검사 없이 빠르게 코드 변환만 수행. tsc는 타입 검사와 변환을 함께 수행. 실무에서는 tsc로 타입 검사 + Babel로 변환을 조합하기도 함

</details>

---

## Q5. 트리 쉐이킹(Tree Shaking)이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
트리 쉐이킹은 번들링 시 **사용하지 않는 코드(Dead Code)를 제거**하는 최적화 기법입니다. 나무를 흔들면 죽은 잎이 떨어지는 것에 비유한 이름입니다. ESM(ES Modules)의 **정적 구조** 덕분에 빌드 타임에 어떤 코드가 실제로 사용되는지 분석이 가능하여 구현됩니다. CommonJS는 동적 require로 정적 분석이 어려워 트리 쉐이킹이 제한적입니다.

### 트리 쉐이킹 동작 원리

```js
// utils.js - 여러 함수가 export됨
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; } // 사용 안 됨
export function multiply(a, b) { return a * b; } // 사용 안 됨

// main.js - add만 import
import { add } from './utils.js';
console.log(add(1, 2));

// 번들 결과: add만 포함, subtract와 multiply는 제거됨
```

### 트리 쉐이킹 적용 조건

| 조건 | 설명 |
|------|------|
| ESM 사용 | import/export 문법 사용 필수 |
| sideEffects 설정 | `package.json`의 sideEffects 필드 설정 |
| production 모드 | Webpack production 모드에서 자동 적용 |

```json
// package.json - sideEffects 설정
{
  "sideEffects": false,       // 모든 파일에 트리 쉐이킹 적용
  // 또는
  "sideEffects": ["*.css"]    // CSS 파일은 제외
}
```

### 면접관이 주목하는 포인트
- ESM이 트리 쉐이킹에 필요한 이유(정적 분석)를 설명할 수 있는지
- sideEffects 설정의 의미를 아는지

### 꼬리 질문 대비
- "sideEffects를 잘못 설정하면 어떤 문제가 생기나요?"
  → 전역 CSS 파일이나 폴리필처럼 import만 해도 효과가 있는 코드가 제거될 수 있음. 이런 파일은 sideEffects에 명시해야 함

</details>

---

## 학습 체크리스트

- [ ] 모듈과 모듈 번들링의 개념 설명 가능
- [ ] CommonJS, AMD, ESM의 차이 설명 가능
- [ ] Webpack의 4가지 핵심 속성(entry, output, loader, plugin) 설명 가능
- [ ] loader와 plugin의 역할 차이 구분 가능
- [ ] Babel의 역할과 preset 개념 이해
- [ ] 트리 쉐이킹의 원리와 ESM과의 관계 설명 가능
