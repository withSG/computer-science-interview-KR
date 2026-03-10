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

## Q8. var, let, const의 차이점은 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
var는 **함수 레벨 스코프**, let과 const는 **블록 레벨 스코프**를 가집니다. var는 재선언과 재할당이 가능하고, let은 재할당만 가능하며, const는 둘 다 불가능합니다. let과 const는 **TDZ(Temporal Dead Zone)**가 존재하여 선언 전 접근 시 ReferenceError가 발생합니다.

### 비교 정리

| 구분 | var | let | const |
|------|:---:|:---:|:-----:|
| 스코프 | 함수 레벨 | 블록 레벨 | 블록 레벨 |
| 재선언 | O | X | X |
| 재할당 | O | O | X |
| 호이스팅 | O (undefined 초기화) | O (TDZ) | O (TDZ) |
| 전역 객체 프로퍼티 | O (window.x) | X | X |

### 스코프 차이 예시

```javascript
// var - 함수 레벨 스코프
if (true) {
    var x = 10;
}
console.log(x);  // 10 (블록 밖에서도 접근 가능)

// let - 블록 레벨 스코프
if (true) {
    let y = 20;
}
console.log(y);  // ReferenceError: y is not defined
```

### 호이스팅과 TDZ

```
var 선언 ─── 선언 + 초기화(undefined) 동시 진행
let 선언 ─── 선언만 진행 → TDZ 구간 → 초기화(변수 선언문 도달 시)
const 선언 ── 선언 + 초기화 + 할당 동시 진행
```

```javascript
console.log(a);  // undefined (var는 선언과 동시에 초기화)
var a = 10;

console.log(b);  // ReferenceError (TDZ 구간)
let b = 20;
```

### 면접관이 주목하는 포인트
- var의 문제점과 let/const 도입 이유
- TDZ의 존재 이유와 동작 원리

### 꼬리 질문 대비
- "const로 선언한 객체의 프로퍼티는 변경 가능한가요?"
  → 가능. const는 재할당을 금지할 뿐, 객체 내부 프로퍼티 변경은 허용

</details>

---

## Q9. JavaScript의 데이터 타입에 대해 설명해주세요. ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
JavaScript는 **7가지 원시 타입**(number, string, boolean, undefined, null, symbol, bigint)과 **객체 타입**으로 나뉩니다. 원시 타입은 변경 불가능한 값이며, 객체 타입은 변경 가능한 값입니다. JavaScript는 **동적 타이핑** 언어로, 변수의 타입이 할당 시점에 결정됩니다.

### 데이터 타입 종류

| 구분 | 데이터 타입 | 설명 |
|:---:|:---:|:---:|
| 원시 타입 | number | 정수와 실수 구분 없이 하나의 숫자 타입 |
| 원시 타입 | string | 문자열 |
| 원시 타입 | boolean | 논리적 참(true)과 거짓(false) |
| 원시 타입 | undefined | 선언 후 값이 할당되지 않은 변수의 기본값 |
| 원시 타입 | null | 값이 없다는 것을 의도적으로 명시 |
| 원시 타입 | symbol | ES6에서 추가된 고유한 식별자 |
| 원시 타입 | bigint | 길이 제약 없이 정수를 다루는 숫자형 |
| 객체 타입 | object | 객체, 함수, 배열 등 |

### 동적 타이핑

```javascript
var foo;
console.log(typeof foo);  // undefined

foo = 3;
console.log(typeof foo);  // number

foo = 'hello';
console.log(typeof foo);  // string

foo = true;
console.log(typeof foo);  // boolean

foo = {};
console.log(typeof foo);  // object

foo = function() {};
console.log(typeof foo);  // function
```

### 데이터 타입이 필요한 이유

```
1. 값을 저장할 때 확보해야 하는 메모리 공간의 크기 결정
2. 값을 참조할 때 읽어야 할 메모리 공간의 크기 결정
3. 메모리에서 읽은 2진수를 어떻게 해석할지 결정
```

### 면접관이 주목하는 포인트
- 원시 타입과 객체 타입의 차이 (불변성, 참조)
- typeof 연산자의 특이 케이스 (null → "object")

### 꼬리 질문 대비
- "typeof null이 'object'인 이유는?"
  → JavaScript 초기 구현의 버그가 하위 호환성을 위해 유지됨

</details>

---

## Q10. 스코프와 스코프 체인이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
스코프는 **식별자(변수)가 유효한 범위**를 말하며, JavaScript 엔진이 식별자를 검색할 때 사용하는 규칙입니다. 스코프 체인은 스코프가 **계층적으로 연결된 구조**로, 변수를 찾을 때 현재 스코프에서 시작하여 상위 스코프로 순차적으로 탐색합니다. JavaScript는 **렉시컬 스코프**를 따르며, 함수가 **정의된 위치**에 따라 상위 스코프가 결정됩니다.

### 스코프의 종류

| 종류 | 설명 | 예시 |
|------|------|------|
| 전역 스코프 | 코드의 가장 바깥 영역 | 어디서든 참조 가능 |
| 함수 스코프 | 함수 몸체 내부 | 함수 내에서만 참조 가능 |
| 블록 스코프 | {} 내부 (let/const) | 블록 내에서만 참조 가능 |

### 스코프 체인 동작 원리

```
Global Scope
├── outer 함수 Scope
│   ├── outerVar: 'I am from outer'
│   └── inner 함수 Scope
│       └── innerVar: 'I am from inner'
│           → outerVar 접근 가능 (스코프 체인 탐색)
```

```javascript
function outer() {
    let outerVar = 'I am from outer';

    function inner() {
        let innerVar = 'I am from inner';
        console.log(outerVar);  // 접근 가능 (스코프 체인)
        console.log(innerVar);  // 접근 가능
    }

    inner();
    // console.log(innerVar);  // ReferenceError (하위 스코프 접근 불가)
}
```

### 렉시컬 스코프 (정적 스코프)

```javascript
var x = 1;

function foo() {
    var x = 10;
    bar();  // bar는 전역에서 정의됨 → 전역 스코프 참조
}

function bar() {
    console.log(x);
}

foo();  // 1 (호출 위치가 아닌 정의 위치 기준)
bar();  // 1
```

### 면접관이 주목하는 포인트
- 렉시컬 스코프 개념 (호출 위치 vs 정의 위치)
- 스코프 체인을 통한 변수 탐색 방향 (안 → 밖)

### 꼬리 질문 대비
- "스코프 체인과 클로저의 관계는?"
  → 클로저는 함수가 자신의 렉시컬 스코프를 기억하여 외부 함수의 변수에 접근하는 것

</details>

---

## Q11. 프로토타입과 프로토타입 체인을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
프로토타입은 JavaScript에서 **상속을 구현하기 위한 메커니즘**입니다. 모든 객체는 `__proto__`를 통해 자신의 프로토타입 객체를 참조하며, 생성자 함수의 `prototype` 프로퍼티가 인스턴스의 프로토타입이 됩니다. 프로토타입 체인은 객체의 프로퍼티에 접근할 때 **현재 객체 → 프로토타입 → 상위 프로토타입** 순으로 탐색하는 메커니즘입니다.

### 프로토타입 구조

```
┌──────────────────────┐
│  Person (생성자 함수) │
│  prototype ──────────┼──→ Person.prototype
└──────────────────────┘      │  constructor → Person
                              │  sayHi: function
       ┌──────────────┐       │
       │  me (인스턴스) │       │
       │  name: 'Lee' │       │
       │  __proto__ ───┼──────┘
       └──────────────┘
```

### 프로토타입 체인 탐색

```javascript
function Person(name) {
    this.name = name;
}

Person.prototype.sayHi = function() {
    console.log(`Hi! My name is ${this.name}`);
};

const me = new Person('Lee');

// 프로토타입 체인 탐색
me.sayHi();           // me → Person.prototype에서 발견
me.toString();        // me → Person.prototype → Object.prototype에서 발견
console.log(me.foo);  // me → Person.prototype → Object.prototype → null → undefined
```

### __proto__ vs prototype

| 구분 | __proto__ | prototype |
|------|-----------|-----------|
| 소유 | 모든 객체 | 생성자 함수 |
| 역할 | 프로토타입 참조 (상속 탐색) | 인스턴스의 프로토타입 설정 |
| 용도 | 프로토타입 체인 탐색 | 상속할 메서드 정의 |

### Object.create를 통한 프로토타입 설정

```javascript
const parent = {
    greet() {
        console.log('Hello from parent');
    }
};

const child = Object.create(parent);
child.greet();  // "Hello from parent" (프로토타입 체인)

console.log(Object.getPrototypeOf(child) === parent);  // true
```

### 면접관이 주목하는 포인트
- __proto__와 prototype의 차이
- 프로토타입 체인의 끝 (Object.prototype → null)

### 꼬리 질문 대비
- "프로토타입 체인과 스코프 체인의 차이는?"
  → 프로토타입 체인은 프로퍼티 검색, 스코프 체인은 식별자(변수) 검색
- "hasOwnProperty()의 역할은?"
  → 프로토타입 체인을 탐색하지 않고 객체 자체의 프로퍼티인지 확인

</details>

---

## Q12. ES6 클래스와 생성자 함수의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
ES6 클래스는 프로토타입 기반 객체지향을 **더 쉽게 작성할 수 있는 문법적 설탕**입니다. 생성자 함수와 달리 **new 없이 호출 시 에러** 발생, **extends/super로 상속** 지원, **암묵적 strict mode** 적용, **호이스팅이 발생하지 않는 것처럼 동작**하는 차이가 있습니다.

### 클래스 vs 생성자 함수 비교

| 구분 | 클래스 | 생성자 함수 |
|------|--------|-------------|
| new 없이 호출 | TypeError | 일반 함수로 동작 |
| 상속 | extends/super 지원 | 지원하지 않음 |
| 호이스팅 | TDZ 존재 (선언 전 사용 불가) | 함수 선언문은 완전 호이스팅 |
| strict mode | 자동 적용 | 수동 설정 필요 |
| 열거 | 메서드 [[Enumerable]] = false | 열거 가능 |

### 문법 비교

```javascript
// 생성자 함수 방식
function Person(name) {
    this.name = name;
}
Person.prototype.sayHi = function() {
    console.log('Hi! My name is ' + this.name);
};

// ES6 클래스 방식
class Person {
    constructor(name) {
        this.name = name;
    }
    sayHi() {
        console.log(`Hi! My name is ${this.name}`);
    }
    static sayHello() {
        console.log('Hello!');
    }
}
```

### 클래스 상속 (extends/super)

```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        return `${this.name} makes a sound.`;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);  // 부모 constructor 호출
        this.breed = breed;
    }
    speak() {
        return `${this.name} barks!`;  // 메서드 오버라이딩
    }
}

const dog = new Dog('Rex', 'Shepherd');
console.log(dog.speak());  // "Rex barks!"
console.log(dog instanceof Animal);  // true
```

### 면접관이 주목하는 포인트
- 클래스가 단순 문법적 설탕이 아닌 차이점들
- extends/super를 통한 상속 구현

### 꼬리 질문 대비
- "정적 메서드와 프로토타입 메서드의 차이는?"
  → 정적 메서드는 클래스로 호출, 프로토타입 메서드는 인스턴스로 호출

</details>

---

## Q13. DOM이란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
DOM(Document Object Model)은 **HTML 문서의 계층적 구조와 정보를 표현**하며, 이를 제어할 수 있는 **API(프로퍼티와 메서드)를 제공하는 트리 자료구조**입니다. 브라우저의 렌더링 엔진이 HTML을 파싱하여 DOM 트리를 생성합니다.

### DOM 트리 구조

```
Document (문서 노드)
└── html (요소 노드)
    ├── head (요소 노드)
    │   └── title (요소 노드)
    │       └── "Document" (텍스트 노드)
    └── body (요소 노드)
        └── div (요소 노드)
            ├── id="app" (어트리뷰트 노드)
            └── "Hello" (텍스트 노드)
```

### 주요 노드 타입

| 노드 타입 | 설명 |
|-----------|------|
| 문서 노드 (Document) | DOM 트리 최상위 루트 노드, document 객체 |
| 요소 노드 (Element) | HTML 요소를 가리키는 객체, 문서 구조 표현 |
| 어트리뷰트 노드 (Attr) | HTML 요소의 속성 (id, class 등) |
| 텍스트 노드 (Text) | HTML 요소의 텍스트, DOM 트리의 리프 노드 |

### 주요 DOM API

```javascript
// 요소 선택
document.getElementById('app');
document.querySelector('.class');
document.querySelectorAll('div');

// 요소 생성/추가
const el = document.createElement('div');
el.textContent = 'Hello';
document.body.appendChild(el);

// 요소 수정
el.setAttribute('class', 'active');
el.style.color = 'red';
el.classList.add('visible');

// 요소 삭제
el.remove();
```

### 면접관이 주목하는 포인트
- DOM이 트리 자료구조라는 점
- DOM 조작의 성능 비용 (리플로우, 리페인트)

### 꼬리 질문 대비
- "가상 DOM과 실제 DOM의 차이는?"
  → 가상 DOM은 실제 DOM의 경량 복사본으로, 변경 사항을 비교(diff)한 후 최소한의 DOM 조작만 수행

</details>

---

## Q14. 이벤트 전파(버블링/캡처링/위임)에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
이벤트 전파는 DOM 트리에서 이벤트가 **캡처링 단계**(상위→하위), **타깃 단계**(이벤트 타깃 도달), **버블링 단계**(하위→상위) 순으로 전파되는 것입니다. 브라우저는 기본적으로 **버블링 단계**에서 이벤트를 캐치합니다. **이벤트 위임**은 버블링을 활용하여 부모 요소에 이벤트 핸들러를 등록하는 패턴입니다.

### 이벤트 전파 3단계

```
           ① 캡처링 (위 → 아래)
Window ──────────────────────→ Target
  │                              │
  │    Document                  │
  │    └── body                  │
  │        └── div               │
  │            └── button ◀──────┘ ② 타깃
  │                              │
Window ◀─────────────────────── Target
           ③ 버블링 (아래 → 위)
```

### 이벤트 버블링

```javascript
const html = document.querySelector('html');
const body = document.querySelector('body');
const div = document.querySelector('div');

html.addEventListener('click', () => console.log('HTML'));
body.addEventListener('click', () => console.log('BODY'));
div.addEventListener('click', () => console.log('DIV'));

// div 클릭 시 출력: DIV → BODY → HTML (버블링)
```

### 이벤트 캡처링

```javascript
// 세 번째 인수를 true로 설정하면 캡처링 단계에서 캐치
html.addEventListener('click', () => console.log('HTML'), true);
body.addEventListener('click', () => console.log('BODY'), true);
div.addEventListener('click', () => console.log('DIV'));

// div 클릭 시 출력: HTML → BODY → DIV (캡처링 → 타깃)
```

### 이벤트 위임 (Event Delegation)

```javascript
// 개별 버튼에 이벤트를 등록하지 않고 부모에 위임
const container = document.querySelector('.container');

container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        console.log(e.target.textContent);  // 클릭한 버튼의 텍스트
    }
});
```

### stopPropagation

```javascript
div.addEventListener('click', (e) => {
    e.stopPropagation();  // 이벤트 전파 중단
    console.log('DIV만 실행');
});
```

### 면접관이 주목하는 포인트
- 캡처링과 버블링의 차이
- 이벤트 위임의 장점 (동적 요소 처리, 메모리 절약)

### 꼬리 질문 대비
- "이벤트 위임의 장점은?"
  → 동적으로 추가되는 요소에도 자동 적용, 이벤트 핸들러 수 감소로 메모리 효율적
- "stopPropagation과 preventDefault의 차이?"
  → stopPropagation은 전파 중단, preventDefault는 기본 동작 중단

</details>

---

## Q15. 디바운스와 쓰로틀의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
디바운스와 쓰로틀은 짧은 시간 간격으로 연속 발생하는 이벤트를 **그룹화하여 과도한 호출을 방지**하는 기법입니다. **디바운스**는 마지막 이벤트 후 일정 시간이 지나면 한 번 실행하고, **쓰로틀**은 일정 시간 간격으로 최대 한 번 실행합니다.

### 비교 정리

| 구분 | 디바운스 (Debounce) | 쓰로틀 (Throttle) |
|------|--------------------|--------------------|
| 동작 | 마지막 이벤트 후 delay 경과 시 실행 | delay 간격으로 최대 한 번 실행 |
| 활용 | 검색 입력, 리사이즈 완료 | 스크롤, 무한 스크롤, mousemove |
| 특징 | 연속 입력 중에는 실행 안됨 | 일정 간격으로 꾸준히 실행 |

### 타임라인 비교

```
이벤트 발생: ●●●●●●───────●●●●●●

디바운스:    ─────────────○─────────────○
             (마지막 이벤트 후 delay 경과 시 실행)

쓰로틀:     ○────○────○──○────○────○
             (일정 간격으로 실행)
```

### 디바운스 구현

```javascript
function debounce(callback, delay) {
    let timerId;
    return function(event) {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(callback, delay, event);
    };
}

// 사용 예: 검색 입력
input.oninput = debounce((e) => {
    fetchSearchResults(e.target.value);
}, 300);
```

### 쓰로틀 구현

```javascript
function throttle(callback, delay) {
    let timerId;
    return function(event) {
        if (timerId) return;  // 이미 타이머가 있으면 무시
        timerId = setTimeout(() => {
            callback(event);
            timerId = null;
        }, delay);
    };
}

// 사용 예: 무한 스크롤
window.addEventListener('scroll', throttle(() => {
    checkScrollPosition();
}, 1000));
```

### 면접관이 주목하는 포인트
- 두 기법의 차이를 명확히 구분
- 각각의 활용 사례

### 꼬리 질문 대비
- "lodash의 debounce/throttle과의 차이는?"
  → lodash는 leading/trailing 옵션, cancel, flush 등 추가 기능 제공
- "React에서 디바운스를 구현하려면?"
  → useRef로 타이머 ID 관리하거나 useMemo로 디바운스 함수 메모이제이션

</details>

---

## Q16. JavaScript의 가비지 컬렉션은 어떻게 동작하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
가비지 컬렉션은 **메모리 관리를 자동화**하여 더 이상 사용되지 않는 메모리를 해제하는 기능입니다. 현대 JavaScript 엔진은 주로 **mark-and-sweep 알고리즘**을 사용하며, GC 루트에서 도달 가능한 객체를 마크하고 도달 불가능한 객체를 수거합니다.

### 참조 카운팅 vs Mark-and-Sweep

| 구분 | 참조 카운팅 | Mark-and-Sweep |
|------|------------|----------------|
| 방식 | 참조 수 추적, 0이면 수거 | 도달 가능성 기반 마크 후 수거 |
| 장점 | 즉시 수거 가능 | 순환 참조 문제 해결 |
| 단점 | 순환 참조 해결 불가 | 정지 시간 발생 가능 |

### Mark-and-Sweep 동작 과정

```
1. Mark 단계: GC 루트에서 시작하여 도달 가능한 객체를 마크
2. Sweep 단계: 마크되지 않은 객체를 메모리에서 해제

GC Root (전역 객체, 콜 스택)
├── obj1 ✓ (마크 - 유지)
│   └── obj2 ✓ (마크 - 유지)
│
├── obj3 ✓ (마크 - 유지)
│
└── (obj4) ✗ (마크 안됨 - 수거 대상)
    └── (obj5) ✗ (마크 안됨 - 수거 대상)
```

### 메모리 누수 방지 패턴

```javascript
// 1. 불필요한 전역 변수 피하기
function foo() {
    leak = 'global';  // var/let/const 없이 선언 → 전역 변수!
}

// 2. 타이머 정리
const timer = setInterval(() => { /* ... */ }, 1000);
clearInterval(timer);  // 필요 없을 때 정리

// 3. 이벤트 리스너 정리
element.addEventListener('click', handler);
element.removeEventListener('click', handler);  // 정리

// 4. 클로저 주의
function outer() {
    const largeData = new Array(10000);
    return function inner() {
        // largeData 참조가 유지되어 GC 안됨
    };
}
```

### 최적화 기법

```
세대별 수집: 객체를 젊은/오래된 세대로 분류, 젊은 세대를 자주 수집
증분 수집: GC 작업을 여러 작은 단위로 나누어 정지 시간 최소화
동시 수집: 애플리케이션과 병렬로 GC 수행
```

### 면접관이 주목하는 포인트
- Mark-and-Sweep 알고리즘의 동작 원리
- 메모리 누수가 발생하는 케이스

### 꼬리 질문 대비
- "클로저에서 메모리 누수가 발생하는 이유는?"
  → 외부 함수의 변수가 내부 함수에 의해 참조되어 GC 대상에서 제외됨

</details>

---

## Q17. 일급 객체와 고차 함수란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
일급 객체란 **변수에 할당 가능, 함수의 인자로 전달 가능, 함수의 반환값으로 사용 가능**한 객체입니다. JavaScript의 함수는 일급 객체이므로 이러한 특성을 모두 갖습니다. **고차 함수**는 함수를 인수로 받거나 함수를 반환하는 함수로, 함수형 프로그래밍의 핵심입니다.

### 일급 객체 조건

| 조건 | JavaScript 함수 |
|------|-----------------|
| 무명 리터럴로 생성 가능 | `const fn = function() {}` |
| 변수/자료구조에 저장 가능 | `const obj = { fn: function() {} }` |
| 함수의 매개변수로 전달 가능 | `arr.map(fn)` |
| 함수의 반환값으로 사용 가능 | `return function() {}` |

### 고차 함수 예시

```javascript
// 대표적인 고차 함수: map, filter, reduce
const numbers = [1, 2, 3, 4, 5];

// map: 각 요소를 변환
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter: 조건에 맞는 요소만 추출
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce: 하나의 값으로 축약
const sum = numbers.reduce((acc, cur) => acc + cur, 0);
// 15
```

### 함수를 반환하는 고차 함수

```javascript
function makeCounter(predicate) {
    let num = 0;
    return function() {
        num = predicate(num);
        return num;
    };
}

const increase = makeCounter(n => n + 1);
console.log(increase());  // 1
console.log(increase());  // 2

const decrease = makeCounter(n => n - 1);
console.log(decrease());  // -1
```

### 함수형 프로그래밍

```
핵심 원칙:
├── 순수 함수: 동일 입력 → 동일 출력, 부수 효과 없음
├── 불변성: 데이터를 직접 변경하지 않고 새로운 데이터 생성
└── 고차 함수: 함수를 조합하여 로직 구성
```

### 면접관이 주목하는 포인트
- 일급 객체의 정확한 정의
- map, filter, reduce의 차이와 활용

### 꼬리 질문 대비
- "forEach와 map의 차이는?"
  → forEach는 undefined 반환 (반복 실행용), map은 새 배열 반환 (변환용)
- "순수 함수란?"
  → 외부 상태에 의존하지도 변경하지도 않는, 부수 효과 없는 함수

</details>

---

## Q18. 제너레이터 함수란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
제너레이터는 ES6에서 도입된 **코드 실행을 일시 중지했다가 필요 시 재개할 수 있는 특수한 함수**입니다. `function*`로 선언하고, `yield` 키워드로 실행을 양도하며, `next()` 메서드로 재개합니다. 호출 시 **이터러블이면서 이터레이터인 제너레이터 객체**를 반환합니다.

### 일반 함수와의 차이

| 구분 | 일반 함수 | 제너레이터 함수 |
|------|-----------|----------------|
| 제어권 | 함수가 독점 | 호출자에게 양도 가능 |
| 상태 교환 | 매개변수로만 전달 | yield/next로 양방향 교환 |
| 반환값 | 값을 반환 | 제너레이터 객체 반환 |

### 기본 사용법

```javascript
function* genFunc() {
    yield 1;
    yield 2;
    yield 3;
}

const generator = genFunc();

console.log(generator.next());  // { value: 1, done: false }
console.log(generator.next());  // { value: 2, done: false }
console.log(generator.next());  // { value: 3, done: false }
console.log(generator.next());  // { value: undefined, done: true }
```

### 이터러블/이터레이터 프로토콜

```javascript
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const fib = fibonacci();
console.log(fib.next().value);  // 0
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 2

// for...of 사용 가능 (이터러블)
function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

for (const num of range(1, 5)) {
    console.log(num);  // 1, 2, 3, 4, 5
}
```

### 양방향 통신

```javascript
function* dialog() {
    const name = yield '이름이 무엇인가요?';
    const age = yield `${name}님, 나이가 어떻게 되나요?`;
    return `${name}님은 ${age}살입니다.`;
}

const gen = dialog();
console.log(gen.next());           // { value: '이름이 무엇인가요?', done: false }
console.log(gen.next('홍길동'));    // { value: '홍길동님, 나이가 어떻게 되나요?', done: false }
console.log(gen.next(25));         // { value: '홍길동님은 25살입니다.', done: true }
```

### 면접관이 주목하는 포인트
- yield와 next()의 동작 방식
- 이터러블/이터레이터 프로토콜과의 관계

### 꼬리 질문 대비
- "제너레이터와 async/await의 관계는?"
  → async/await는 제너레이터 기반으로 동작하며, 프로미스가 settled 될 때까지 대기

</details>

---

## Q19. Map과 Set에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
**Map**은 키-값 쌍을 저장하는 컬렉션으로, 객체와 달리 **키에 모든 타입을 사용**할 수 있습니다. **Set**은 **중복을 허용하지 않는 값**의 컬렉션입니다. **WeakMap/WeakSet**은 약한 참조를 사용하여 가비지 컬렉션 대상이 될 수 있게 합니다.

### Map vs Object

| 구분 | Map | Object |
|------|-----|--------|
| 키 타입 | 모든 타입 (객체, 함수 등) | 문자열, Symbol만 |
| 순서 | 삽입 순서 보장 | 보장하지 않음 (ES2015+는 보장) |
| 크기 | map.size | Object.keys(obj).length |
| 순회 | for...of 직접 가능 | Object.keys/entries 필요 |
| 성능 | 빈번한 추가/삭제에 유리 | 정적 데이터에 유리 |

### Map 사용법

```javascript
const map = new Map();

map.set('1', 'str1');      // 문자열 키
map.set(1, 'num1');        // 숫자 키
map.set(true, 'bool1');    // 불리언 키

console.log(map.get(1));    // 'num1'
console.log(map.get('1'));  // 'str1' (타입 구분)
console.log(map.size);     // 3
console.log(map.has(1));   // true
```

### Set 사용법

```javascript
const set = new Set();

set.add(1);
set.add(2);
set.add(1);  // 중복이므로 무시

console.log(set.size);  // 2

// 배열 중복 제거
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)];  // [1, 2, 3, 4]
```

### WeakMap / WeakSet

```javascript
// WeakMap: 키가 객체만 가능, 약한 참조 → GC 대상 가능
const weakMap = new WeakMap();
let obj = { name: 'test' };
weakMap.set(obj, 'value');

obj = null;  // obj가 GC 대상이 되면 WeakMap에서도 자동 제거

// WeakSet: 값이 객체만 가능, 약한 참조
const weakSet = new WeakSet();
let item = { id: 1 };
weakSet.add(item);
```

### 면접관이 주목하는 포인트
- Map과 Object의 차이를 명확히 구분
- WeakMap/WeakSet의 활용 (메모리 누수 방지)

### 꼬리 질문 대비
- "WeakMap은 언제 사용하나요?"
  → DOM 요소에 추가 데이터 연결, 캐싱, 프라이빗 데이터 저장

</details>

---

## Q20. ES Modules과 CommonJS의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
**CommonJS**는 `require/module.exports`를 사용하는 Node.js의 모듈 시스템이고, **ES Modules**는 `import/export`를 사용하는 JavaScript 표준 모듈 시스템입니다. ES Modules는 **정적 분석**이 가능하여 **트리 쉐이킹**을 지원하고, CommonJS는 **동적 로딩**이 가능합니다.

### 비교 정리

| 구분 | CommonJS | ES Modules |
|------|----------|------------|
| 문법 | require / module.exports | import / export |
| 로딩 | 동적 (런타임) | 정적 (컴파일 타임) |
| 트리 쉐이킹 | 어려움 | 가능 |
| 비동기 로딩 | X | O (dynamic import) |
| 사용 환경 | Node.js | 브라우저 + Node.js |
| 기본 모드 | non-strict | strict mode |

### 문법 비교

```javascript
// === CommonJS ===
// 내보내기
module.exports = { add, subtract };
// 또는
exports.add = function(a, b) { return a + b; };

// 가져오기
const { add, subtract } = require('./math');
const math = require('./math');

// === ES Modules ===
// Named export
export function add(a, b) { return a + b; }
export const PI = 3.14;

// Default export
export default class Calculator { }

// 가져오기
import { add, PI } from './math.js';
import Calculator from './math.js';
import * as math from './math.js';
```

### 트리 쉐이킹

```
ES Modules (정적 분석 가능)
├── import { add } from './math.js'
│   → add만 번들에 포함, subtract는 제거 (트리 쉐이킹)
│
CommonJS (동적 분석)
├── const { add } = require('./math')
│   → 정적 분석 불가, 전체 모듈 포함
```

### Dynamic Import

```javascript
// ES Modules의 동적 import (코드 분할에 활용)
const module = await import('./math.js');
module.add(1, 2);

// 조건부 로딩
if (condition) {
    const { feature } = await import('./feature.js');
}
```

### 면접관이 주목하는 포인트
- 정적 분석과 트리 쉐이킹의 관계
- 각 모듈 시스템의 사용 환경

### 꼬리 질문 대비
- "트리 쉐이킹이란?"
  → 사용하지 않는 코드를 번들에서 제거하는 최적화 기법
- "Node.js에서 ES Modules를 사용하려면?"
  → package.json에 "type": "module" 설정 또는 .mjs 확장자 사용

</details>

---

## Q21. REST API란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
REST는 **HTTP를 기반으로 클라이언트가 서버의 리소스에 접근하는 방식을 규정한 아키텍처**이고, REST API는 REST를 기반으로 서비스 API를 구현한 것입니다. REST의 기본 원칙은 **URI는 리소스를 표현**하는 데 집중하고, **행위는 HTTP 요청 메서드**를 통해 정의하는 것입니다.

### REST API 구성 요소

| 구성 요소 | 내용 | 표현 방법 |
|-----------|------|-----------|
| 자원 (Resource) | 자원 | URI (엔드포인트) |
| 행위 (Verb) | 자원에 대한 행위 | HTTP 요청 메서드 |
| 표현 (Representations) | 행위의 구체적 내용 | 페이로드 (JSON 등) |

### HTTP 요청 메서드

| 메서드 | 종류 | 목적 | 페이로드 |
|--------|------|------|----------|
| GET | 조회 | 리소스 취득 | X |
| POST | 생성 | 리소스 생성 | O |
| PUT | 교체 | 리소스 전체 교체 | O |
| PATCH | 수정 | 리소스 일부 수정 | O |
| DELETE | 삭제 | 리소스 삭제 | X |

### RESTful URI 설계

```
# Bad (동사 사용)
GET  /getTodos/1
GET  /todos/show/1
POST /createTodo

# Good (명사 사용)
GET    /todos       ← 전체 조회
GET    /todos/1     ← 특정 조회
POST   /todos       ← 생성
PUT    /todos/1     ← 전체 수정
PATCH  /todos/1     ← 일부 수정
DELETE /todos/1     ← 삭제
```

### 주요 상태 코드

| 상태 코드 | 의미 | 설명 |
|-----------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 성공했으나 응답 본문 없음 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 에러 |

### 면접관이 주목하는 포인트
- RESTful 설계 원칙 (URI는 명사, 행위는 메서드)
- PUT과 PATCH의 차이

### 꼬리 질문 대비
- "PUT과 PATCH의 차이는?"
  → PUT은 리소스 전체 교체, PATCH는 일부 수정
- "REST API의 단점은?"
  → Over-fetching/Under-fetching 문제, 이를 해결하기 위해 GraphQL 등장

</details>

---

## Q22. JavaScript의 에러 처리 방법은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
JavaScript에서 에러 처리는 **try/catch/finally** 문을 통해 수행합니다. try 블록에서 에러 발생 시 catch 블록이 실행되어 프로그램의 **강제 종료를 방지**합니다. **throw** 문으로 의도적으로 에러를 발생시킬 수 있으며, JavaScript는 7가지 빌트인 Error 타입을 제공합니다.

### try / catch / finally

```javascript
try {
    // 에러가 발생할 수 있는 코드
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    // 에러 발생 시 실행
    console.error('에러 발생:', error.message);
} finally {
    // 에러 발생 여부와 관계없이 항상 실행
    cleanup();
}
```

### Error 타입

| 생성자 함수 | 설명 |
|-------------|------|
| Error | 일반적 에러 객체 |
| SyntaxError | 문법 오류 |
| ReferenceError | 참조할 수 없는 식별자 참조 |
| TypeError | 유효하지 않은 데이터 타입 |
| RangeError | 허용 범위를 벗어난 숫자 |
| URIError | 부적절한 URI 인수 전달 |
| EvalError | eval 함수 관련 에러 |

### throw 문으로 에러 발생

```javascript
function divide(a, b) {
    if (b === 0) {
        throw new Error('0으로 나눌 수 없습니다');
    }
    return a / b;
}

try {
    divide(10, 0);
} catch (error) {
    console.error(error.message);  // "0으로 나눌 수 없습니다"
}
```

### 커스텀 에러

```javascript
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

function validateAge(age) {
    if (typeof age !== 'number') {
        throw new ValidationError('숫자를 입력하세요', 'age');
    }
    if (age < 0 || age > 150) {
        throw new ValidationError('유효한 나이를 입력하세요', 'age');
    }
}

try {
    validateAge(-5);
} catch (error) {
    if (error instanceof ValidationError) {
        console.error(`${error.field}: ${error.message}`);
    }
}
```

### 에러 처리를 하지 않으면

```javascript
// 에러 미처리 → 프로그램 강제 종료
console.log('[Start]');
foo();  // ReferenceError → 프로그램 종료
console.log('[End]');  // 실행되지 않음

// 에러 처리 → 프로그램 계속 실행
console.log('[Start]');
try {
    foo();
} catch (error) {
    console.error('에러 발생:', error);
}
console.log('[End]');  // 정상 실행됨
```

### 면접관이 주목하는 포인트
- 에러 처리의 필요성 (프로그램 강제 종료 방지)
- try/catch와 Promise의 .catch() 비교

### 꼬리 질문 대비
- "비동기 코드에서의 에러 처리는?"
  → Promise는 .catch(), async/await는 try/catch 사용
- "에러와 예외의 차이는?"
  → 에러는 프로그래밍적 오류, 예외는 예측 가능한 비정상 상황

</details>

---

## 학습 체크리스트

- [ ] 실행 컨텍스트 구성 요소 설명 가능
- [ ] 호이스팅과 TDZ 차이 설명 가능
- [ ] 클로저 정의와 활용 사례 3가지 이상
- [ ] 이벤트 루프 실행 순서 예측 가능
- [ ] this 바인딩 4가지 규칙 암기
- [ ] Promise와 async/await 차이 설명 가능
- [ ] var/let/const 차이와 스코프 설명 가능
- [ ] 데이터 타입 종류와 동적 타이핑 이해
- [ ] 스코프 체인과 렉시컬 스코프 설명 가능
- [ ] 프로토타입 체인 동작 원리 이해
- [ ] ES6 클래스와 생성자 함수 차이 설명 가능
- [ ] DOM 구조와 API 이해
- [ ] 이벤트 버블링/캡처링/위임 설명 가능
- [ ] 디바운스와 쓰로틀 차이와 구현 가능
- [ ] 가비지 컬렉션 동작 원리 이해
- [ ] 일급 객체와 고차 함수 개념 설명 가능
- [ ] 제너레이터 함수 사용법 이해
- [ ] Map/Set 활용 방법 이해
- [ ] ES Modules과 CommonJS 차이 설명 가능
- [ ] REST API 설계 원칙 이해
- [ ] try/catch 에러 처리 패턴 이해
