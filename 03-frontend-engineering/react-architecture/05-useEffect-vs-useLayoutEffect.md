# useEffect와 useLayoutEffect

> 두 훅의 실행 시점을 브라우저 페인트 기준으로 정확히 구분하고, 애초에 effect를 쓰지 말아야 할 상황을 골라낼 수 있게 된다.

## 학습 목표

- [ ] 커밋, 페인트, effect 실행의 선후 관계를 타임라인으로 그릴 수 있다
- [ ] 깜빡임(flicker)이 왜 생기는지 설명하고 `useLayoutEffect`로 해결할 수 있다
- [ ] cleanup 함수가 언제 몇 번 실행되는지 정확히 말할 수 있다
- [ ] StrictMode의 effect 이중 실행이 무엇을 드러내려는 장치인지 설명할 수 있다
- [ ] `useEffect`가 필요 없는 상황을 알아보고 더 나은 코드로 바꿀 수 있다

## 선행 지식

- [04-hooks-internals.md](./04-hooks-internals.md) - 의존성 배열과 클로저
- [03-fiber-architecture.md](./03-fiber-architecture.md) - render 단계와 commit 단계의 구분

---

## 1. 왜 필요한가

React 컴포넌트 함수는 **순수해야 한다.** 같은 props와 state에 대해 항상 같은 결과를 반환해야 하고, 외부에 영향을 주면 안 된다. render 단계는 중단되거나 폐기되거나 여러 번 실행될 수 있기 때문이다.

그런데 실제 애플리케이션에는 순수하지 않은 일이 반드시 필요하다.

- 서버에서 데이터를 가져온다
- `window`에 이벤트 리스너를 등록한다
- 웹소켓에 연결한다
- 외부 차트 라이브러리에 DOM 노드를 넘긴다
- 스크롤 위치를 읽거나 요소의 크기를 측정한다

이런 부수효과를 "렌더링이 끝나고 화면이 확정된 뒤"로 미루는 장치가 effect다. 그런데 "화면이 확정된 뒤"에는 미묘하게 다른 두 시점이 있다. **브라우저가 실제로 픽셀을 그리기 직전**과 **그린 직후**다. 이 차이가 `useLayoutEffect`와 `useEffect`를 가른다.

---

## 2. 실행 시점 — 브라우저 페인트를 기준으로

```
 상태 변경
      │
      ▼
┌──────────────────────────────────────────────────────────┐
│ render 단계 — 컴포넌트 실행, 재조정                      │
│   실제 DOM도 화면도 아직 그대로                          │
├──────────────────────────────────────────────────────────┤
│ commit 단계 (동기, 중단 불가)                            │
│   ① 실제 DOM 삽입·수정·삭제                              │
│   ② 이전 useLayoutEffect의 cleanup                       │
│      (①과 ②는 같은 mutation 구간에서 함께 처리된다)      │
│   ③ ref 연결                                             │
│   ④ useLayoutEffect  ◄── 여기! 화면은 아직 안 그려짐     │
│      (여기서 setState하면 페인트 전에 render부터 다시)   │
└──────────────────────────────────────────────────────────┘
      │
      ▼
   브라우저 페인트 — 사용자가 처음으로 새 화면을 본다
      │
      ▼
┌──────────────────────────────────────────────────────────┐
│   ⑤ 이전 useEffect의 cleanup                             │
│   ⑥ useEffect  ◄── 여기! 이미 화면이 그려진 뒤           │
│      (여기서 setState하면 화면이 한 번 더 바뀐다)        │
└──────────────────────────────────────────────────────────┘
```

핵심은 **`useLayoutEffect`는 페인트를 막고, `useEffect`는 막지 않는다**는 것이다.

`useLayoutEffect` 안에서 `setState`를 하면 React는 그 업데이트까지 처리해 DOM에 반영한 뒤에야 브라우저에 제어권을 넘긴다. 사용자는 중간 상태를 보지 못한다. 반대로 `useEffect` 안에서 `setState`를 하면 사용자는 **변경 전 화면을 한 번 보고 나서** 바뀐 화면을 보게 된다.

정확히 말하면 `useEffect`는 "커밋 후 비동기로 예약"될 뿐, **정확한 실행 시점이 명세된 API가 아니다.** 클릭 같은 사용자 조작이 원인인 업데이트에서는 React가 페인트 전에 effect를 몰아서 실행하는 경우도 있다. 그래서 "`useEffect`면 무조건 페인트 뒤"라고 외우기보다, **페인트를 확실히 막고 싶으면 `useLayoutEffect`를 써야 한다**로 기억하는 편이 안전하다. `useEffect`가 보장하는 것은 "페인트를 막지 않으려고 노력한다"이지 "절대 막지 않는다"가 아니다.

---

## 3. 깜빡임(flicker)은 이렇게 생긴다

### 문제 상황: 툴팁 위치 잡기

버튼 위에 툴팁을 띄우는데, 툴팁의 실제 높이를 재서 위로 띄울지 아래로 띄울지 결정해야 한다. 높이는 DOM에 그려 봐야 알 수 있으므로 렌더링 이후에 측정해야 한다.

```jsx
// 안티패턴: useEffect로 측정하면 깜빡인다
function Tooltip({ targetRect, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const { height } = ref.current.getBoundingClientRect();
    setHeight(height);
  }, []);

  // height가 0인 첫 렌더에서는 엉뚱한 위치에 그려진다
  let top = targetRect.top - height;
  if (top < 0) top = targetRect.bottom;

  return (
    <div ref={ref} style={{ position: 'absolute', top }}>
      {children}
    </div>
  );
}
```

**왜 문제인가**: 실행 순서를 따라가 보자.

```
1. 렌더:      height = 0  →  top 계산이 틀림 (엉뚱한 위치)
2. 커밋:      DOM에 반영
3. 페인트:    사용자가 "엉뚱한 위치의 툴팁"을 본다   ← 여기가 문제
4. useEffect: 높이 측정 → setHeight(32)
5. 렌더:      height = 32  →  top이 올바르게 계산됨
6. 커밋 + 페인트: 사용자가 "제자리로 점프하는 툴팁"을 본다
```

한 프레임이지만 사람 눈에 확실히 보인다. 툴팁이 순간적으로 튀는 것처럼 느껴진다.

개선은 간단하다. **위 코드에서 `useEffect`를 `useLayoutEffect`로 바꾸기만 하면 된다.** 그러면 순서가 이렇게 달라진다.

```
1. 렌더:            height = 0 (틀린 위치)
2. 커밋:            DOM에 반영 (아직 화면에는 안 보임)
3. useLayoutEffect: 높이 측정 → setHeight(32)
4. 렌더 + 커밋:     올바른 위치로 갱신 (아직 화면에는 안 보임)
5. 페인트:          사용자는 처음부터 올바른 위치만 본다   ← 깜빡임 없음
```

브라우저에게 "잠깐, 아직 그리지 마"라고 말한 셈이다. 그 대가로 페인트가 그만큼 늦어진다.

### 깜빡임이 생기는 다른 케이스

- 스크롤 위치 복원 (목록으로 돌아왔을 때 맨 위에서 원래 위치로 점프)
- 다크 모드 등 저장된 테마 적용 (기본 테마가 잠깐 보였다가 바뀜)
- 애니메이션 시작 위치를 측정해서 잡는 경우

공통점은 **"DOM을 읽어서 그 결과로 DOM을 다시 바꿔야 하는" 경우**다.

---

## 4. 비교 표

| 구분 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 실행 시점 | 페인트 이후 (비동기 예약) | 커밋 직후, 페인트 이전 (동기) |
| 페인트 차단 | 하지 않음 | 함 |
| 내부에서 setState | 사용자가 중간 화면을 봄 (깜빡임) | 중간 화면 없이 최종 결과만 보임 |
| 성능 부담 | 낮음 | 높음 (길어지면 화면 멈춤) |
| 서버 렌더링(SSR) | 실행되지 않음 (경고 없음) | 실행되지 않으며 경고 발생 |
| 적합한 일 | 데이터 페칭, 구독, 로깅, 타이머 | DOM 측정 후 즉시 보정, 스크롤 위치 조정 |

**결론**: 기본은 `useEffect`다. 화면에 잘못된 중간 상태가 눈에 보일 때만 `useLayoutEffect`로 바꾼다. 순서를 반대로 하면(일단 `useLayoutEffect`부터) 불필요하게 페인트를 막아 반응성이 나빠진다.

SSR 관련해서 한 가지 더. `useLayoutEffect`는 서버에서 실행될 수 없으므로 React가 경고를 띄운다. 서버에서 렌더된 HTML과 클라이언트 첫 렌더 결과가 달라질 여지가 생기기 때문이다. 이 경우 로직을 `useEffect`로 옮기거나, 측정 없이도 서버에서 그릴 수 있는 초기 마크업을 만드는 쪽으로 설계를 바꾸는 것이 정석이다.

---

## 5. cleanup 함수

### 언제 실행되는가

effect가 반환한 함수가 cleanup이다. 컴포넌트가 언마운트될 때, 그리고 **의존성이 바뀌어 다음 effect가 실행되기 직전**에 실행된다. 두 번째가 자주 간과된다.

```
[마운트]                effect 실행 (roomId: 'A')
[roomId 'A' → 'B']      이전 cleanup ('A' 연결 해제)  ← 먼저
                        새 effect    ('B' 연결)       ← 나중
[언마운트]              cleanup ('B' 연결 해제)
```

cleanup 함수 역시 자신이 만들어진 렌더의 클로저를 붙잡고 있으므로, 위 예에서 첫 cleanup이 보는 `roomId`는 'A'다. 이 덕분에 "자기가 연 것을 자기가 닫는" 대칭이 성립한다.

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();   // 이 connection은 이 렌더의 것
  }, [roomId]);
}
```

### cleanup을 빠뜨리면

```jsx
// 안티패턴: 정리하지 않는 구독
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// 개선
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**왜 문제인가**: 컴포넌트가 언마운트돼도 리스너가 남는다. 그 리스너는 클로저로 컴포넌트의 상태와 setter를 붙잡고 있으므로 메모리가 회수되지 않는다. 목록에서 상세로, 다시 목록으로 오가기를 반복하면 리스너가 계속 쌓여 리사이즈 한 번에 수십 번의 핸들러가 실행된다.

정리가 필요한 대표적인 것들: 이벤트 리스너, `setTimeout`/`setInterval`, 웹소켓·EventSource 연결, 외부 라이브러리 인스턴스(차트, 지도, 에디터), `IntersectionObserver`/`ResizeObserver`, 진행 중인 네트워크 요청.

---

## 6. StrictMode의 effect 이중 실행

### 무엇이 일어나는가

React 18부터, 개발 모드에서 `<StrictMode>`로 감싼 트리는 마운트 시 effect를 `setup → cleanup → setup` 순으로 실행한다. (그 이전 버전의 StrictMode는 렌더 함수만 두 번 호출했고 effect는 건드리지 않았다.) 즉 "마운트 → 언마운트 → 다시 마운트"를 인위적으로 시뮬레이션한다. **개발 모드에서만 일어나고 프로덕션 빌드에서는 일어나지 않는다.**

### 왜 이런 걸 하나

React는 앞으로 컴포넌트 상태를 보존한 채 화면에서 떼었다 다시 붙이는 동작(탭 전환, 뒤로 가기 복원 등)을 하려 한다. 그러려면 **effect가 여러 번 setup/cleanup 되어도 결과가 같아야 한다.** StrictMode는 그 조건을 만족하지 않는 코드를 개발 단계에서 즉시 드러낸다.

```jsx
// 이중 실행에서 문제가 드러나는 코드
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  // cleanup 없음
}, [roomId]);
```

StrictMode에서 실행하면 연결이 두 개 생기고 하나가 남는다. 콘솔에 "연결됨"이 두 번 찍히는 걸 보고 개발자는 즉시 이상을 알아챈다. cleanup을 제대로 붙이면 연결 → 해제 → 연결이 되어 최종적으로 연결 하나만 남는다. 결과가 같아진다.

### 안티패턴 — 이중 실행을 플래그로 막는다

```jsx
// 안티패턴
const didRun = useRef(false);
useEffect(() => {
  if (didRun.current) return;
  didRun.current = true;
  connect();
}, []);

// 개선
useEffect(() => {
  const connection = connect();
  return () => connection.close();
}, []);
```

**왜 문제인가**: 증상만 가리고 원인은 그대로 둔다. 실제로 컴포넌트가 언마운트됐다가 다시 마운트되는 상황(라우팅으로 페이지를 오가는 경우)에서는 `connect()`가 아예 실행되지 않아 진짜 버그가 된다. **필요한 것은 실행을 막는 게 아니라 cleanup을 제대로 쓰는 것이다.**

같은 이유로 "StrictMode를 끄면 해결된다"는 것도 해결이 아니다. 경고등을 뗀 것이다.

---

## 7. useEffect를 아예 쓰지 말아야 하는 경우

이 절이 실무에서 가장 중요하다. effect는 **React 바깥 시스템과 동기화할 때** 쓰는 도구다. React 안에서 끝나는 일에 쓰면 대부분 코드가 나빠진다.

### 안티패턴 1 — 파생 상태를 effect로 계산한다

```jsx
// 안티패턴
function Cart({ items }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.price, 0));
  }, [items]);
  return <div>합계: {total}</div>;
}

// 개선: 렌더링 중에 계산한다. 상태가 아니다.
function Cart({ items }) {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return <div>합계: {total}</div>;
}
```

**왜 문제인가**: 렌더링이 두 번 일어난다. 첫 렌더에서 `total`은 0(또는 이전 값)이고, effect가 돌고 나서야 올바른 값으로 다시 렌더링되므로 사용자가 순간적으로 틀린 합계를 볼 수 있다. 또 `items`와 `total`이라는 두 개의 진실 공급원이 생겨 서로 어긋날 수 있고, 상태가 하나 늘어 디버깅 표면이 넓어진다.

계산이 정말 비쌀 때만 `useMemo`로 감싼다. **`useMemo`도 상태를 만들지는 않는다는 점이 핵심이다.**

판별법: "이 값이 다른 state나 props만으로 계산되는가?" 그렇다면 state가 아니라 그냥 변수여야 한다.

### 안티패턴 2 — props가 바뀔 때 state를 초기화한다

```jsx
// 안티패턴
function ProfileEditor({ userId }) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setDraft('');   // 사용자가 바뀌면 입력 내용 초기화
  }, [userId]);
}
```

**왜 문제인가**: 사용자가 바뀐 직후 한 프레임 동안 **이전 사용자의 입력 내용이 화면에 남는다.** 초기화해야 할 상태가 여러 개면 하나씩 빠뜨리기도 쉽다.

```jsx
// 개선: key로 컴포넌트 자체를 새로 마운트시킨다
function Page({ userId }) {
  return <ProfileEditor key={userId} userId={userId} />;
}

function ProfileEditor({ userId }) {
  const [draft, setDraft] = useState('');   // 마운트 시 자동 초기화
}
```

### 안티패턴 3 — 사용자 이벤트에 대한 반응을 effect에 쓴다

```jsx
// 안티패턴
function Form() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      showToast('전송되었습니다');
      logAnalytics('submit');
    }
  }, [submitted]);

  return <button onClick={() => setSubmitted(true)}>전송</button>;
}
```

**왜 문제인가**: "전송 버튼을 눌렀다"는 사실을 상태로 저장했다가 effect가 그걸 눈치채게 만드는 우회로다. 상태 하나가 불필요하게 늘고, 다른 이유로 컴포넌트가 다시 마운트되면 토스트가 또 뜬다. 무엇이 무엇을 유발하는지 코드에서 읽히지 않는다.

```jsx
// 개선: 이벤트로 인해 일어나는 일은 이벤트 핸들러에 쓴다
function Form() {
  function handleSubmit() {
    showToast('전송되었습니다');
    logAnalytics('submit');
  }
  return <button onClick={handleSubmit}>전송</button>;
}
```

판별법: **"이 코드가 실행되는 이유가 화면에 표시되었기 때문인가, 사용자가 무언가를 했기 때문인가?"** 후자면 이벤트 핸들러다.

### 안티패턴 4 — 데이터 페칭에서 경쟁 조건을 방치한다

effect로 데이터를 가져오는 것 자체는 정당한 용도지만, 정리가 없으면 순서가 뒤집힌다.

```jsx
// 안티패턴
useEffect(() => {
  fetch(`/api/search?q=${query}`)
    .then(r => r.json())
    .then(setResults);
}, [query]);
```

**왜 문제인가**: `query`가 "ab" → "abc"로 빠르게 바뀌면 요청이 두 개 날아간다. 네트워크 사정에 따라 "ab"의 응답이 나중에 도착할 수 있고, 그러면 최종 화면에 **"abc"를 검색했는데 "ab"의 결과**가 남는다. 재현이 어렵고 사용자만 이상하다고 느끼는 종류의 버그다.

```jsx
// 개선: cleanup으로 오래된 응답을 무시한다
useEffect(() => {
  let ignore = false;

  fetch(`/api/search?q=${query}`)
    .then(r => r.json())
    .then(data => {
      if (!ignore) setResults(data);
    });

  return () => { ignore = true; };
}, [query]);
```

`AbortController`로 요청 자체를 취소해도 된다. 다만 실무에서는 캐싱·재시도·중복 제거까지 필요해지므로, 데이터 페칭은 전용 라이브러리(TanStack Query, SWR 등)나 프레임워크의 데이터 로딩 기능에 맡기는 것이 일반적인 선택이다.

### effect가 정말 맞는 경우

| 상황 | effect가 맞나 |
|------|--------------|
| props/state로 계산되는 값 | 아니다 — 렌더링 중 계산 |
| 사용자 클릭에 대한 반응 | 아니다 — 이벤트 핸들러 |
| props 변경 시 state 초기화 | 아니다 — `key` 사용 |
| 브라우저 API 구독 (resize, online 등) | 맞다 |
| 외부 라이브러리 인스턴스 생성·파괴 | 맞다 |
| DOM 노드 직접 측정·조작 | 맞다 (`useLayoutEffect`일 수도) |
| 화면에 표시되었다는 사실 자체를 서버에 알림 | 맞다 |

**결론**: effect는 "React 바깥 세계와의 동기화"에만 쓴다. React 안에서 값이 값으로 이어지는 관계는 계산으로 표현한다.

---

## 8. 실무에서는

- `useLayoutEffect`는 검색해서 찾아 쓰기보다 **깜빡임이 실제로 보일 때** 도입한다. 도입한 자리에는 왜 필요한지 주석을 남기는 편이 좋다. 나중에 누군가 "이거 useEffect로 바꿔도 되지 않나" 하고 되돌리기 쉽다.
- effect 안에서 로직이 길어지면 대개 여러 개의 관심사가 섞인 것이다. **하나의 effect는 하나의 동기화만** 담당하도록 나눈다. 의존성 배열이 짧아지고 cleanup이 명확해진다.
- 리스트 페이지에서 상세로 갔다가 돌아오기를 반복하며 메모리 사용량이 계속 늘어난다면 cleanup 누락을 먼저 의심한다. 브라우저 개발자 도구의 메모리 스냅샷 비교로 확인할 수 있다.
- `useEffect`가 20개 넘게 있는 컴포넌트를 만났다면, 절반 이상은 파생 상태 계산이나 이벤트 응답일 가능성이 높다. 위의 판별법으로 하나씩 걷어내는 것이 리팩터링 효과가 크다.

---

## 9. 면접 포인트

> 면접에서 이 주제가 나오면 이렇게 답한다

**Q. `useEffect`와 `useLayoutEffect`의 차이는 무엇인가요?**

A. 실행 시점이 다릅니다. `useLayoutEffect`는 DOM이 변경된 직후, 브라우저가 화면을 그리기 전에 동기적으로 실행됩니다. `useEffect`는 브라우저가 화면을 그린 뒤에 비동기로 실행됩니다. 그래서 `useLayoutEffect` 안에서 상태를 바꾸면 사용자는 중간 화면을 보지 못하지만, 페인트가 그만큼 지연됩니다. 기본은 `useEffect`를 쓰고, DOM을 측정해서 그 결과로 위치나 크기를 보정해야 하는 경우처럼 중간 상태가 눈에 보이면 안 될 때만 `useLayoutEffect`를 씁니다.

- 꼬리 질문: "깜빡임이 왜 생기나요?" → `useEffect`는 페인트 이후에 실행되므로, 측정 전의 잘못된 위치가 이미 한 프레임 화면에 그려집니다. 그 뒤 `setState`로 위치가 보정되면서 요소가 튀는 것처럼 보입니다.
- 꼬리 질문: "SSR에서 주의할 점은?" → `useLayoutEffect`는 서버에서 실행될 수 없어 React가 경고를 냅니다. 서버 HTML과 클라이언트 첫 렌더가 어긋날 수 있으므로, 가능하면 `useEffect`로 옮기거나 측정 없이도 올바른 초기 마크업이 나오도록 설계합니다.

**Q. cleanup 함수는 언제 실행되나요?**

A. 컴포넌트가 언마운트될 때, 그리고 의존성이 바뀌어 다음 effect가 실행되기 직전입니다. 두 번째가 중요한데, 순서가 "이전 cleanup → 새 effect"이므로 이전 렌더에서 만든 리소스를 그 렌더의 클로저가 닫아 줍니다. 이 대칭이 지켜지지 않으면 구독이나 타이머가 중첩되어 메모리 누수와 중복 실행이 발생합니다.

- 꼬리 질문: "cleanup에서 참조하는 값은 어느 시점 것인가요?" → cleanup이 정의된 렌더의 값입니다. 그래서 `roomId`가 A에서 B로 바뀌면 cleanup은 A의 연결을 닫고, 새 effect가 B에 연결합니다.

**Q. StrictMode에서 effect가 두 번 실행되는 이유는?**

A. 개발 모드에서만 마운트 시 setup → cleanup → setup 순으로 실행해서, effect가 여러 번 실행되어도 안전한지 검증하는 장치입니다. React가 앞으로 상태를 보존한 채 컴포넌트를 떼었다 붙이는 동작을 지원하려면 이 조건이 필요합니다. cleanup을 제대로 작성했다면 결과가 달라지지 않으므로 문제가 없고, 결과가 이상하다면 그건 원래 있던 버그가 드러난 것입니다. 프로덕션 빌드에서는 한 번만 실행됩니다.

- 꼬리 질문: "ref 플래그로 두 번째 실행을 막으면 안 되나요?" → 안 됩니다. 실제로 컴포넌트가 언마운트됐다 다시 마운트되는 경우에 초기화가 아예 실행되지 않는 진짜 버그를 만듭니다. 해결책은 실행을 막는 것이 아니라 cleanup을 제대로 쓰는 것입니다.

**Q. `useEffect`로 파생 상태를 계산하면 왜 안 되나요?**

A. 렌더링이 불필요하게 두 번 일어나고, 첫 렌더에서는 값이 아직 갱신되지 않아 사용자가 틀린 값을 볼 수 있습니다. 또 원본 데이터와 파생 값이라는 두 개의 진실 공급원이 생겨 서로 어긋날 수 있습니다. props와 state만으로 계산되는 값은 상태로 두지 말고 렌더링 중에 그냥 계산하면 됩니다. 계산이 실제로 비쌀 때만 `useMemo`로 감쌉니다.

- 꼬리 질문: "그럼 effect는 언제 쓰나요?" → React 바깥 시스템과 동기화할 때입니다. 브라우저 API 구독, 외부 라이브러리 인스턴스 관리, 네트워크 요청 같은 것들입니다.

---

## 자주 하는 실수

| 실수 | 왜 틀렸나 | 올바른 이해 |
|------|----------|-----------|
| `useLayoutEffect`가 "더 빨라서" 좋다고 생각한다 | 페인트를 막으므로 오히려 첫 화면 표시가 늦어진다 | 깜빡임이 실제로 보일 때만 쓴다 |
| cleanup은 언마운트 때만 실행된다고 안다 | 의존성이 바뀔 때마다 다음 effect 직전에도 실행된다 | 실행 순서는 "이전 cleanup → 새 effect" |
| StrictMode 이중 실행을 ref 플래그로 막는다 | 실제 재마운트 상황에서 초기화가 누락된다 | cleanup을 제대로 작성해 멱등하게 만든다 |
| props로 계산 가능한 값을 effect로 state에 넣는다 | 렌더가 두 번 일어나고 값이 어긋날 수 있다 | 렌더링 중에 계산한다 |
| 버튼 클릭 후 할 일을 effect로 처리한다 | 상태가 늘고 재마운트 시 중복 실행된다 | 이벤트 핸들러에 직접 쓴다 |
| effect 안 fetch에 cleanup을 안 쓴다 | 응답 순서가 뒤집혀 오래된 결과가 화면에 남는다 | `ignore` 플래그나 `AbortController`로 정리한다 |

---

## 한 줄 정리

`useLayoutEffect`는 **페인트를 막고** 실행되어 깜빡임을 없애는 대신 화면 표시를 늦추고, `useEffect`는 페인트 후 실행되어 반응성을 지킨다. 그리고 그보다 먼저 물어야 할 것은 **"이 일에 effect가 정말 필요한가"**다.

---

## 연관 개념

- [04-hooks-internals.md](./04-hooks-internals.md) - 의존성 배열과 오래된 클로저
- [03-fiber-architecture.md](./03-fiber-architecture.md) - commit 단계의 하위 단계 구조
- [02-reconciliation.md](./02-reconciliation.md) - `key`로 상태를 초기화하는 방법
- [01-virtual-dom.md](./01-virtual-dom.md) - 렌더와 커밋이 분리된 이유
- [qna-react.md](./qna-react.md) - React 면접 질문 모음
- [리플로우와 리페인트](../browser-fundamentals/04-reflow-repaint.md) - 페인트와 레이아웃의 실제 비용
- [하이드레이션](../nextjs-rendering/02-hydration.md) - SSR 이후 effect가 언제부터 도는지
