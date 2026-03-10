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

## Q8. React가 라이브러리인 이유는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
라이브러리와 프레임워크의 핵심 차이는 **제어의 역전(IoC, Inversion of Control)**입니다. React는 UI 렌더링 도구만 제공하며 애플리케이션 흐름(라우팅, 상태 관리, 빌드 등)을 강제하지 않습니다. 개발자가 필요할 때 React를 호출하는 방식으로 제어권이 개발자에게 있습니다.

### 라이브러리 vs 프레임워크 비교

| 구분 | 프레임워크 | 라이브러리 |
|------|-----------|-----------|
| 제어권 | 프레임워크가 제어 | 개발자가 제어 |
| 강제성 | 구조/규칙 강제 | 필요할 때만 사용 |
| 예시 | Angular, Next.js | React, jQuery |

### 면접관이 주목하는 포인트
- 제어의 역전(IoC) 개념을 명확히 언급하는지

### 꼬리 질문 대비
- "Next.js는 프레임워크인가요?" → 네, 라우팅/SSR/빌드 구조 등을 강제하므로 프레임워크입니다

</details>

---

## Q9. 함수 컴포넌트와 클래스 컴포넌트의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
함수 컴포넌트는 Hooks(useState, useEffect 등)를 통해 상태와 생명주기를 관리합니다. 클래스 컴포넌트보다 코드량이 적고 메모리 효율이 높으며, React 16.8 이후 함수 컴포넌트 사용이 공식 권장됩니다.

### 함수 vs 클래스 컴포넌트 비교

| 구분 | 클래스 컴포넌트 | 함수 컴포넌트 |
|------|--------------|-------------|
| state | this.state, constructor | useState |
| 생명주기 | componentDidMount 등 | useEffect |
| 코드량 | 많음 | 적음 |
| this | 필요 | 불필요 |
| 메모리 | 더 사용 | 효율적 |

### 코드 예시

```jsx
// 클래스 컴포넌트
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}

// 함수 컴포넌트
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### 면접관이 주목하는 포인트
- 단순 문법 차이가 아닌 Hooks 도입 배경 이해
- 함수 컴포넌트 권장 이유

### 꼬리 질문 대비
- "클래스 컴포넌트가 완전히 사라지나요?" → 공식 지원은 유지되나 신규 프로젝트에는 함수 컴포넌트 권장

</details>

---

## Q10. Props와 State의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Props는 부모 컴포넌트가 자식에게 전달하는 **읽기 전용 데이터**이고, State는 컴포넌트가 **내부에서 직접 관리하고 변경할 수 있는 데이터**입니다. Props는 단방향으로 흐르며 자식은 변경할 수 없습니다.

### Props vs State 비교

| 구분 | Props | State |
|------|-------|-------|
| 관리 주체 | 부모 컴포넌트 | 컴포넌트 자신 |
| 변경 | 부모만 가능 | setState / useState |
| 방향 | 단방향 (부모 → 자식) | 내부 |
| 읽기 전용 | O | X |

### 자식 → 부모 데이터 전달

```jsx
// 콜백 함수를 props로 전달하는 패턴
function Parent() {
  const [value, setValue] = useState('');
  return <Child onChange={(v) => setValue(v)} />;
}

function Child({ onChange }) {
  return <input onChange={(e) => onChange(e.target.value)} />;
}
```

### 면접관이 주목하는 포인트
- 단방향 데이터 흐름 원칙 이해

### 꼬리 질문 대비
- "props로 자식 → 부모 데이터 전달이 가능한가요?" → 직접 불가. 부모가 콜백 함수를 props로 내려주고 자식이 그것을 호출하는 방식으로 전달합니다

</details>

---

## Q11. 제어 컴포넌트와 비제어 컴포넌트의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
제어 컴포넌트는 React state가 폼 데이터의 단일 출처(Single Source of Truth)가 되어 onChange마다 state를 업데이트합니다. 비제어 컴포넌트는 DOM 자체가 데이터를 관리하며 ref로 값에 접근합니다.

### 제어 vs 비제어 컴포넌트 비교

| 구분 | 제어 컴포넌트 | 비제어 컴포넌트 |
|------|------------|--------------|
| 데이터 관리 | React state | DOM 직접 |
| 값 접근 | onChange → state | ref.current.value |
| 즉시 유효성 검사 | 가능 | 어려움 |
| 권장 상황 | 복잡한 폼 | 단순 폼, file input |

### 코드 예시

```jsx
// 제어 컴포넌트
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 비제어 컴포넌트
function UncontrolledInput() {
  const inputRef = useRef(null);
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  return <input ref={inputRef} />;
}
```

### 면접관이 주목하는 포인트
- 각 패턴의 적합한 사용 상황 판단

### 꼬리 질문 대비
- "file input은 왜 비제어 컴포넌트로 다루나요?" → 보안상 파일 경로를 JS로 설정할 수 없어 React가 제어할 수 없기 때문입니다

</details>

---

## Q12. FLUX 패턴이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
FLUX는 Facebook이 제안한 **단방향 데이터 흐름 아키텍처**입니다. MVC의 양방향 데이터 흐름에서 발생하는 복잡성을 해결하기 위해 Action → Dispatcher → Store → View 순환 구조로 상태 변화를 예측 가능하게 만들었습니다.

### FLUX 데이터 흐름

```
Action → Dispatcher → Store → View
                               ↓ (사용자 인터랙션)
                            Action (다시 시작)
```

### MVC vs FLUX 비교

| 구분 | MVC | FLUX |
|------|-----|------|
| 데이터 흐름 | 양방향 | 단방향 |
| 상호작용 | Model ↔ View | Action → Store → View |
| 복잡도 증가 시 | 예측 어려움 | 예측 가능 |

### 면접관이 주목하는 포인트
- 단방향 데이터 흐름의 장점 설명
- MVC의 어떤 문제를 해결했는지 이해

### 꼬리 질문 대비
- "Redux와 Flux의 차이는?" → Redux는 Flux를 구현한 라이브러리로, 단일 스토어와 순수 함수(reducer)를 통한 상태 변경이 특징입니다

</details>

---

## Q13. Redux의 동작 원리를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Redux는 **단일 스토어, 읽기 전용 상태, 순수 함수 reducer**의 3대 원칙으로 동작합니다. View에서 Action을 dispatch하면 Reducer가 이전 상태와 Action을 받아 새로운 상태를 반환하고, Store가 업데이트되어 View가 다시 렌더링됩니다.

### Redux 데이터 흐름

```
View → dispatch(Action) → Reducer(순수함수) → Store → View 업데이트
```

### 3대 원칙

1. **단일 스토어(Single Source of Truth)** - 앱 전체 상태를 하나의 스토어에서 관리
2. **읽기 전용 상태(State is read-only)** - Action을 통해서만 상태 변경 가능
3. **순수 함수 reducer(Changes made with pure functions)** - 이전 상태 + Action → 새 상태

### 코드 예시

```javascript
// Reducer (순수 함수)
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

// Action dispatch
dispatch({ type: 'INCREMENT' });
```

### 면접관이 주목하는 포인트
- 3대 원칙 암기 및 각 원칙의 이유 설명
- 순수 함수 reducer의 중요성

### 꼬리 질문 대비
- "Redux Thunk vs Saga의 차이는?" → Thunk는 함수를 dispatch할 수 있는 간단한 미들웨어, Saga는 제너레이터 기반으로 복잡한 비동기 흐름을 관리합니다

</details>

---

## Q14. 현대 상태 관리 라이브러리를 비교해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
상태를 **서버 상태**와 **클라이언트 상태**로 구분하는 것이 중요합니다. 서버 상태(캐싱/동기화)는 React Query, 전역 클라이언트 상태는 Zustand/Jotai, 복잡한 전역 상태는 Redux가 적합합니다.

### 라이브러리 비교

| 라이브러리 | 특징 | 적합한 상태 |
|-----------|------|-----------|
| Redux | 강력, 보일러플레이트 많음 | 복잡한 전역 클라이언트 상태 |
| Zustand | 경량, 간결, 낮은 학습 곡선 | 전역 클라이언트 상태 |
| Jotai | 원자적(atomic), React Suspense 친화 | 파생 상태, 세분화된 구독 |
| React Query | 캐싱, 동기화, 리페칭 자동화 | 서버 상태 |

### 면접관이 주목하는 포인트
- 서버 상태 vs 클라이언트 상태 구분 능력
- 상황에 맞는 라이브러리 선택 근거

### 꼬리 질문 대비
- "React Query와 Redux를 함께 써도 되나요?" → 역할이 다르므로 병용 가능합니다. 서버 상태는 React Query, 클라이언트 전용 전역 상태는 Redux/Zustand로 관리합니다

</details>

---

## Q15. React에서 State의 불변성이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
React는 `Object.is`로 **얕은 비교(shallow comparison)**를 수행하므로 객체/배열을 직접 변경(mutation)하면 참조가 같아 변화를 감지하지 못하고 리렌더링이 발생하지 않습니다. 항상 새로운 참조를 반환해야 합니다.

### 올바른 불변성 유지

```javascript
// 잘못된 예 - 직접 변경 → 리렌더링 안됨
state.items.push(newItem);
setState(state); // 같은 참조

// 올바른 예 - 새 참조 반환
setState([...state.items, newItem]);

// 객체
setState({ ...state, name: 'new name' });

// 중첩 객체 (Immer 활용)
setState(produce(state, draft => {
  draft.nested.value = 'new';
}));
```

### 불변성 유지 방법

| 방법 | 사용 예 |
|------|--------|
| 전개 연산자 | `[...arr]`, `{...obj}` |
| Array 메서드 | map, filter, concat (원본 불변) |
| Immer 라이브러리 | `produce(state, draft => { draft.x = 1 })` |

### 면접관이 주목하는 포인트
- 얕은 비교 원리 이해
- 불변성 위반 시 발생하는 문제 설명

### 꼬리 질문 대비
- "리듀서에서 얕은 복사 vs 깊은 복사 어느 것을 써야 하나요?" → 기본적으로 얕은 복사(스프레드)를 사용하고, 깊이 중첩된 객체는 Immer를 활용합니다

</details>

---

## Q16. 부수효과(Side Effect)와 순수 함수란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
순수 함수는 **같은 입력에 항상 같은 출력**을 반환하고 외부 상태를 변경하지 않습니다. React 컴포넌트는 렌더링 단계에서 순수해야 하며, API 호출/DOM 조작 같은 부수효과는 `useEffect`로 격리합니다.

### 순수 함수 vs 부수효과 비교

| 순수 함수 | 부수효과(Side Effect) |
|---------|---------------------|
| 외부 상태 변경 없음 | API 호출, DOM 조작, 전역 변수 변경 |
| 같은 입력 = 같은 출력 | 결과가 외부 요인에 영향 받음 |
| 테스트 쉬움 | useEffect로 격리 필요 |

### 면접관이 주목하는 포인트
- React 컴포넌트의 순수성 원칙 이해
- useEffect를 통한 부수효과 격리 방식

### 꼬리 질문 대비
- "React 컴포넌트가 순수해야 하는 이유는?" → Concurrent Mode에서 렌더링이 여러 번 호출될 수 있어 부수효과가 렌더 단계에 있으면 예측 불가능한 동작이 발생합니다

</details>

---

## Q17. React 컴포넌트 라이프사이클을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
컴포넌트는 **Mount → Update → Unmount** 3단계 생명주기를 가집니다. 클래스 컴포넌트의 생명주기 메서드를 함수 컴포넌트에서는 `useEffect`로 대체할 수 있습니다.

### 생명주기 메서드 vs Hooks 비교

| 단계 | 클래스 메서드 | Hooks |
|------|------------|-------|
| Mount | componentDidMount | useEffect(fn, []) |
| Update | componentDidUpdate | useEffect(fn, [deps]) |
| Unmount | componentWillUnmount | useEffect(() => () => cleanup, []) |

### useEffect로 생명주기 구현

```javascript
useEffect(() => {
  // componentDidMount + componentDidUpdate
  console.log('마운트 또는 deps 변경 시 실행');

  return () => {
    // componentWillUnmount
    console.log('언마운트 또는 다음 effect 실행 전 정리');
  };
}, [deps]);
```

### 면접관이 주목하는 포인트
- 클래스와 함수 컴포넌트의 생명주기 매핑 이해
- cleanup 함수의 역할

### 꼬리 질문 대비
- "useEffect의 cleanup은 언제 실행되나요?" → 컴포넌트 언마운트 시, 그리고 deps가 변경되어 다음 effect가 실행되기 직전에 실행됩니다

</details>

---

## Q18. React 성능 최적화 방법을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
React 성능 최적화는 **불필요한 리렌더링 방지**, **코드 스플리팅을 통한 번들 크기 감소**, **가상화를 통한 긴 목록 처리** 세 가지 축으로 접근합니다.

### 최적화 방법 요약

| 방법 | 도구 | 효과 |
|------|------|------|
| 컴포넌트 메모이제이션 | React.memo | props 미변경 시 리렌더링 방지 |
| 값 메모이제이션 | useMemo | 비싼 계산 결과 캐싱 |
| 함수 메모이제이션 | useCallback | 함수 참조 안정화 |
| 코드 스플리팅 | React.lazy, Suspense | 초기 번들 크기 감소 |
| 목록 가상화 | react-window, react-virtual | 긴 목록 DOM 노드 수 감소 |
| 이미지 최적화 | lazy loading, WebP | 네트워크 로딩 속도 향상 |

### 면접관이 주목하는 포인트
- 최적화를 무분별하게 적용하지 않고 필요한 시점 판단
- 프로파일러로 병목 지점 먼저 확인하는 접근법

### 꼬리 질문 대비
- "React.memo와 useMemo의 차이는?" → React.memo는 컴포넌트 자체를 메모이제이션, useMemo는 컴포넌트 내부의 계산 값을 메모이제이션합니다

</details>

---

## Q19. useRef의 활용 방법은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
useRef는 두 가지 주요 용도가 있습니다. **DOM 요소에 직접 접근**하거나, **렌더링 사이에 값을 유지**하되 값 변경 시 리렌더링을 유발하지 않는 경우에 사용합니다.

### useRef 활용 예시

```javascript
// DOM 접근
const inputRef = useRef(null);
inputRef.current.focus(); // input에 포커스

// 렌더링 간 값 유지 (리렌더링 없음)
const prevCountRef = useRef(0);
useEffect(() => {
  prevCountRef.current = count; // 렌더링 없이 값 저장
});
```

### useState vs useRef 비교

| 구분 | useState | useRef |
|------|---------|--------|
| 값 변경 시 리렌더링 | O | X |
| 렌더링 간 값 유지 | O | O |
| DOM 접근 | X | O |

### 면접관이 주목하는 포인트
- ref와 state의 차이를 정확히 이해
- 렌더링 간 값 유지 용도 인지

### 꼬리 질문 대비
- "forwardRef는 언제 사용하나요?" → 부모 컴포넌트가 자식 컴포넌트의 DOM 노드에 ref로 접근해야 할 때 사용합니다

</details>

---

## Q20. React에서 리렌더링이 발생하는 조건은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
리렌더링은 **state 변경, props 변경, 부모 컴포넌트 리렌더링, Context 값 변경** 시 발생합니다. 부모가 리렌더링되면 자식도 기본적으로 함께 리렌더링됩니다.

### 리렌더링 발생 조건

```
1. state 변경 (Object.is로 비교, 다른 값이면 리렌더링)
2. props 변경 (부모가 렌더링되면 자식도 기본 리렌더링)
3. 부모 컴포넌트 리렌더링
4. Context 값 변경
5. forceUpdate() 호출 (클래스 컴포넌트)
```

### 리렌더링 방지 방법

| 방법 | 용도 |
|------|------|
| React.memo | props 미변경 시 자식 리렌더링 방지 |
| useMemo | 비싼 계산 결과 캐싱 |
| useCallback | 함수 참조 안정화로 자식 리렌더링 방지 |
| state 분리 | 관련 없는 state를 별도 컴포넌트로 분리 |

### 면접관이 주목하는 포인트
- 부모 리렌더링 시 자식도 리렌더링된다는 점 이해
- React.memo + useCallback 조합의 효과

### 꼬리 질문 대비
- "Context를 쓸 때 성능 이슈가 생기는 이유는?" → Context 값이 변경되면 해당 Context를 구독하는 모든 컴포넌트가 리렌더링되기 때문입니다. Context를 세분화하거나 useMemo로 값을 안정화해 방지합니다

</details>

---

## Q21. SPA(Single Page Application)란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
SPA는 **최초 한 번만 HTML/JS 리소스를 전체 로드**하고, 이후 페이지 이동은 JavaScript로 처리합니다. 서버에 매번 요청하지 않아 부드러운 사용자 경험을 제공하지만 초기 로딩이 느리고 SEO에 불리합니다.

### SPA vs MPA 비교

| 구분 | SPA | MPA |
|------|-----|-----|
| 초기 로딩 | 느림 (전체 JS 로드) | 빠름 |
| 이후 네비게이션 | 빠름 (JS 라우팅) | 느림 (서버 요청) |
| SEO | 불리 (CSR 기본) | 유리 |
| 서버 부하 | 낮음 | 높음 |

### 면접관이 주목하는 포인트
- SPA의 장단점 균형 있게 설명
- 단점 해결 방법 언급

### 꼬리 질문 대비
- "SPA의 SEO 문제 해결 방법은?" → SSR/SSG (Next.js 등), Prerendering, Dynamic Rendering을 통해 크롤러가 콘텐츠를 읽을 수 있게 합니다

</details>

---

## Q22. CSR과 SSR, SEO의 관계를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSR은 JS를 다운로드 후 클라이언트에서 렌더링하여 SEO에 불리합니다. SSR은 서버에서 완성된 HTML을 전달해 SEO에 유리하고 초기 TTV(Time to View)가 빠릅니다. 그러나 SSR은 서버 부하가 높고, HTML 전달 후 JS 이벤트를 붙이는 **하이드레이션(Hydration)** 과정이 필요합니다.

### CSR / SSR / SSG 비교

| 구분 | CSR | SSR | SSG |
|------|-----|-----|-----|
| 렌더링 위치 | 클라이언트 | 서버 (요청마다) | 빌드 타임 |
| 초기 로딩 | 느림 | 빠름 | 가장 빠름 |
| SEO | 불리 | 유리 | 유리 |
| 서버 부하 | 낮음 | 높음 | 없음 |
| 데이터 신선도 | 최신 | 최신 | 빌드 시점 |

### 면접관이 주목하는 포인트
- TTV와 TTI(Time to Interactive)의 차이 인지
- 하이드레이션 개념 이해

### 꼬리 질문 대비
- "하이드레이션(Hydration)이란?" → SSR로 받은 정적 HTML에 React가 이벤트 리스너 등 JS 기능을 붙이는 과정입니다. 이 과정 전에는 화면은 보이지만 상호작용이 불가합니다

</details>

---

## Q23. React Suspense란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Suspense는 **비동기 작업(코드 스플리팅, 데이터 페칭) 중 로딩 UI를 선언적으로 처리**하는 기능입니다. 컴포넌트가 준비되기 전까지 `fallback` UI를 보여줍니다.

### 코드 스플리팅 + Suspense

```jsx
const LazyComponent = React.lazy(() => import('./Component'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Suspense 활용 영역

| 활용 | 설명 |
|------|------|
| React.lazy() + Suspense | 코드 스플리팅, 동적 임포트 |
| 데이터 페칭 | TanStack Query, SWR과 연동한 선언적 로딩 처리 |
| startTransition | 낮은 우선순위 업데이트를 Suspense로 처리 |

### 면접관이 주목하는 포인트
- 선언적 비동기 처리의 장점 설명
- React.lazy와의 연계 이해

### 꼬리 질문 대비
- "Suspense와 ErrorBoundary는 어떻게 함께 쓰나요?" → Suspense는 로딩 상태, ErrorBoundary는 에러 상태를 선언적으로 처리합니다. 두 컴포넌트를 중첩해 로딩과 에러를 모두 우아하게 처리합니다

</details>

---

## 학습 체크리스트

- [ ] Virtual DOM의 동작 원리와 이점 설명 가능
- [ ] 재조정 알고리즘과 key의 역할 이해
- [ ] Fiber 아키텍처가 해결한 문제 설명 가능
- [ ] useEffect vs useLayoutEffect 차이 암기
- [ ] useMemo/useCallback 적절한 사용 시점 판단
- [ ] React 배칭(Batching) 동작 이해
- [ ] React가 라이브러리인 이유 설명 가능
- [ ] 함수 컴포넌트와 클래스 컴포넌트 차이 이해
- [ ] Props와 State 차이 설명 가능
- [ ] 제어/비제어 컴포넌트 패턴 이해
- [ ] FLUX 패턴과 단방향 데이터 흐름 이해
- [ ] Redux 동작 원리 설명 가능
- [ ] 현대 상태 관리 라이브러리 비교 가능
- [ ] State 불변성 유지 이유 설명 가능
- [ ] 순수 함수와 부수효과 개념 이해
- [ ] 컴포넌트 라이프사이클 설명 가능
- [ ] React 성능 최적화 기법 이해
- [ ] useRef 활용 방법 이해
- [ ] 리렌더링 조건과 방지 방법 이해
- [ ] SPA 개념과 장단점 이해
- [ ] CSR/SSR과 SEO 관계 설명 가능
- [ ] Suspense 활용 이해
