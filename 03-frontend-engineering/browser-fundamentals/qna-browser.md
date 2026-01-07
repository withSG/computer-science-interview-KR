# 브라우저 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 브라우저에 URL을 입력하면 어떤 과정이 일어나나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

```
1. URL 파싱 → 프로토콜, 도메인, 경로 분리
2. DNS 조회 → 도메인을 IP 주소로 변환
3. TCP 연결 → 3-way handshake
4. HTTP 요청 → 서버에 리소스 요청
5. 응답 수신 → HTML, CSS, JS 등
6. 브라우저 렌더링 → CRP 시작
```

### 상세 과정

**1단계: DNS 조회**
```
브라우저 캐시 → OS 캐시 → 라우터 → ISP DNS → Root DNS
```

**2단계: TCP 연결 (3-way handshake)**
```
Client → SYN → Server
Client ← SYN+ACK ← Server
Client → ACK → Server
```

**3단계: HTTPS의 경우 TLS 핸드셰이크 추가**

**4단계: HTTP 요청/응답**

**5단계: 브라우저 렌더링 (CRP)**
```
HTML 파싱 → DOM
CSS 파싱 → CSSOM
       ↓
   Render Tree
       ↓
     Layout
       ↓
     Paint
       ↓
   Composite
```

### 면접관이 주목하는 포인트
- 전체 흐름을 체계적으로 설명하는지
- 각 단계의 역할을 정확히 아는지

### 꼬리 질문 대비
- "DNS 캐싱은 어디서 일어나나요?"
  → 브라우저 → OS → 라우터 → ISP 순서로 캐시 확인
- "HTTP/2와 HTTP/1.1의 차이는?"
  → 멀티플렉싱, 헤더 압축, 서버 푸시

</details>

---

## Q2. Critical Rendering Path(CRP)를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CRP는 브라우저가 HTML, CSS, JavaScript를 화면에 픽셀로 변환하는 과정입니다.

### CRP 단계

```
┌─────────────────────────────────────────────────────┐
│  HTML 파싱                                          │
│    ↓                                                │
│  DOM 트리 구축                                       │
│    ↓                                                │
│  CSSOM 트리 구축 ← CSS 파싱                          │
│    ↓                                                │
│  Render Tree 생성 (DOM + CSSOM)                     │
│    ↓                                                │
│  Layout (Reflow) - 요소 크기와 위치 계산              │
│    ↓                                                │
│  Paint - 픽셀로 변환                                 │
│    ↓                                                │
│  Composite - 레이어 합성                             │
└─────────────────────────────────────────────────────┘
```

### 렌더링 차단 리소스

| 리소스 | 차단 여부 | 해결책 |
|--------|----------|--------|
| CSS | 렌더링 차단 | media 쿼리, preload |
| JS (일반) | 파싱 차단 | async, defer |
| JS (async) | 다운로드 비동기 | 실행 시 차단 |
| JS (defer) | 비동기 | DOM 파싱 후 실행 |

### async vs defer

```html
<!-- async: 다운로드 완료 즉시 실행 (순서 보장 X) -->
<script async src="analytics.js"></script>

<!-- defer: DOM 파싱 완료 후 순서대로 실행 -->
<script defer src="app.js"></script>
```

### 면접관이 주목하는 포인트
- 각 단계의 역할 이해
- 렌더링 최적화 방법

### 꼬리 질문 대비
- "CSS가 렌더링 차단 리소스인 이유?"
  → CSSOM 없이는 Render Tree를 만들 수 없어서
- "async와 defer의 차이?"
  → async는 다운로드 완료 즉시 실행, defer는 DOM 파싱 완료 후 실행

</details>

---

## Q3. 리플로우(Reflow)와 리페인트(Repaint)의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Reflow (Layout) | Repaint |
|------|-----------------|---------|
| 발생 조건 | 레이아웃 변경 | 시각적 변경 |
| 영향 범위 | 전체 또는 부분 레이아웃 | 해당 요소만 |
| 비용 | 높음 | 중간 |
| 예시 | width, height, margin | color, background, visibility |

### Reflow를 발생시키는 속성

```css
/* 레이아웃 속성 - Reflow 발생 */
width, height, padding, margin, border
position, top, left, right, bottom
display, float, flex
font-size, font-family
```

### Repaint만 발생시키는 속성

```css
/* 시각적 속성 - Repaint만 발생 */
color, background-color, background-image
visibility, outline
box-shadow, border-radius
```

### 최적화 전략

**1. Reflow 최소화**
```javascript
// 나쁜 예 - 여러 번 Reflow
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 좋은 예 - 한 번에 변경
element.style.cssText = 'width:100px; height:100px; margin:10px;';
// 또는 클래스 토글
element.classList.add('new-style');
```

**2. Layout Thrashing 방지**
```javascript
// 나쁜 예 - 읽기/쓰기 반복
for (let i = 0; i < items.length; i++) {
    items[i].style.width = box.offsetWidth + 'px';  // 읽기 → 쓰기 반복
}

// 좋은 예 - 읽기 먼저, 쓰기 나중
const width = box.offsetWidth;  // 읽기 한 번
for (let i = 0; i < items.length; i++) {
    items[i].style.width = width + 'px';  // 쓰기만
}
```

### 면접관이 주목하는 포인트
- 두 개념의 차이
- 최적화 경험

### 꼬리 질문 대비
- "Layout Thrashing이란?"
  → DOM 읽기/쓰기가 반복되어 강제 동기 레이아웃이 발생하는 현상

</details>

---

## Q4. GPU 합성(Compositing)이란 무엇이며, 어떻게 활용하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
합성(Compositing)은 페이지를 여러 레이어로 나누어 GPU에서 합성하는 과정입니다. 레이아웃과 페인트를 건너뛰어 성능을 향상시킵니다.

### 렌더링 파이프라인

```
일반 속성 변경:
  Layout → Paint → Composite (모든 단계 실행)

transform/opacity 변경:
  Composite만 (GPU에서 처리)
```

### GPU 가속 속성

```css
/* GPU에서 처리되는 속성 (Reflow/Repaint 없음) */
transform: translate(), rotate(), scale()
opacity
filter
will-change
```

### will-change 활용

```css
/* 합성 레이어 생성 힌트 */
.animated-element {
    will-change: transform;
}

/* 사용 후 해제 권장 */
.animated-element.done {
    will-change: auto;
}
```

### 실전 예시: 애니메이션 최적화

```css
/* 나쁜 예 - Reflow 발생 */
.box {
    transition: left 0.3s;
}
.box:hover {
    left: 100px;
}

/* 좋은 예 - GPU 합성만 */
.box {
    transition: transform 0.3s;
}
.box:hover {
    transform: translateX(100px);
}
```

### 레이어 생성 조건
- `transform: translateZ(0)` 또는 `translate3d()`
- `will-change: transform, opacity`
- `opacity` 애니메이션
- 3D CSS 속성 (`perspective`, `transform-style: preserve-3d`)

### 주의사항
- 과도한 레이어 생성은 메모리 증가
- `will-change`는 필요한 경우에만 사용

### 면접관이 주목하는 포인트
- 왜 transform이 left보다 빠른지
- 실제 성능 최적화 경험

</details>

---

## Q5. DOM과 Virtual DOM의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Real DOM | Virtual DOM |
|------|----------|-------------|
| 위치 | 브라우저 | 메모리 (JavaScript) |
| 업데이트 | 전체 트리 재렌더링 | 변경된 부분만 |
| 성능 | 직접 조작 시 느림 | 배치 업데이트로 최적화 |
| 사용 | 순수 JavaScript | React, Vue 등 |

### DOM의 문제점

```javascript
// DOM 직접 조작 - 매번 Reflow/Repaint
for (let i = 0; i < 1000; i++) {
    document.body.innerHTML += `<div>${i}</div>`;  // 비효율적
}
```

### Virtual DOM 동작 원리

```
1. 상태 변경 발생
       ↓
2. 새로운 Virtual DOM 생성
       ↓
3. 이전 Virtual DOM과 비교 (Diffing)
       ↓
4. 변경된 부분만 Real DOM에 반영 (Reconciliation)
       ↓
5. 배치로 한 번에 업데이트
```

### Virtual DOM이 항상 빠른 것은 아님
- 단순한 변경에는 직접 DOM 조작이 더 빠를 수 있음
- Virtual DOM의 장점은 **추상화와 선언적 프로그래밍**

### 면접관이 주목하는 포인트
- Virtual DOM의 실제 이점 이해
- 단순히 "빠르다"가 아닌 정확한 이해

### 꼬리 질문 대비
- "Virtual DOM이 항상 빠른가요?"
  → 아니요, 복잡한 업데이트에서 효율적이고 단순 작업은 직접 DOM이 빠를 수 있음
- "React가 Virtual DOM을 사용하는 이유?"
  → 선언적 UI, 효율적인 배치 업데이트, 크로스 플랫폼 지원

</details>

---

## Q6. 브라우저 저장소(Cookie, LocalStorage, SessionStorage)의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Cookie | LocalStorage | SessionStorage |
|------|--------|--------------|----------------|
| 용량 | ~4KB | ~5MB | ~5MB |
| 만료 | 설정 가능 | 영구 | 탭 종료 시 |
| 서버 전송 | 자동 (매 요청) | X | X |
| 접근 | 서버 + 클라이언트 | 클라이언트만 | 클라이언트만 |
| 범위 | 도메인 전체 | 도메인 전체 | 탭/윈도우 |

### 사용 사례

```javascript
// Cookie - 인증, 세션 관리
document.cookie = "token=abc123; max-age=3600; secure; httponly";

// LocalStorage - 영구 데이터 (테마, 설정)
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');

// SessionStorage - 임시 데이터 (폼 입력, 페이지 상태)
sessionStorage.setItem('formData', JSON.stringify(data));
```

### 보안 고려사항

| 저장소 | XSS 취약 | CSRF 취약 | 권장 용도 |
|--------|:--------:|:---------:|----------|
| Cookie (HttpOnly) | 안전 | 취약 | 인증 토큰 |
| Cookie + SameSite | 안전 | 안전 | 인증 토큰 |
| LocalStorage | 취약 | 안전 | 비민감 데이터 |

### 면접관이 주목하는 포인트
- 각 저장소의 특성과 적절한 사용 사례
- 보안 관점에서의 선택

</details>

---

## 학습 체크리스트

- [ ] URL 입력 후 렌더링까지 전체 과정 설명 가능
- [ ] CRP 6단계 암기 (DOM → CSSOM → Render Tree → Layout → Paint → Composite)
- [ ] Reflow/Repaint 차이와 최적화 방법 알기
- [ ] GPU 합성의 이점과 활용법 이해
- [ ] 브라우저 저장소 차이 설명 가능
