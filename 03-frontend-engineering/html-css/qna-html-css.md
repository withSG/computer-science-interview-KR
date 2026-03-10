# HTML/CSS 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. DOCTYPE이란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
DOCTYPE은 HTML 문서가 어떤 버전으로 작성되었는지 브라우저에 알리는 선언입니다. HTML5에서는 `<!DOCTYPE html>`로 간단하게 선언합니다. DOCTYPE 선언이 없으면 브라우저가 **쿼크 모드(Quirks Mode)**로 동작하여 오래된 브라우저 방식으로 렌더링하고, 선언이 있으면 **표준 모드(Standards Mode)**로 W3C 스펙에 맞게 렌더링합니다.

### 쿼크 모드 vs 표준 모드

| 구분 | 쿼크 모드 | 표준 모드 |
|------|----------|----------|
| DOCTYPE | 없음 | 있음 |
| 박스 모델 | IE 방식 (border 포함) | W3C 방식 (content만) |
| 렌더링 | 구형 브라우저 호환 | W3C 스펙 준수 |
| 권장 | X | O |

```html
<!-- HTML5 DOCTYPE 선언 -->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
  </head>
</html>
```

### 면접관이 주목하는 포인트
- DOCTYPE의 역할과 생략 시 발생하는 문제를 아는지
- 쿼크 모드와 표준 모드의 차이를 설명할 수 있는지

### 꼬리 질문 대비
- "쿼크 모드에서 박스 모델이 어떻게 다른가요?"
  → 쿼크 모드에서는 width/height에 border와 padding이 포함되지만, 표준 모드에서는 content 영역만 해당

</details>

---

## Q2. meta 태그에 대해 설명해주세요. ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
meta 태그는 HTML 문서가 어떤 내용을 담고 있고, 키워드가 무엇이며, 누가 만들었는지에 대한 정보를 담는 태그입니다. 주요 속성으로 **charset(문자 집합)**, **name(메타 정보 형태)**, **content(실제 메타 데이터)**가 있습니다. 검색 엔진은 `name="description"`의 content를 검색 결과에 표시하므로 SEO에 중요합니다.

### 주요 meta 태그 예시

```html
<!-- 문자 인코딩 -->
<meta charset="UTF-8" />

<!-- SEO를 위한 설명 -->
<meta name="description" content="페이지 설명" />

<!-- SEO를 위한 키워드 -->
<meta name="keyword" content="HTML, CSS, 면접" />

<!-- 반응형 뷰포트 설정 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- 문서 작성자 -->
<meta name="author" content="작성자 이름" />
```

### 면접관이 주목하는 포인트
- charset, name, content 속성의 역할을 구분하는지
- SEO와 viewport 설정에 meta 태그가 어떻게 활용되는지 아는지

### 꼬리 질문 대비
- "viewport meta 태그가 없으면 어떻게 되나요?"
  → 모바일 브라우저가 데스크톱 화면 너비로 렌더링하여 작은 화면에 맞게 축소 표시됨

</details>

---

## Q3. 웹 표준이란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
웹 표준은 W3C(World Wide Web Consortium)에서 정의한 웹 상에서 표준적으로 사용되는 기술 규격입니다. 웹사이트를 어떤 운영체제나 브라우저에서 보더라도 동일하게 보이도록 맞추는 것을 목표로 합니다. 최신 웹 표준 버전은 **HTML5**와 **CSS3**이며, 다양한 브라우저, 모바일 기기, 장애인 지원 프로그램에서도 호환이 가능해 접근성이 향상됩니다.

### 웹 표준의 장점
- 브라우저/디바이스 간 일관된 표시
- 검색 엔진 최적화(SEO) 향상
- 접근성 향상 (장애인, 고령자 포함)
- 유지보수 용이성

### 면접관이 주목하는 포인트
- W3C의 역할과 표준화 목적을 이해하는지
- 웹 표준과 웹 접근성의 관계를 아는지

### 꼬리 질문 대비
- "HTML5에서 추가된 주요 기능은?"
  → canvas 태그, 시멘틱 태그, 멀티미디어 태그(video/audio), 로컬 스토리지 등

</details>

---

## Q4. 웹 접근성이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
웹 접근성은 **모든 사람(비장애인, 장애인, 노인 등)이 차별 없이 웹 사이트를 자유롭게 이용할 수 있게 하는 권리**입니다. WCAG(Web Content Accessibility Guidelines)를 준수하여 구현합니다. 특정 대상에 한정되지 않고 모든 사용자가 불편함 없이 웹을 사용할 수 있어야 한다는 원칙입니다.

### 웹 접근성 구현 방법

| 방법 | 설명 |
|------|------|
| alt 텍스트 | 이미지에 대체 텍스트 제공 |
| label 태그 | input에 적절한 레이블 연결 |
| 선형 구조 | 위에서 아래로 읽을 수 있는 구조 |
| heading 순서 | h1~h6 순차적 사용 |
| 자막/대본 | 동영상 콘텐츠에 대체 수단 제공 |

```html
<!-- 이미지 대체 텍스트 -->
<img src="logo.png" alt="회사 로고" />

<!-- input에 레이블 연결 -->
<label for="username">사용자 이름</label>
<input type="text" id="username" name="username" />

<!-- 명확한 헤딩 구조 -->
<h1>메인 제목</h1>
  <h2>섹션 제목</h2>
    <h3>소제목</h3>
```

### 면접관이 주목하는 포인트
- 접근성의 개념과 중요성을 이해하는지
- 실제 마크업에서 접근성을 어떻게 구현하는지 아는지

### 꼬리 질문 대비
- "스크린 리더 사용자를 위해 주의할 점은?"
  → heading 단계를 건너뛰지 않아야 하고, aria 속성을 활용하여 의미를 명확히 전달

</details>

---

## Q5. 시멘틱 태그란 무엇이고 왜 사용하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
시멘틱 태그(Semantic Element)는 HTML 문서에 **추가적인 의미**를 부여하는 태그입니다. `<div>`, `<span>` 같은 무의미한 태그와 달리 콘텐츠의 역할과 구조를 명확히 나타냅니다. SEO 향상, 접근성 향상, 코드 가독성 개선의 이점이 있으며, 검색 엔진과 스크린 리더가 문서 구조를 쉽게 파악할 수 있습니다.

### 주요 시멘틱 태그

| 태그 | 역할 |
|------|------|
| `<header>` | 페이지/섹션의 헤더 |
| `<nav>` | 내비게이션 링크 모음 |
| `<section>` | 여러 중심 내용을 감싸는 공간 |
| `<article>` | 독립적으로 의미 있는 콘텐츠 |
| `<aside>` | 사이드에 위치하는 보조 콘텐츠 |
| `<footer>` | 페이지/섹션의 푸터 |
| `<main>` | 페이지의 주요 콘텐츠 |

### 면접관이 주목하는 포인트
- 시멘틱 태그와 `<div>` 사용의 차이를 설명할 수 있는지
- SEO, 접근성과의 연관성을 아는지

### 꼬리 질문 대비
- "section과 article의 차이는?"
  → article은 독립적으로 의미가 통하는 콘텐츠(뉴스 기사, 블로그 포스트), section은 페이지의 관련 콘텐츠 묶음

</details>

---

## Q6. SEO란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
SEO(Search Engine Optimization, 검색 엔진 최적화)는 검색 엔진이 웹페이지를 수집·분석하는 방식에 맞게 웹페이지를 구성하여, **검색 결과 상위에 노출**되도록 하는 행위입니다. 검색 엔진은 HTML 태그를 분석하므로, 시멘틱 마크업이 SEO에 직접적인 영향을 미칩니다.

### SEO 향상 방법

| 방법 | 설명 |
|------|------|
| 시멘틱 태그 | 콘텐츠 구조를 명확히 전달 |
| meta description | 검색 결과에 표시될 설명 작성 |
| meta keywords | 핵심 키워드 등록 |
| HTTPS | 보안 사이트로 신뢰도 향상 |
| 페이지 속도 | 빠른 로딩 속도 |
| 반응형 웹 | 모바일 최적화 |

### 면접관이 주목하는 포인트
- SEO와 HTML 구조의 관계를 이해하는지
- 실제 SEO 개선 방법을 구체적으로 아는지

### 꼬리 질문 대비
- "SPA에서 SEO가 어려운 이유는?"
  → 클라이언트 사이드 렌더링은 초기 HTML이 비어있어 검색 엔진 크롤러가 콘텐츠를 인식하기 어려움. SSR/SSG로 해결 가능

</details>

---

## Q7. 크로스 브라우징이란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
크로스 브라우징은 **다른 웹 브라우저에서도 정확하고 일관성 있게 동작**하는 것을 말합니다. Chrome, Firefox, Safari, Edge 등 브라우저마다 렌더링 엔진이 다르기 때문에 CSS나 JavaScript 동작 방식에 차이가 있을 수 있습니다. 가능한 한 광범위한 사용자가 동일한 경험을 할 수 있도록 하는 것이 목표입니다.

### 크로스 브라우징 해결 방법

| 방법 | 설명 |
|------|------|
| Polyfill | 최신 기능을 구형 브라우저에서도 사용 가능하게 구현 |
| Autoprefixer | CSS 벤더 프리픽스 자동 추가 |
| Babel | 최신 JS 문법을 구형 브라우저 호환 코드로 변환 |
| caniuse.com | 브라우저 호환성 확인 |
| Reset CSS | 브라우저 기본 스타일 초기화 |

### 면접관이 주목하는 포인트
- 크로스 브라우징 문제의 원인을 이해하는지
- 실제 해결 도구와 방법을 알고 있는지

### 꼬리 질문 대비
- "Polyfill과 Transpile의 차이는?"
  → Polyfill은 없는 기능을 코드로 구현하는 것, Transpile은 코드 문법을 변환하는 것

</details>

---

## Q8. SVG란 무엇이고 장단점은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
SVG(Scalable Vector Graphics)는 **벡터 기반의 이미지 형식**으로, PNG/JPG 같은 픽셀 기반 이미지와 달리 수학적 공식으로 이미지를 표현합니다. XML 포맷으로 작성되어 CSS와 JavaScript로 조작이 가능하며, 크기를 아무리 키워도 깨지지 않아 웹에서 아이콘, 로고 등에 자주 사용됩니다.

### SVG 장단점

| 구분 | 내용 |
|------|------|
| 장점 | 무한 확장 가능 (해상도 독립적) |
| 장점 | 용량이 작음 |
| 장점 | CSS/JS로 스타일 및 동작 조작 가능 |
| 장점 | 텍스트 에디터로 편집 가능 |
| 단점 | 복잡한 이미지일수록 파일 크기 증가 |
| 단점 | 복잡한 SVG는 렌더링 성능 저하 |

### 면접관이 주목하는 포인트
- 벡터와 비트맵 이미지의 차이를 이해하는지
- SVG의 적절한 사용 사례를 아는지

### 꼬리 질문 대비
- "SVG와 Canvas의 차이는?"
  → SVG는 벡터 기반, DOM 요소로 이벤트 처리 가능. Canvas는 비트맵 기반, 픽셀 단위 조작, 게임·복잡한 그래픽에 적합

</details>

---

## Q9. CSS display 속성의 종류와 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSS `display` 속성은 요소가 어떻게 배치되는지를 결정합니다. `block`은 줄바꿈과 전체 너비 차지, `inline`은 콘텐츠 너비만 차지하고 width/height 미적용, `inline-block`은 줄바꿈 없이 width/height 적용 가능, `none`은 요소를 완전히 숨겨 공간도 차지하지 않습니다.

### display 속성 비교

| 값 | 줄바꿈 | 너비 | width/height | 예시 태그 |
|----|--------|------|:------------:|----------|
| block | O | 전체 | 적용 | div, p, h1 |
| inline | X | 콘텐츠 | 미적용 | span, a, strong |
| inline-block | X | 콘텐츠 | 적용 | img, input |
| none | - | - | - | - |

### display:none vs visibility:hidden

| 구분 | display:none | visibility:hidden |
|------|:------------:|:-----------------:|
| 화면 표시 | 숨김 | 숨김 |
| 공간 차지 | X (제거됨) | O (유지됨) |
| 이벤트 | X | X |

### 면접관이 주목하는 포인트
- 각 display 값의 특성과 차이를 정확히 구분하는지
- display:none과 visibility:hidden의 레이아웃 차이를 아는지

### 꼬리 질문 대비
- "opacity:0은 display:none, visibility:hidden과 어떻게 다른가요?"
  → opacity:0은 투명하게만 보일 뿐 공간도 유지되고 이벤트도 동작함

</details>

---

## Q10. CSS position 속성을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSS `position` 속성은 요소의 배치 방법을 결정합니다. `static`은 기본값으로 일반 흐름에 따라 배치되고, `relative`는 원래 위치 기준으로 이동하며, `absolute`는 가장 가까운 positioned 부모 기준으로 배치됩니다. `fixed`는 뷰포트 기준으로 스크롤해도 고정되고, `sticky`는 스크롤 임계점에서 fixed처럼 고정됩니다.

### position 속성 비교

| 값 | 기준 | 일반 흐름 | 스크롤 영향 |
|----|------|:--------:|:---------:|
| static | 기본 흐름 | O | O |
| relative | 원래 위치 | O | O |
| absolute | positioned 부모 | X | O |
| fixed | 뷰포트 | X | X (고정) |
| sticky | 스크롤 임계점 | O | 임계점 후 고정 |

### 면접관이 주목하는 포인트
- absolute의 기준이 되는 "positioned 부모"를 이해하는지
- fixed와 sticky의 차이를 정확히 아는지

### 꼬리 질문 대비
- "absolute 요소의 기준을 부모로 만들려면?"
  → 부모에 `position: relative` (또는 absolute/fixed/sticky) 설정

</details>

---

## Q11. float는 어떻게 작동하나요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
`float`는 요소를 일반 문서 흐름에서 반쪽 제거하여 지정한 방향(left/right)으로 띄우는 CSS 속성입니다. float된 요소는 페이지 흐름의 일부로 남아 다른 요소(주변 텍스트 등)에 영향을 주며, `position: absolute`와 달리 완전히 제거되지 않습니다. 부모 요소에 float 자식만 있으면 부모의 높이가 0이 되는 문제가 발생합니다.

### float 해제 방법

```css
/* 방법 1: clear 속성 */
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

/* 방법 2: overflow hidden */
.parent {
  overflow: hidden;
}
```

### 면접관이 주목하는 포인트
- float의 동작 원리와 부모 높이 문제를 이해하는지
- clearfix 패턴을 알고 있는지

### 꼬리 질문 대비
- "float 대신 현재 주로 사용하는 레이아웃 방법은?"
  → Flexbox와 Grid가 등장하면서 float는 텍스트 감싸기 등 특수 목적 외에는 잘 사용하지 않음

</details>

---

## Q12. Flexbox와 Grid의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Flexbox는 **1차원 레이아웃**(행 또는 열)에 특화되어 콘텐츠 중심의 정렬에 적합합니다. Grid는 **2차원 레이아웃**(행과 열 동시)으로 전체 페이지 레이아웃 구성에 적합합니다. 둘은 상호 보완적으로 사용하며, Grid로 전체 구조를 잡고 Flexbox로 컴포넌트 내부를 정렬하는 방식을 많이 사용합니다.

### Flexbox vs Grid 비교

| 구분 | Flexbox | Grid |
|------|---------|------|
| 차원 | 1차원 (행 또는 열) | 2차원 (행과 열) |
| 중심 | 콘텐츠 중심 | 레이아웃 중심 |
| 적합 | 네비게이션, 버튼 그룹 | 페이지 레이아웃, 카드 갤러리 |
| 브라우저 지원 | 매우 좋음 | 좋음 |

```css
/* Flexbox: 수평 정렬 */
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Grid: 2차원 레이아웃 */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

### 면접관이 주목하는 포인트
- 1차원과 2차원의 개념 차이를 이해하는지
- 각각의 적절한 사용 사례를 설명할 수 있는지

### 꼬리 질문 대비
- "Flexbox에서 flex-grow, flex-shrink, flex-basis의 역할은?"
  → grow는 남은 공간 분배 비율, shrink는 축소 비율, basis는 기본 크기

</details>

---

## Q13. 반응형 웹의 3요소는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
반응형 웹의 3요소는 **그리드 레이아웃, 가변형 이미지, 미디어 쿼리**입니다. 이 세 가지를 조합하여 다양한 화면 크기와 기기에서 최적의 사용자 경험을 제공합니다.

### 반응형 웹 3요소

| 요소 | 설명 |
|------|------|
| 그리드 레이아웃 | display:grid를 활용한 유동적 격자 레이아웃 |
| 가변형 이미지 | max-width, %, vw 등으로 화면에 맞게 크기 조정 |
| 미디어 쿼리 | 화면 크기에 따라 다른 스타일 시트 적용 |

```css
/* 가변형 이미지 */
img {
  max-width: 100%;
  height: auto;
}

/* 미디어 쿼리 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}

/* 그리드 레이아웃 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

### 면접관이 주목하는 포인트
- 3요소를 정확히 나열하고 각각의 역할을 설명할 수 있는지
- 미디어 쿼리의 동작 원리를 이해하는지

### 꼬리 질문 대비
- "모바일 퍼스트와 데스크톱 퍼스트의 차이는?"
  → 모바일 퍼스트: min-width로 점진적 확장, 데스크톱 퍼스트: max-width로 점진적 축소

</details>

---

## Q14. CSS 단위 px, em, rem의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
`px`는 절대 단위로 화면의 픽셀 수를 직접 지정합니다. `em`은 **부모 요소의 폰트 크기**를 기준으로 한 상대 단위로 중첩 시 복잡해질 수 있습니다. `rem`(root em)은 **루트(html) 요소의 폰트 크기**를 기준으로 하여 예측 가능하고 일관된 크기 지정이 가능합니다. 접근성을 위해 폰트 크기에는 rem 사용을 권장합니다.

### CSS 단위 비교

| 단위 | 기준 | 특징 |
|------|------|------|
| px | 절대값 | 고정 크기, 브라우저 폰트 설정 무시 |
| em | 부모 폰트 크기 | 중첩 시 복잡해짐 |
| rem | 루트 폰트 크기 | 예측 가능, 접근성 좋음 |
| vw | 뷰포트 너비 | 화면 너비의 % |
| vh | 뷰포트 높이 | 화면 높이의 % |
| % | 부모 요소 크기 | 유동적 레이아웃에 활용 |

### 면접관이 주목하는 포인트
- em과 rem의 기준 차이를 정확히 아는지
- 접근성 측면에서 단위 선택의 중요성을 이해하는지

### 꼬리 질문 대비
- "rem을 사용하면 접근성에 어떻게 도움이 되나요?"
  → 브라우저에서 사용자가 기본 폰트 크기를 변경했을 때 rem 단위가 이를 반영하지만, px는 무시함

</details>

---

## Q15. CSS 적용 우선순위(명시도)를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSS 명시도(Specificity)는 여러 스타일 규칙이 충돌할 때 어떤 규칙이 적용될지 결정합니다. 우선순위는 `!important > inline style > id > class/가상클래스/속성 > tag > *` 순서입니다. 같은 명시도라면 나중에 선언된 스타일이 우선 적용됩니다.

### 명시도 계산 (0, 0, 0, 0)

| 구분 | 점수 | 예시 |
|------|------|------|
| inline style | (1,0,0,0) | `style="color:red"` |
| id | (0,1,0,0) | `#header` |
| class/가상클래스/속성 | (0,0,1,0) | `.nav`, `:hover`, `[type]` |
| tag/가상요소 | (0,0,0,1) | `div`, `::before` |
| universal | (0,0,0,0) | `*` |

```css
/* 명시도: (0,0,0,1) */
p { color: blue; }

/* 명시도: (0,0,1,0) - 이 스타일 적용 */
.text { color: red; }

/* !important - 가장 높은 우선순위 */
p { color: green !important; }
```

### 면접관이 주목하는 포인트
- 명시도 계산 방법을 알고 있는지
- !important 남용의 문제점을 이해하는지

### 꼬리 질문 대비
- "!important를 피해야 하는 이유는?"
  → 명시도 체계를 무너뜨려 유지보수가 어려워지고, 나중에 덮어쓰려면 더 많은 !important가 필요해짐

</details>

---

## Q16. CSS-in-JS에 대해 설명해주세요. ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSS-in-JS는 JavaScript 코드 내에서 CSS를 작성하는 방식입니다. 대표 라이브러리로 **styled-components**와 **Emotion**이 있습니다. CSS를 컴포넌트 레벨로 추상화하여 모듈성을 높이고, 부모 요소의 CSS가 자동으로 상속되는 문제를 방지합니다. 동적 스타일링과 props 기반 스타일 변경이 용이한 장점이 있습니다.

### CSS-in-JS 장단점

| 구분 | 내용 |
|------|------|
| 장점 | 컴포넌트 단위 스코프 (전역 오염 없음) |
| 장점 | 동적 스타일 (props 기반) |
| 장점 | 부모 스타일 상속 방지 |
| 장점 | JavaScript의 모든 기능 활용 가능 |
| 단점 | 런타임 오버헤드 (스타일 주입 비용) |
| 단점 | 번들 크기 증가 |
| 단점 | SSR 설정 복잡 |

```tsx
// styled-components 예시
const Button = styled.button<{ primary?: boolean }>`
  background: ${(props) => (props.primary ? 'blue' : 'white')};
  color: ${(props) => (props.primary ? 'white' : 'blue')};
  padding: 8px 16px;
`;
```

### 면접관이 주목하는 포인트
- CSS-in-JS의 개념과 일반 CSS와의 차이를 아는지
- 장단점을 균형 있게 설명할 수 있는지

### 꼬리 질문 대비
- "CSS Modules와 CSS-in-JS의 차이는?"
  → CSS Modules는 빌드 타임에 클래스명을 해싱하여 스코프 분리, CSS-in-JS는 런타임에 스타일 주입

</details>

---

## Q17. CSS 전처리기란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSS 전처리기(Preprocessor)는 CSS를 마치 프로그래밍 언어처럼 작성할 수 있게 해주는 도구입니다. 대표적으로 **Sass(SCSS)**, **Less**, **Stylus**가 있습니다. 변수, 중첩 규칙, 믹스인(Mixin), 함수, 조건문, 반복문 등을 사용할 수 있으나, 웹에서는 CSS만 동작하므로 **빌드 시 CSS로 컴파일**이 필요합니다.

### CSS 전처리기 장단점

| 구분 | 내용 |
|------|------|
| 장점 | 변수로 값 재사용 |
| 장점 | 중첩으로 구조 명확화 |
| 장점 | 믹스인으로 코드 재사용 |
| 장점 | 조건문/반복문 사용 가능 |
| 단점 | 컴파일 과정 필요 |
| 단점 | 추가 개발 환경 설정 필요 |

```scss
// SCSS 예시
$primary-color: #3498db;
$font-size: 16px;

.nav {
  background: $primary-color;

  &__item {
    font-size: $font-size;

    &:hover {
      opacity: 0.8;
    }
  }
}
```

### 면접관이 주목하는 포인트
- 전처리기의 역할과 컴파일 필요성을 이해하는지
- CSS 변수(custom properties)와의 차이를 아는지

### 꼬리 질문 대비
- "CSS 전처리기와 CSS 변수(--var)의 차이는?"
  → CSS 변수는 런타임에 동작하고 JS로 조작 가능, 전처리기 변수는 컴파일 타임에만 존재

</details>

---

## Q18. 박스 모델(Box Model)이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSS 박스 모델은 HTML 요소가 차지하는 공간을 **content → padding → border → margin** 4개의 영역으로 정의하는 모델입니다. `box-sizing: content-box`(기본값)에서는 width/height가 content 영역만 포함하지만, `box-sizing: border-box`에서는 padding과 border까지 포함하여 크기 계산이 직관적입니다.

### box-sizing 비교

| 구분 | content-box (기본) | border-box |
|------|:-----------------:|:----------:|
| width 포함 범위 | content만 | content + padding + border |
| 직관성 | 낮음 | 높음 (권장) |

```css
/* border-box 전역 설정 (권장) */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 박스 모델 구조 */
.box {
  width: 200px;         /* content 너비 */
  padding: 20px;        /* 내부 여백 */
  border: 2px solid;    /* 테두리 */
  margin: 10px;         /* 외부 여백 */
}
```

### margin collapsing (마진 겹침)
세로 방향의 인접한 블록 요소 간 마진은 합산되지 않고 **더 큰 마진 하나만 적용**됩니다.

### 면접관이 주목하는 포인트
- content-box와 border-box의 차이를 이해하는지
- margin collapsing 현상을 아는지

### 꼬리 질문 대비
- "margin collapsing을 해결하는 방법은?"
  → overflow: hidden, padding/border 추가, BFC 생성(display: flow-root)으로 해결 가능

</details>

---

## Q19. 반응형 웹과 적응형 웹의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
반응형 웹은 **하나의 HTML**로 CSS 미디어 쿼리를 사용하여 화면 크기에 따라 유동적으로 레이아웃이 변경됩니다. 적응형 웹은 **여러 버전의 HTML**을 준비하고, 서버 또는 클라이언트에서 기기를 감지하여 해당 버전을 제공합니다. 현재는 개발 효율성과 유지보수 측면에서 반응형 웹이 주로 사용됩니다.

### 반응형 vs 적응형 비교

| 구분 | 반응형 | 적응형 |
|------|--------|--------|
| HTML 파일 수 | 1개 | 여러 개 |
| 레이아웃 변화 | 유동적 | 고정된 여러 버전 |
| 구현 방법 | 미디어 쿼리 | 기기 감지 후 분기 |
| 개발 비용 | 낮음 | 높음 |
| 최적화 정도 | 중간 | 기기별 최적화 가능 |
| 유지보수 | 쉬움 | 어려움 |

### 면접관이 주목하는 포인트
- 두 방식의 구현 방법과 장단점을 비교할 수 있는지
- 실무에서 어떤 방식을 사용하고 그 이유를 설명하는지

### 꼬리 질문 대비
- "어떤 상황에서 적응형 웹이 더 적합한가요?"
  → 모바일과 데스크톱의 UX가 완전히 다른 경우, 성능 최적화가 중요한 경우

</details>

---

## Q20. display:none과 visibility:hidden의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
`display:none`은 요소를 **레이아웃에서 완전히 제거**하여 공간도 차지하지 않습니다. `visibility:hidden`은 요소가 **보이지 않지만 공간은 유지**됩니다. `opacity:0`은 완전히 투명하게 만들지만 공간을 유지하고 이벤트도 동작합니다.

### 세 가지 숨김 방법 비교

| 속성 | 화면 표시 | 공간 차지 | 이벤트 동작 | 접근성(스크린 리더) |
|------|:--------:|:--------:|:---------:|:----------------:|
| display:none | X | X | X | 무시됨 |
| visibility:hidden | X | O | X | 무시됨 |
| opacity:0 | X (투명) | O | O | 읽힘 |

```css
/* 완전 제거 - 레이아웃 변경 발생 */
.hidden { display: none; }

/* 보이지 않지만 공간 유지 - 레이아웃 변경 없음 */
.invisible { visibility: hidden; }

/* 투명하지만 이벤트 동작 */
.transparent { opacity: 0; }
```

### 면접관이 주목하는 포인트
- 레이아웃 관점에서 세 방법의 차이를 정확히 구분하는지
- 각 방법의 적절한 사용 사례를 아는지

### 꼬리 질문 대비
- "애니메이션 처리 시 어떤 방법을 선택하나요?"
  → opacity와 visibility를 함께 사용하면 transition 애니메이션 구현 가능. display:none은 transition 불가

</details>

---

## 학습 체크리스트

- [ ] DOCTYPE의 역할과 쿼크 모드/표준 모드 차이 설명 가능
- [ ] meta 태그의 주요 속성(charset, name, content) 설명 가능
- [ ] 시멘틱 태그 종류와 사용 이유 설명 가능
- [ ] 웹 접근성 구현 방법 3가지 이상 말할 수 있음
- [ ] display 속성(block/inline/inline-block/none) 차이 설명 가능
- [ ] position 속성(static/relative/absolute/fixed/sticky) 차이 설명 가능
- [ ] Flexbox와 Grid의 차이와 적합한 사용 사례 설명 가능
- [ ] CSS 명시도 계산 방법 이해
- [ ] box-sizing: content-box와 border-box 차이 설명 가능
- [ ] display:none vs visibility:hidden vs opacity:0 차이 설명 가능
