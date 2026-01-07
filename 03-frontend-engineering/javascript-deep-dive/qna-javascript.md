# JavaScript 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 실행 컨텍스트(Execution Context)란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
실행 컨텍스트는 JavaScript 코드가 실행되는 환경으로, **변수, 함수 선언, this 바인딩** 등의 정보를 담고 있습니다.

### 실행 컨텍스트의 종류

| 종류 | 생성 시점 |
|------|----------|
| Global Execution Context | 스크립트 실행 시 |
| Function Execution Context | 함수 호출 시 |
| Eval Execution Context | eval() 호출 시 |

### 실행 컨텍스트의 구성

```
Execution Context
├── Lexical Environment (렉시컬 환경)
│   ├── Environment Record (환경 레코드) - 변수, 함수 저장
│   └── Outer Lexical Environment Reference (외부 참조) - 스코프 체인
│
├── Variable Environment (변수 환경)
│   └── var 선언 변수 저장
│
└── This Binding (this 바인딩)
```

### 콜 스택과 실행 컨텍스트

```javascript
function first() {
    console.log('first');
    second();
}

function second() {
    console.log('second');
}

first();

// 콜 스택 변화:
// 1. [Global]
// 2. [Global, first]
// 3. [Global, first, second]
// 4. [Global, first]  - second 종료
// 5. [Global]         - first 종료
```

### 생성 단계 vs 실행 단계

**1. Creation Phase (생성 단계)**
- 변수/함수 선언을 메모리에 등록 (호이스팅)
- 스코프 체인 설정
- this 바인딩

**2. Execution Phase (실행 단계)**
- 코드 한 줄씩 실행
- 변수에 값 할당

### 면접관이 주목하는 포인트
- 호이스팅이 왜 발생하는지 설명
- 스코프 체인의 동작 원리

</details>

---

## Q2. 호이스팅(Hoisting)이란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
호이스팅은 변수와 함수 선언이 코드 실행 전에 해당 스코프의 최상단으로 끌어올려지는 것처럼 동작하는 현상입니다.

### var vs let/const 호이스팅

```javascript
// var - 선언과 초기화가 동시에 (undefined)
console.log(a);  // undefined (에러 아님!)
var a = 10;

// let/const - 선언만, 초기화는 나중에 (TDZ)
console.log(b);  // ReferenceError: Cannot access 'b' before initialization
let b = 20;
```

### TDZ (Temporal Dead Zone)

```javascript
// TDZ 시작 ─────────────────┐
console.log(x);  // TDZ 구간  │ ReferenceError
let x = 10;      // TDZ 종료 ─┘
console.log(x);  // 10
```

### 함수 호이스팅

```javascript
// 함수 선언문 - 완전히 호이스팅
sayHello();  // "Hello!" (정상 동작)
function sayHello() {
    console.log("Hello!");
}

// 함수 표현식 - 변수만 호이스팅
sayBye();  // TypeError: sayBye is not a function
var sayBye = function() {
    console.log("Bye!");
};
```

### 호이스팅 비교 정리

| 선언 방식 | 호이스팅 | 초기값 | TDZ |
|----------|:--------:|:------:|:---:|
| var | O | undefined | X |
| let | O | X (TDZ) | O |
| const | O | X (TDZ) | O |
| 함수 선언문 | O (전체) | 함수 자체 | X |
| 함수 표현식 | 변수만 | undefined/TDZ | 변수 따름 |

### 면접관이 주목하는 포인트
- TDZ의 존재 이유
- var와 let/const의 차이

### 꼬리 질문 대비
- "TDZ가 왜 필요한가요?"
  → 선언 전 접근을 에러로 처리해 버그 방지, 더 예측 가능한 코드

</details>

---

## Q3. 클로저(Closure)란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
클로저는 **함수와 그 함수가 선언된 렉시컬 환경의 조합**입니다. 내부 함수가 외부 함수의 변수에 접근할 수 있는 것을 의미합니다.

### 클로저 기본 예시

```javascript
function outer() {
    const message = 'Hello';  // 외부 함수의 변수

    function inner() {
        console.log(message);  // 클로저! 외부 변수 참조
    }

    return inner;
}

const closure = outer();
closure();  // "Hello" - outer는 종료됐지만 message 접근 가능
```

### 클로저의 동작 원리

```
outer() 호출 시:
┌─────────────────────────────┐
│ outer Execution Context     │
│   message: 'Hello'          │
│   inner: function           │
│     └── [[Environment]]: outer의 렉시컬 환경 참조
└─────────────────────────────┘

outer() 종료 후에도 inner가 outer의 렉시컬 환경을 참조하므로
message 변수는 가비지 컬렉션되지 않음
```

### 클로저 활용 1: 은닉화 (Private 변수)

```javascript
function createCounter() {
    let count = 0;  // private 변수

    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
console.log(counter.count);  // undefined (직접 접근 불가)
console.log(counter.getCount());  // 2
```

### 클로저 활용 2: 함수 팩토리

```javascript
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### 클로저 주의점: 반복문

```javascript
// 문제: var는 함수 스코프
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// 출력: 3, 3, 3 (모두 같은 i 참조)

// 해결 1: let 사용 (블록 스코프)
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// 출력: 0, 1, 2

// 해결 2: 클로저로 값 캡처
for (var i = 0; i < 3; i++) {
    ((j) => {
        setTimeout(() => console.log(j), 100);
    })(i);
}
// 출력: 0, 1, 2
```

### 면접관이 주목하는 포인트
- 클로저의 정확한 정의
- 실제 활용 사례

### 꼬리 질문 대비
- "클로저의 단점은?"
  → 메모리 누수 가능성 (참조가 유지되어 GC 안됨)
- "React에서 클로저가 사용되는 곳은?"
  → useState, useEffect의 의존성 배열, 이벤트 핸들러

</details>

---

## Q4. 이벤트 루프(Event Loop)를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
이벤트 루프는 JavaScript의 **싱글 스레드 환경에서 비동기 작업을 처리**하는 메커니즘입니다. 콜 스택, 태스크 큐, 마이크로태스크 큐를 모니터링하며 작업을 조율합니다.

### 구성 요소

```
┌─────────────────────────────────────────────────────┐
│                    JavaScript Engine                 │
│  ┌─────────────┐          ┌─────────────────┐       │
│  │  Call Stack │          │   Memory Heap   │       │
│  │             │          │                 │       │
│  └─────────────┘          └─────────────────┘       │
└─────────────────────────────────────────────────────┘
         ↑
         │ (콜 스택 비어있으면 태스크 이동)
         │
┌────────┴────────────────────────────────────────────┐
│                    Event Loop                        │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │          Microtask Queue (우선순위 높음)      │    │
│  │   Promise.then, queueMicrotask, async/await  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │          Macrotask Queue (Task Queue)        │    │
│  │   setTimeout, setInterval, I/O, UI 렌더링    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 이벤트 루프 동작 순서

```
1. 콜 스택의 동기 코드 실행
2. 콜 스택이 비면 마이크로태스크 큐 전체 실행
3. 마이크로태스크 큐가 비면 매크로태스크 1개 실행
4. 2-3 반복
```

### 실행 순서 예측 문제

```javascript
console.log('1');  // 동기

setTimeout(() => {
    console.log('2');  // 매크로태스크
}, 0);

Promise.resolve().then(() => {
    console.log('3');  // 마이크로태스크
});

console.log('4');  // 동기

// 출력 순서: 1 → 4 → 3 → 2
```

### 복잡한 예시

```javascript
console.log('start');

setTimeout(() => console.log('timeout'), 0);

Promise.resolve()
    .then(() => {
        console.log('promise1');
        return Promise.resolve();
    })
    .then(() => console.log('promise2'));

console.log('end');

// 출력: start → end → promise1 → promise2 → timeout
```

### 마이크로태스크 vs 매크로태스크

| 구분 | 마이크로태스크 | 매크로태스크 |
|------|---------------|--------------|
| 우선순위 | 높음 | 낮음 |
| 실행 | 큐 전체 실행 | 하나씩 실행 |
| 예시 | Promise.then, async/await, queueMicrotask | setTimeout, setInterval, requestAnimationFrame |

### 면접관이 주목하는 포인트
- 실행 순서 정확히 예측
- 마이크로/매크로태스크 구분

### 꼬리 질문 대비
- "setTimeout(fn, 0)이 즉시 실행되지 않는 이유?"
  → 콜 스택이 비고 마이크로태스크가 모두 처리된 후 실행
- "requestAnimationFrame은 어디에 속하나요?"
  → 매크로태스크, 렌더링 전에 실행

</details>

---

## Q5. this 바인딩 규칙을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
JavaScript의 this는 **함수가 호출되는 방식**에 따라 동적으로 결정됩니다.

### this 바인딩 4가지 규칙

```javascript
// 1. 기본 바인딩 - 전역 객체 (strict mode: undefined)
function showThis() {
    console.log(this);
}
showThis();  // window (브라우저) 또는 global (Node.js)

// 2. 암시적 바인딩 - 호출 객체
const obj = {
    name: 'object',
    showThis: function() {
        console.log(this.name);
    }
};
obj.showThis();  // "object"

// 3. 명시적 바인딩 - call, apply, bind
function greet(greeting) {
    console.log(`${greeting}, ${this.name}`);
}
const person = { name: 'John' };
greet.call(person, 'Hello');   // "Hello, John"
greet.apply(person, ['Hi']);   // "Hi, John"
const boundGreet = greet.bind(person);
boundGreet('Hey');             // "Hey, John"

// 4. new 바인딩 - 새 객체
function Person(name) {
    this.name = name;
}
const john = new Person('John');  // this = 새로 생성된 객체
```

### 우선순위

```
new 바인딩 > 명시적 바인딩 (call/apply/bind) > 암시적 바인딩 > 기본 바인딩
```

### 화살표 함수의 this

```javascript
const obj = {
    name: 'object',
    // 일반 함수 - this는 호출 객체
    regular: function() {
        console.log(this.name);
    },
    // 화살표 함수 - this는 상위 스코프 (렉시컬 this)
    arrow: () => {
        console.log(this.name);  // 상위 스코프의 this
    }
};

obj.regular();  // "object"
obj.arrow();    // undefined (전역의 this)
```

### 콜백에서의 this 문제

```javascript
const obj = {
    name: 'object',
    delayedLog: function() {
        // 문제: 일반 함수
        setTimeout(function() {
            console.log(this.name);  // undefined
        }, 100);

        // 해결 1: 화살표 함수
        setTimeout(() => {
            console.log(this.name);  // "object"
        }, 100);

        // 해결 2: bind
        setTimeout(function() {
            console.log(this.name);
        }.bind(this), 100);
    }
};
```

### 면접관이 주목하는 포인트
- 4가지 규칙과 우선순위
- 화살표 함수의 this

</details>

---

## Q6. Promise와 async/await의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
async/await는 Promise를 더 **동기 코드처럼 읽기 쉽게** 작성할 수 있는 문법적 설탕(Syntactic Sugar)입니다.

### Promise 체이닝 vs async/await

```javascript
// Promise 체이닝
function fetchData() {
    return fetch('/api/user')
        .then(response => response.json())
        .then(user => fetch(`/api/posts/${user.id}`))
        .then(response => response.json())
        .then(posts => console.log(posts))
        .catch(error => console.error(error));
}

// async/await
async function fetchData() {
    try {
        const userResponse = await fetch('/api/user');
        const user = await userResponse.json();
        const postsResponse = await fetch(`/api/posts/${user.id}`);
        const posts = await postsResponse.json();
        console.log(posts);
    } catch (error) {
        console.error(error);
    }
}
```

### 에러 처리

```javascript
// Promise - catch 메서드
fetchData()
    .then(data => process(data))
    .catch(err => handleError(err))
    .finally(() => cleanup());

// async/await - try-catch
async function process() {
    try {
        const data = await fetchData();
        return processData(data);
    } catch (err) {
        handleError(err);
    } finally {
        cleanup();
    }
}
```

### 병렬 실행

```javascript
// 순차 실행 (느림)
async function sequential() {
    const a = await fetchA();  // 1초
    const b = await fetchB();  // 1초
    return [a, b];  // 총 2초
}

// 병렬 실행 (빠름)
async function parallel() {
    const [a, b] = await Promise.all([
        fetchA(),  // 동시 시작
        fetchB()
    ]);
    return [a, b];  // 총 1초
}
```

### Promise 유틸리티 메서드

| 메서드 | 설명 |
|--------|------|
| Promise.all | 모두 성공 시 결과 배열, 하나라도 실패 시 즉시 reject |
| Promise.allSettled | 모든 결과 (성공/실패) 배열 반환 |
| Promise.race | 가장 먼저 완료된 결과 반환 |
| Promise.any | 가장 먼저 성공한 결과 반환 |

### 면접관이 주목하는 포인트
- 병렬 vs 순차 실행 이해
- 에러 처리 방법

</details>

---

## Q7. == 와 ===의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 연산자 | 비교 방식 | 타입 변환 |
|--------|----------|----------|
| == (동등) | 값만 비교 | O (암묵적 변환) |
| === (일치) | 값 + 타입 비교 | X |

### 예시

```javascript
// == (암묵적 타입 변환)
1 == '1'        // true
0 == false      // true
null == undefined  // true
'' == false     // true

// === (타입까지 비교)
1 === '1'       // false
0 === false     // false
null === undefined  // false
```

### 권장사항
- 항상 `===` 사용 권장
- ESLint eqeqeq 규칙 활성화

</details>

---

## 학습 체크리스트

- [ ] 실행 컨텍스트 구성 요소 설명 가능
- [ ] 호이스팅과 TDZ 차이 설명 가능
- [ ] 클로저 정의와 활용 사례 3가지 이상
- [ ] 이벤트 루프 실행 순서 예측 가능
- [ ] this 바인딩 4가지 규칙 암기
- [ ] Promise와 async/await 차이 설명 가능
