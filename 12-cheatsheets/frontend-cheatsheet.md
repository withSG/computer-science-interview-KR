# 프론트엔드 개발자 치트시트

> 면접 직전 빠르게 복습하는 핵심 요약

---

## 🌐 브라우저

### URL 입력 후 렌더링까지
```
1. DNS 조회 → IP 변환
2. TCP 연결 (3-way handshake)
3. HTTP 요청/응답
4. CRP 시작 → 화면 렌더링
```

### Critical Rendering Path
```
HTML 파싱 → DOM
CSS 파싱 → CSSOM
        ↓
    Render Tree
        ↓
    Layout (Reflow)
        ↓
    Paint
        ↓
    Composite
```

### Reflow vs Repaint
```
Reflow: 레이아웃 변경 (width, height, margin)
Repaint: 시각적 변경만 (color, background)

Reflow가 더 비용 큼
```

### GPU 합성
```
transform, opacity → GPU에서 처리
Reflow/Repaint 없이 빠른 애니메이션

transform: translateX() (Good)
left: 100px (Bad)
```

---

## 📜 JavaScript

### 실행 컨텍스트
```
Global → Function → Eval
콜 스택에 쌓임

구성: Lexical Environment, Variable Environment, This Binding
```

### 호이스팅
```
var: 선언 + undefined 초기화
let/const: 선언만 (TDZ)
함수 선언문: 전체 호이스팅
함수 표현식: 변수만 호이스팅
```

### TDZ (Temporal Dead Zone)
```
let/const 선언 전 접근 불가 구간
ReferenceError 발생
```

### 클로저
```
함수 + 렉시컬 환경
외부 함수의 변수에 접근 가능

활용: 은닉화, 함수 팩토리
주의: 메모리 누수
```

### 이벤트 루프
```
1. 콜 스택 (동기 코드)
2. 마이크로태스크 큐 (Promise.then)
3. 매크로태스크 큐 (setTimeout)

마이크로 > 매크로 우선순위
```

### this 바인딩
```
기본: 전역 (strict: undefined)
암시적: 호출 객체
명시적: call, apply, bind
new: 새 객체

화살표 함수: 상위 스코프 this (렉시컬)
```

---

## ⚛️ React

### Virtual DOM
```
메모리 상의 가상 DOM 트리
변경 감지 → Diffing → 최소 DOM 업데이트
```

### 재조정 (Reconciliation)
```
O(n) Diffing:
1. 다른 타입 = 다른 트리
2. key로 같은 엘리먼트 식별

key 중요: index 지양, 고유 ID 사용
```

### Fiber
```
React 16+ 재조정 엔진
작업 중단/재개 가능
우선순위 기반 렌더링

Render Phase: 비동기, 중단 가능
Commit Phase: 동기, 중단 불가
```

### useEffect vs useLayoutEffect
```
useEffect: 페인트 후 (비동기)
useLayoutEffect: 페인트 전 (동기)

DOM 측정, 깜빡임 방지 → useLayoutEffect
```

### useMemo vs useCallback
```
useMemo: 값 메모이제이션
useCallback: 함수 메모이제이션

React.memo와 함께 사용
무분별한 사용 지양
```

### 배칭 (Batching)
```
여러 상태 업데이트를 한 번에 처리
React 18: 모든 상황에서 자동 배칭
```

---

## ⏭️ Next.js

### 렌더링 전략
```
CSR: 브라우저에서 렌더링 (빈 HTML + JS)
SSR: 서버에서 매 요청 시 렌더링
SSG: 빌드 시 미리 렌더링
ISR: SSG + 주기적 재생성
```

### 하이드레이션
```
서버 HTML + 클라이언트 JS 연결
FCP 후 → JS 로드 → TTI

문제: Hydration Mismatch (서버/클라이언트 결과 다름)
```

### React Server Components
```
서버에서만 실행, JS 번들에 포함 안됨
직접 DB 접근 가능
useState, useEffect 사용 불가

'use client' → Client Component
```

### App Router vs Pages Router
```
App Router (13+):
- 기본 Server Component
- async 컴포넌트
- 중첩 레이아웃

Pages Router:
- 기본 Client Component
- getServerSideProps
```

---

## 🔒 보안

### XSS 방어
```
출력 이스케이프
CSP (Content Security Policy)
HttpOnly 쿠키
```

### CSRF 방어
```
CSRF 토큰
SameSite 쿠키
Referer 검증
```

### 저장소 비교
```
Cookie: 4KB, 서버 전송, HttpOnly 가능
LocalStorage: 5MB, 영구, XSS 취약
SessionStorage: 5MB, 탭 종료 시 삭제
```

---

## 🤖 AI/RAG

### RAG 기초
```
Retrieval: 관련 문서 검색
Augmented: 컨텍스트로 프롬프트 보강
Generation: LLM이 답변 생성
```

### 환각 완화
```
프롬프트: "컨텍스트에 없으면 모른다고 답해"
검색 품질 향상
출처 표시
```

---

## ✅ 최종 체크

```
□ CRP 6단계
□ Reflow/Repaint 차이
□ 실행 컨텍스트, 호이스팅, TDZ
□ 클로저 정의와 활용
□ 이벤트 루프 실행 순서
□ Virtual DOM, Fiber 역할
□ useEffect vs useLayoutEffect
□ CSR/SSR/SSG/ISR 차이
□ 하이드레이션 개념
□ React Server Components
```
