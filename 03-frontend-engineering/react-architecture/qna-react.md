# React 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Virtual DOM이란 무엇이며, 왜 사용하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Virtual DOM은 **메모리에 존재하는 가상의 DOM 트리**입니다. 실제 DOM 조작을 최소화하여 성능을 최적화하고, 선언적 UI 프로그래밍을 가능하게 합니다.

### Virtual DOM의 동작 과정

```
1. 상태 변경 발생
       ↓
2. 새로운 Virtual DOM 트리 생성
       ↓
3. 이전 Virtual DOM과 비교 (Diffing)
       ↓
4. 변경된 부분만 계산 (Reconciliation)
       ↓
5. 실제 DOM에 일괄 반영 (Batch Update)
```

### Virtual DOM의 이점

| 이점 | 설명 |
|------|------|
| **배치 업데이트** | 여러 변경사항을 모아서 한 번에 DOM 반영 |
| **선언적 프로그래밍** | "어떻게" 대신 "무엇을" 렌더링할지 선언 |
| **크로스 플랫폼** | React Native 등 다른 플랫폼 지원 |

### 오해 정정

```
❌ "Virtual DOM이 항상 빠르다"
✅ "복잡한 UI 업데이트에서 효율적이다"

❌ "DOM 조작이 느려서 Virtual DOM을 쓴다"
✅ "불필요한 DOM 조작을 줄이고, 개발 경험을 향상시킨다"
```

### 실제 성능 비교

```javascript
// 직접 DOM 조작 - 단순 작업에선 더 빠를 수 있음
document.getElementById('count').textContent = newCount;

// React - 복잡한 UI에서 효율적
setCount(newCount);  // Virtual DOM 비교 후 필요한 부분만 업데이트
```

### 면접관이 주목하는 포인트
- Virtual DOM의 정확한 이점 이해
- "무조건 빠르다"가 아닌 맥락 이해

### 꼬리 질문 대비
- "Virtual DOM 없이 성능을 최적화할 수 있나요?"
  → 네, Svelte처럼 컴파일 타임에 최적화하는 방식도 있음

</details>

---

## Q2. React의 재조정(Reconciliation) 알고리즘을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
재조정은 Virtual DOM의 두 트리를 비교하여 **최소한의 변경으로 실제 DOM을 업데이트**하는 알고리즘입니다.

### Diffing 알고리즘의 휴리스틱

**1. 다른 타입의 엘리먼트는 다른 트리를 만든다**
```jsx
// 타입이 다르면 전체 서브트리 재생성
<div><Counter /></div>
↓
<span><Counter /></span>  // Counter 완전히 새로 마운트
```

**2. key를 통해 같은 엘리먼트 식별**
```jsx
// key가 있으면 순서가 바뀌어도 재사용
<li key="a">A</li>    →    <li key="b">B</li>
<li key="b">B</li>    →    <li key="a">A</li>
// DOM 노드 이동만, 재생성 X
```

### key가 중요한 이유

```jsx
// 나쁜 예: index를 key로 사용
{items.map((item, index) => (
    <Item key={index} data={item} />
))}
// 문제: 배열 중간에 삽입/삭제 시 뒤의 모든 컴포넌트 재렌더링

// 좋은 예: 고유 ID를 key로 사용
{items.map(item => (
    <Item key={item.id} data={item} />
))}
// 변경된 항목만 업데이트
```

### 재조정 과정

```
1. Root부터 비교 시작
2. 같은 타입 → 속성만 업데이트
3. 다른 타입 → 이전 트리 제거, 새 트리 생성
4. 자식 재귀적 비교 (key 활용)
5. 변경사항 수집
6. 실제 DOM에 반영
```

### O(n) 복잡도 달성

```
일반 트리 비교: O(n³) - 실용적이지 않음
React Diffing: O(n) - 두 가지 가정으로 최적화

가정 1: 다른 타입 = 다른 트리
가정 2: key로 같은 엘리먼트 식별
```

### 면접관이 주목하는 포인트
- key의 역할과 중요성
- O(n) 복잡도 달성 원리

</details>

---

## Q3. React Fiber란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Fiber는 React 16에서 도입된 **새로운 재조정 엔진**입니다. 렌더링 작업을 작은 단위로 나누어 **중단/재개가 가능**하게 만들었습니다.

### 기존 Stack Reconciler의 문제

```
Stack Reconciler (React 15 이전):
┌─────────────────────────────────────┐
│   렌더링 시작 ──────────────────────► 완료   │
│   (중단 불가, 동기적)                      │
└─────────────────────────────────────┘
→ 큰 업데이트 시 UI 블로킹, 프레임 드랍
```

### Fiber의 해결책

```
Fiber Reconciler (React 16+):
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ A │→│ B │→│ C │→│ D │→│ E │→ 완료
└───┘ └───┘ └───┘ └───┘ └───┘
  ↑
  중단 가능! 우선순위 높은 작업 먼저

→ 긴급한 업데이트(입력, 애니메이션)를 먼저 처리
```

### Fiber 노드 구조

```javascript
// 각 React 엘리먼트는 Fiber 노드로 변환
{
  type: 'div',           // 컴포넌트 타입
  key: null,             // key
  stateNode: domNode,    // 실제 DOM 노드
  child: fiber,          // 첫 번째 자식
  sibling: fiber,        // 다음 형제
  return: fiber,         // 부모
  pendingProps: {},      // 새 props
  memoizedProps: {},     // 이전 props
  memoizedState: {},     // 이전 state
  effectTag: 'UPDATE',   // 수행할 작업
  // ...
}
```

### 렌더 단계 vs 커밋 단계

| 단계 | Render Phase | Commit Phase |
|------|--------------|--------------|
| 특징 | 비동기, 중단 가능 | 동기, 중단 불가 |
| 작업 | Virtual DOM 비교, 변경사항 계산 | 실제 DOM 업데이트 |
| Side Effect | 없음 | 있음 |

### Concurrent Mode (React 18)

```jsx
// 긴급하지 않은 업데이트
startTransition(() => {
    setSearchResults(results);  // 낮은 우선순위
});

// 긴급한 업데이트
setInputValue(e.target.value);  // 높은 우선순위

// useDeferredValue
const deferredValue = useDeferredValue(value);
```

### 면접관이 주목하는 포인트
- Fiber가 해결한 문제
- 렌더/커밋 단계 구분

### 꼬리 질문 대비
- "Time Slicing이란?"
  → 렌더링 작업을 여러 프레임에 나눠서 처리, UI 블로킹 방지

</details>

---

## Q4. useEffect와 useLayoutEffect의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 실행 시점 | 페인트 **후** (비동기) | 페인트 **전** (동기) |
| 용도 | 데이터 페칭, 구독 설정 | DOM 측정, 동기적 DOM 변경 |
| 성능 | 렌더링 차단 X | 렌더링 차단 O |

### 실행 순서

```
1. 렌더링 (Virtual DOM 생성)
2. 커밋 (Real DOM 업데이트)
3. useLayoutEffect 실행 ← 브라우저 페인트 전
4. 브라우저 페인트 (화면 그리기)
5. useEffect 실행 ← 브라우저 페인트 후
```

### useLayoutEffect가 필요한 경우

```jsx
// 문제: useEffect로 인한 깜빡임
function Tooltip() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef();

    useEffect(() => {
        // 페인트 후 실행 → 초기 위치에서 잠깐 보임 → 깜빡임!
        const rect = ref.current.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
    }, []);

    return <div ref={ref} style={{ left: position.x }} />;
}

// 해결: useLayoutEffect로 깜빡임 방지
function Tooltip() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef();

    useLayoutEffect(() => {
        // 페인트 전 실행 → 정확한 위치로 바로 렌더링
        const rect = ref.current.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
    }, []);

    return <div ref={ref} style={{ left: position.x }} />;
}
```

### 사용 가이드라인

```
기본: useEffect 사용

useLayoutEffect 사용:
- DOM 측정이 필요할 때
- DOM 변경 후 즉시 레이아웃 읽어야 할 때
- 깜빡임 방지가 필요할 때
```

### 면접관이 주목하는 포인트
- 실행 시점의 차이
- 실제 사용 사례

</details>

---

## Q5. useMemo와 useCallback의 차이점과 사용 시점은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| Hook | 메모이제이션 대상 | 반환값 |
|------|-----------------|--------|
| useMemo | 계산 결과 값 | 값 |
| useCallback | 함수 자체 | 함수 |

### 기본 사용법

```jsx
// useMemo - 계산 결과 캐싱
const expensiveValue = useMemo(() => {
    return computeExpensiveValue(a, b);
}, [a, b]);  // a, b가 변경될 때만 재계산

// useCallback - 함수 참조 유지
const handleClick = useCallback(() => {
    doSomething(a, b);
}, [a, b]);  // a, b가 변경될 때만 새 함수 생성
```

### useCallback의 필요성

```jsx
// 문제: 매 렌더링마다 새 함수 생성
function Parent() {
    const handleClick = () => console.log('clicked');
    // ChildComponent가 React.memo여도 매번 리렌더링
    return <ChildComponent onClick={handleClick} />;
}

// 해결: useCallback으로 함수 참조 유지
function Parent() {
    const handleClick = useCallback(() => {
        console.log('clicked');
    }, []);
    // ChildComponent가 React.memo면 리렌더링 방지
    return <ChildComponent onClick={handleClick} />;
}
```

### 언제 사용해야 하나?

```
✅ 사용해야 할 때:
- React.memo로 감싼 자식에 전달하는 콜백
- 의존성 배열에 들어가는 함수/값
- 계산 비용이 큰 연산

❌ 불필요한 경우:
- 단순한 계산
- 메모이제이션 오버헤드 > 재계산 비용
- 매 렌더링마다 의존성이 변경되는 경우
```

### 실전 예시

```jsx
// useMemo - 복잡한 필터링
const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(search));
}, [items, search]);

// useCallback + React.memo 조합
const ItemList = React.memo(({ items, onSelect }) => {
    return items.map(item => (
        <Item key={item.id} onClick={() => onSelect(item)} />
    ));
});

function Parent() {
    const onSelect = useCallback((item) => {
        setSelected(item);
    }, []);

    return <ItemList items={items} onSelect={onSelect} />;
}
```

### 면접관이 주목하는 포인트
- 무분별한 사용 지양
- 실제 최적화 필요 상황 판단

</details>

---

## Q6. React의 상태 업데이트는 왜 비동기적인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
React는 성능 최적화를 위해 **여러 상태 업데이트를 배치(Batch)로 묶어서** 한 번에 처리합니다.

### Batching 동작

```jsx
function handleClick() {
    setCount(c => c + 1);  // 리렌더링 X
    setFlag(f => !f);      // 리렌더링 X
    // 이벤트 핸들러 끝나면 한 번만 리렌더링
}

// React 18 이전: 이벤트 핸들러 내부만 배칭
// React 18 이후: 모든 상황에서 자동 배칭 (Automatic Batching)
```

### React 18의 Automatic Batching

```jsx
// React 17 이전 - setTimeout 내부는 배칭 X
setTimeout(() => {
    setCount(c => c + 1);  // 리렌더링 1
    setFlag(f => !f);      // 리렌더링 2
}, 1000);

// React 18 - 모든 곳에서 자동 배칭
setTimeout(() => {
    setCount(c => c + 1);  // 배칭
    setFlag(f => !f);      // 배칭
    // 한 번만 리렌더링
}, 1000);
```

### 즉시 업데이트가 필요한 경우

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
    flushSync(() => {
        setCount(c => c + 1);
    });
    // DOM이 즉시 업데이트됨

    flushSync(() => {
        setFlag(f => !f);
    });
    // 두 번 리렌더링 (배칭 비활성화)
}
```

### 면접관이 주목하는 포인트
- 배칭의 목적
- React 18의 변경사항

</details>

---

## Q7. React에서 key를 사용하는 이유는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
key는 React가 **어떤 항목이 변경/추가/삭제되었는지 식별**하는 데 사용됩니다. 효율적인 재조정을 위해 필수적입니다.

### key가 없을 때 문제

```jsx
// key 없이 리스트 렌더링
// Before: [A, B, C]
// After:  [B, C]  (A 삭제)

// React의 동작 (비효율적):
// 1. A → B로 변경
// 2. B → C로 변경
// 3. C 삭제
// → 모든 항목 업데이트!
```

### key가 있을 때

```jsx
// key로 리스트 렌더링
// Before: [{key:'a'}, {key:'b'}, {key:'c'}]
// After:  [{key:'b'}, {key:'c'}]

// React의 동작 (효율적):
// 1. key='a' 삭제
// 2. key='b', key='c'는 그대로 유지
// → 필요한 항목만 업데이트!
```

### 나쁜 key 사용 예시

```jsx
// ❌ index를 key로 사용 - 항목 순서 변경 시 문제
{items.map((item, index) => (
    <Input key={index} value={item.text} />
))}
// 입력 상태가 다른 항목으로 이동할 수 있음

// ❌ 랜덤 값을 key로 사용 - 매번 새로 마운트
{items.map(item => (
    <Item key={Math.random()} data={item} />
))}
// 성능 저하, 상태 손실
```

### 올바른 key 사용

```jsx
// ✅ 고유하고 안정적인 ID 사용
{items.map(item => (
    <Item key={item.id} data={item} />
))}
```

### 면접관이 주목하는 포인트
- index를 key로 쓰면 안 되는 이유
- key의 역할

</details>

---

## 학습 체크리스트

- [ ] Virtual DOM의 동작 원리와 이점 설명 가능
- [ ] 재조정 알고리즘과 key의 역할 이해
- [ ] Fiber 아키텍처가 해결한 문제 설명 가능
- [ ] useEffect vs useLayoutEffect 차이 암기
- [ ] useMemo/useCallback 적절한 사용 시점 판단
- [ ] React 배칭(Batching) 동작 이해
