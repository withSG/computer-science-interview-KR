# Next.js 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. CSR, SSR, SSG, ISR의 차이점을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 전략 | 렌더링 시점 | HTML 생성 위치 | 특징 |
|------|-----------|---------------|------|
| CSR | 런타임 (브라우저) | 클라이언트 | 빈 HTML + JS로 렌더링 |
| SSR | 런타임 (요청 시) | 서버 | 매 요청마다 서버에서 생성 |
| SSG | 빌드 타임 | 서버 | 빌드 시 미리 생성 |
| ISR | 빌드 + 런타임 | 서버 | SSG + 주기적 재생성 |

### CSR (Client-Side Rendering)

```
브라우저 요청 → 빈 HTML → JS 다운로드 → 클라이언트에서 렌더링
```

```jsx
// React SPA 기본 동작
function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/data').then(res => setData(res));
    }, []);

    return <div>{data}</div>;
}
```

**장점**: 서버 부하 적음, 빠른 페이지 전환
**단점**: 초기 로딩 느림, SEO 불리

### SSR (Server-Side Rendering)

```
브라우저 요청 → 서버에서 HTML 생성 → 완성된 HTML 전송 → 하이드레이션
```

```jsx
// Next.js Pages Router
export async function getServerSideProps() {
    const data = await fetchData();
    return { props: { data } };
}

// Next.js App Router
async function Page() {
    const data = await fetchData();  // 서버에서 실행
    return <div>{data}</div>;
}
```

**장점**: SEO 유리, 빠른 FCP
**단점**: 서버 부하, TTFB 증가

### SSG (Static Site Generation)

```
빌드 시 → 모든 페이지 HTML 미리 생성 → CDN 캐싱 → 즉시 응답
```

```jsx
// Next.js Pages Router
export async function getStaticProps() {
    const data = await fetchData();
    return { props: { data } };
}

// Next.js App Router (기본 동작)
async function Page() {
    const data = await fetchData();  // 빌드 시 실행
    return <div>{data}</div>;
}
```

**장점**: 가장 빠른 응답, CDN 캐싱
**단점**: 빌드 시간, 동적 데이터 불가

### ISR (Incremental Static Regeneration)

```
초기 요청 → 캐시된 HTML 응답 → 백그라운드에서 재생성 → 다음 요청에 새 HTML
```

```jsx
// Next.js Pages Router
export async function getStaticProps() {
    return {
        props: { data },
        revalidate: 60  // 60초마다 재생성
    };
}

// Next.js App Router
export const revalidate = 60;

async function Page() {
    const data = await fetchData();
    return <div>{data}</div>;
}
```

**장점**: SSG의 성능 + 데이터 업데이트
**단점**: 약간의 데이터 지연

### 선택 기준

| 상황 | 권장 전략 |
|------|----------|
| 정적 콘텐츠 (블로그, 문서) | SSG |
| 자주 변경되는 정적 콘텐츠 | ISR |
| 사용자별 동적 페이지 | SSR |
| 대시보드, 관리자 페이지 | CSR |
| SEO 중요 + 동적 데이터 | SSR |

### 면접관이 주목하는 포인트
- 각 전략의 트레이드오프 이해
- 실제 사용 사례와 선택 기준

</details>

---

## Q2. 하이드레이션(Hydration)이란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
하이드레이션은 **서버에서 렌더링된 정적 HTML에 JavaScript 이벤트 핸들러를 연결**하여 인터랙티브하게 만드는 과정입니다.

### 하이드레이션 과정

```
1. 서버: HTML 렌더링 → 클라이언트 전송
2. 브라우저: HTML 표시 (정적, 클릭 안됨)
3. JS 다운로드 및 파싱
4. React 하이드레이션: DOM에 이벤트 연결
5. 페이지 인터랙티브 (TTI)
```

```
┌─────────────────────────────────────────────────────┐
│ FCP (First Contentful Paint)                        │
│ 사용자가 콘텐츠를 봄 (정적)                            │
├─────────────────────────────────────────────────────┤
│ 하이드레이션 진행 중...                               │
│ (버튼 클릭해도 반응 없음)                             │
├─────────────────────────────────────────────────────┤
│ TTI (Time To Interactive)                           │
│ 페이지가 완전히 인터랙티브                            │
└─────────────────────────────────────────────────────┘
```

### 하이드레이션 문제점

**1. Hydration Mismatch**
```jsx
// 서버와 클라이언트 결과가 다르면 에러
function Time() {
    return <div>{new Date().toISOString()}</div>;  // 서버/클라이언트 시간 다름!
}

// 해결: useEffect로 클라이언트에서만 렌더링
function Time() {
    const [time, setTime] = useState('');
    useEffect(() => {
        setTime(new Date().toISOString());
    }, []);
    return <div>{time}</div>;
}
```

**2. 큰 JS 번들로 인한 TTI 지연**
- Selective Hydration (React 18)
- Streaming SSR로 해결

### Selective Hydration (React 18)

```jsx
import { Suspense } from 'react';

function Page() {
    return (
        <div>
            <Header />  {/* 먼저 하이드레이션 */}
            <Suspense fallback={<Spinner />}>
                <Comments />  {/* 나중에 하이드레이션 */}
            </Suspense>
        </div>
    );
}
// 사용자가 Comments를 클릭하면 우선순위 상승
```

### 면접관이 주목하는 포인트
- FCP와 TTI의 차이
- 하이드레이션 미스매치 해결 방법

### 꼬리 질문 대비
- "하이드레이션 미스매치가 발생하는 경우?"
  → 랜덤 값, 현재 시간, window 객체 접근 등 서버/클라이언트 결과가 다를 때

</details>

---

## Q3. React Server Components(RSC)란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
RSC는 **서버에서만 실행되는 React 컴포넌트**로, 클라이언트에 JavaScript가 전송되지 않습니다. 서버에서 렌더링 후 결과만 클라이언트로 전송됩니다.

### Server Components vs Client Components

| 구분 | Server Components | Client Components |
|------|------------------|-------------------|
| 실행 위치 | 서버만 | 클라이언트 (+ 서버 프리렌더) |
| JS 번들 | 포함 안됨 | 포함됨 |
| 상태/이벤트 | 사용 불가 | 사용 가능 |
| async/await | 직접 사용 가능 | useEffect 필요 |
| 환경 변수 | 서버 환경 변수 접근 | 공개 환경 변수만 |

### Next.js App Router에서의 사용

```jsx
// app/page.tsx - 기본이 Server Component
async function Page() {
    const data = await db.query('SELECT * FROM posts');  // 직접 DB 접근!
    return <PostList posts={data} />;
}

// 'use client' 선언으로 Client Component
'use client';

import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);  // 상태 사용 가능
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### RSC의 장점

```
1. Zero Bundle Size
   - 서버 컴포넌트의 코드는 클라이언트로 전송 안됨
   - 무거운 라이브러리도 서버에서만 사용

2. 직접 백엔드 리소스 접근
   - DB, 파일 시스템 직접 접근
   - API 호출 불필요

3. 자동 코드 스플리팅
   - 'use client' 경계에서 자동 분리
```

### RSC 패턴

```jsx
// 서버 컴포넌트에서 데이터 페칭
async function ServerComponent() {
    const data = await fetchFromDB();

    return (
        <div>
            <h1>{data.title}</h1>
            {/* 클라이언트 컴포넌트에 데이터 전달 */}
            <InteractiveButton data={data} />
        </div>
    );
}

// 클라이언트 컴포넌트 - 인터랙션 담당
'use client';

function InteractiveButton({ data }) {
    return <button onClick={() => alert(data.title)}>Click</button>;
}
```

### 제약 사항

```jsx
// Server Component에서 불가능한 것들
'use server';

function ServerComponent() {
    const [state, setState] = useState();  // ❌ useState 불가
    useEffect(() => {});  // ❌ useEffect 불가
    onClick={() => {}}  // ❌ 이벤트 핸들러 불가

    return <div>...</div>;
}

// Client Component에서 불가능한 것들
'use client';

async function ClientComponent() {  // ❌ async 불가
    const data = await db.query();  // ❌ 직접 DB 접근 불가
}
```

### 면접관이 주목하는 포인트
- RSC와 SSR의 차이
- 언제 Server/Client Component를 선택하는지

### 꼬리 질문 대비
- "RSC와 SSR의 차이?"
  → SSR은 초기 렌더링만 서버, RSC는 컴포넌트 자체가 서버 전용으로 JS 번들에 포함 안됨

</details>

---

## Q4. Next.js의 App Router와 Pages Router의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Pages Router | App Router |
|------|--------------|------------|
| 도입 시점 | Next.js 초기 | Next.js 13+ |
| 라우팅 | `pages/` 폴더 | `app/` 폴더 |
| 기본 컴포넌트 | Client Component | Server Component |
| 데이터 페칭 | getServerSideProps 등 | async 컴포넌트 |
| 레이아웃 | _app.js, _document.js | layout.tsx (중첩 가능) |

### 데이터 페칭 비교

```jsx
// Pages Router
export async function getServerSideProps() {
    const data = await fetch('...');
    return { props: { data } };
}

function Page({ data }) {
    return <div>{data}</div>;
}

// App Router
async function Page() {
    const data = await fetch('...');  // 직접 async/await
    return <div>{data}</div>;
}
```

### 레이아웃 비교

```jsx
// Pages Router - _app.js (전역만)
function App({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

// App Router - 중첩 레이아웃 가능
// app/layout.tsx
export default function RootLayout({ children }) {
    return <html><body>{children}</body></html>;
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
    return <div><Sidebar />{children}</div>;
}
```

### 면접관이 주목하는 포인트
- 마이그레이션 경험
- App Router의 이점

</details>

---

## Q5. Next.js에서 캐싱은 어떻게 동작하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Next.js App Router는 **4단계 캐싱 레이어**를 제공합니다.

### 캐싱 레이어

| 레이어 | 캐시 대상 | 위치 | 지속 시간 |
|--------|----------|------|----------|
| Request Memoization | fetch 요청 | 서버 | 요청 동안 |
| Data Cache | fetch 결과 | 서버 | 영구 (재검증 가능) |
| Full Route Cache | 렌더링된 HTML/RSC | 서버 | 영구 (재검증 가능) |
| Router Cache | RSC Payload | 클라이언트 | 세션 동안 |

### 캐시 제어

```jsx
// 캐싱 비활성화
fetch(url, { cache: 'no-store' });

// 시간 기반 재검증
fetch(url, { next: { revalidate: 60 } });

// 페이지 레벨 설정
export const revalidate = 60;
export const dynamic = 'force-dynamic';

// 태그 기반 재검증
fetch(url, { next: { tags: ['posts'] } });
// revalidateTag('posts')로 무효화
```

### 면접관이 주목하는 포인트
- 각 캐싱 레이어의 역할
- 실제 캐시 전략 경험

</details>

---

## Q6. Streaming SSR이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Streaming SSR은 **HTML을 청크 단위로 점진적으로 전송**하여 사용자가 전체 페이지 로딩을 기다리지 않고 일부 콘텐츠를 먼저 볼 수 있게 합니다.

### 기존 SSR vs Streaming SSR

```
기존 SSR:
[데이터 로딩 완료] → [전체 HTML 생성] → [전송] → [표시]
       ↑
    병목 지점

Streaming SSR:
[Header 전송] → [표시]
[Main 전송] → [표시]
[데이터 로딩 완료] → [Comments 전송] → [표시]
```

### Next.js에서 Streaming

```jsx
import { Suspense } from 'react';

export default async function Page() {
    return (
        <div>
            <Header />  {/* 즉시 스트리밍 */}

            <Suspense fallback={<PostsSkeleton />}>
                <Posts />  {/* 데이터 준비되면 스트리밍 */}
            </Suspense>

            <Suspense fallback={<CommentsSkeleton />}>
                <Comments />  {/* 데이터 준비되면 스트리밍 */}
            </Suspense>
        </div>
    );
}
```

### loading.tsx 활용

```
app/
├── page.tsx
├── loading.tsx    // 자동으로 Suspense 경계 생성
└── dashboard/
    ├── page.tsx
    └── loading.tsx
```

### 면접관이 주목하는 포인트
- Streaming의 사용자 경험 이점
- Suspense와의 연관성

</details>

---

## 학습 체크리스트

- [ ] CSR/SSR/SSG/ISR 차이 설명 가능
- [ ] 하이드레이션 개념과 문제점 이해
- [ ] React Server Components 특징 설명 가능
- [ ] App Router와 Pages Router 차이 알기
- [ ] Next.js 캐싱 전략 이해
- [ ] Streaming SSR의 이점 설명 가능
