# TypeScript 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. TypeScript를 사용하는 이유는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
TypeScript를 사용하는 가장 큰 이유는 **정적 타입 검사**로 런타임 에러를 프로그래밍 단계에서 미리 방지할 수 있기 때문입니다. JavaScript의 동적 타이핑은 의도치 않은 타입 오류를 런타임에야 발견하게 되지만, TypeScript는 컴파일 타임에 오류를 잡아줍니다. 또한 IDE 자동완성, 안전한 리팩토링, 협업 시 코드 가독성 향상의 이점도 있습니다.

### TypeScript 사용 이유

| 이점 | 설명 |
|------|------|
| 정적 타입 검사 | 런타임 에러를 사전에 방지 |
| IDE 자동완성 | 타입 기반 메서드/속성 자동 제안 |
| 리팩토링 안전성 | 타입 오류로 영향 범위 즉시 파악 |
| 코드 가독성 | 함수 시그니처만으로 의도 파악 가능 |
| JS 완전 호환 | 기존 JavaScript 코드 그대로 사용 가능 |

```ts
// JavaScript: 런타임에야 오류 발견
function add(a, b) {
  return a + b;
}
add(1, '2'); // '12' - 의도치 않은 결과

// TypeScript: 컴파일 타임에 오류 감지
function add(a: number, b: number): number {
  return a + b;
}
add(1, '2'); // 오류: Argument of type 'string' is not assignable to parameter of type 'number'
```

### 면접관이 주목하는 포인트
- 단순히 "타입이 있어서"가 아니라 구체적인 이점을 설명하는지
- 본인이 실제 경험한 TypeScript의 장점을 말할 수 있는지

### 꼬리 질문 대비
- "TypeScript의 단점은 무엇인가요?"
  → 컴파일 시간 증가, 초기 설정 복잡도, 타입 작성 비용. 하지만 장기적으로 유지보수 비용이 줄어듦

</details>

---

## Q2. Type과 Interface의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
`type`과 `interface`는 모두 객체의 타입을 정의하는 방법이지만 차이가 있습니다. **Interface**는 `extends`로 확장하고, 동일한 이름으로 재선언하면 자동으로 병합(선언 병합)됩니다. **Type**은 `&`(intersection)으로 확장하고, 동일한 이름으로 중복 선언이 불가합니다. 객체 타입은 Interface, 유니온·튜플·원시 타입 별칭은 Type 사용을 권장합니다.

### Type vs Interface 비교

| 구분 | Interface | Type |
|------|-----------|------|
| 확장 방법 | `extends` 키워드 | `&` intersection |
| 선언 병합 | 가능 (동명 자동 병합) | 불가 (중복 오류) |
| 유니온 타입 | 불가 | 가능 |
| 튜플 타입 | 불가 | 가능 |
| 원시 타입 별칭 | 불가 | 가능 |
| 권장 용도 | 객체, 클래스 계약 | 유니온, 튜플, 복잡한 타입 |

```ts
// 확장 방법
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

type Animal = { name: string };
type Dog = Animal & { breed: string };

// 선언 병합 (Interface만 가능)
interface Window {
  title: string;
}
interface Window {
  theme: string;
}
// 자동으로 { title: string; theme: string; }로 병합됨

// Type은 중복 선언 불가
type Window = { title: string };
type Window = { theme: string }; // 오류: Duplicate identifier 'Window'

// Type만 가능한 유니온
type Status = 'active' | 'inactive' | 'pending';
type Tuple = [string, number];
```

### 면접관이 주목하는 포인트
- 선언 병합의 개념을 이해하는지
- 각각 어떤 상황에 쓰는지 권장 사례를 알고 있는지

### 꼬리 질문 대비
- "라이브러리 개발 시 Interface가 더 유리한 이유는?"
  → 선언 병합 덕분에 사용자가 타입을 확장할 수 있어 유연한 타입 확장성 제공 가능

</details>

---

## Q3. Utility Types에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
TypeScript Utility Types는 기존 타입을 변환하여 새로운 타입을 만드는 내장 제네릭 타입들입니다. 반복적인 타입 정의를 줄이고 타입 재사용성을 높여줍니다. `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly` 등이 자주 사용됩니다.

### 주요 Utility Types

| 타입 | 설명 |
|------|------|
| `Partial<T>` | 모든 프로퍼티를 선택적(optional)으로 |
| `Required<T>` | 모든 프로퍼티를 필수(required)로 |
| `Pick<T, K>` | 특정 프로퍼티만 선택 |
| `Omit<T, K>` | 특정 프로퍼티를 제외 |
| `Record<K, V>` | 키-값 타입의 객체 정의 |
| `Readonly<T>` | 모든 프로퍼티를 읽기 전용으로 |

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

// Partial: 모든 프로퍼티 선택적 (업데이트 API에 유용)
type UpdateUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

// Required: 모든 프로퍼티 필수
type RequiredUser = Required<UpdateUser>;
// { id: number; name: string; email: string; }

// Pick: 필요한 프로퍼티만 선택
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// Omit: 특정 프로퍼티 제외
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; }

// Record: 키-값 타입 정의
type RolePermissions = Record<'admin' | 'user' | 'guest', string[]>;

// Readonly: 읽기 전용
type ImmutableUser = Readonly<User>;
// user.id = 2; // 오류!
```

### 면접관이 주목하는 포인트
- 각 Utility Type의 실무 사용 사례를 설명할 수 있는지
- Pick과 Omit의 사용 기준을 알고 있는지

### 꼬리 질문 대비
- "Pick과 Omit 중 어떤 것을 언제 사용하나요?"
  → 선택할 프로퍼티가 적을 때 Pick, 제외할 프로퍼티가 적을 때 Omit 사용이 더 간결

</details>

---

## Q4. 제네릭(Generics)이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
제네릭은 **타입을 파라미터로 받는 기능**으로, 다양한 타입에서 재사용 가능한 타입-안전(type-safe) 코드를 작성할 수 있게 합니다. `any`를 사용하면 타입 안전성을 잃지만, 제네릭을 사용하면 유연성과 타입 안전성을 동시에 확보할 수 있습니다. 함수, 클래스, 인터페이스에서 모두 사용할 수 있습니다.

### 제네릭 사용 예시

```ts
// 제네릭 없이 - any 사용 시 타입 안전성 상실
function identity(arg: any): any {
  return arg;
}

// 제네릭 함수 - 타입 안전성 유지
function identity<T>(arg: T): T {
  return arg;
}

const str = identity<string>('hello'); // string 타입
const num = identity<number>(42);      // number 타입

// 제네릭 인터페이스
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type PostListResponse = ApiResponse<Post[]>;

// 제네릭 클래스
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);

// 제네릭 제약(Constraints)
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}
```

### 면접관이 주목하는 포인트
- any와 제네릭의 차이를 명확히 설명할 수 있는지
- 제네릭 제약(extends)을 사용해본 경험이 있는지

### 꼬리 질문 대비
- "제네릭과 오버로딩의 차이는?"
  → 오버로딩은 여러 시그니처를 정의, 제네릭은 하나의 시그니처로 다양한 타입 처리. 제네릭이 더 간결함

</details>

---

## Q5. 타입 가드(Type Guard)란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
타입 가드는 런타임에 특정 타입을 확인하여 TypeScript가 해당 블록 내에서 타입을 좁히는(narrowing) 기능입니다. `typeof`, `instanceof`, `in` 연산자, 그리고 사용자 정의 타입 가드 함수를 사용할 수 있습니다. 유니온 타입을 다룰 때 특정 타입에 맞는 로직을 안전하게 실행하는 데 유용합니다.

### 타입 가드 종류

```ts
// 1. typeof - 원시 타입 확인
function printLength(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.length); // string 타입으로 좁혀짐
  } else {
    console.log(value.toFixed(2)); // number 타입으로 좁혀짐
  }
}

// 2. instanceof - 클래스 인스턴스 확인
function handleError(error: Error | string) {
  if (error instanceof Error) {
    console.log(error.message); // Error 타입
  } else {
    console.log(error); // string 타입
  }
}

// 3. in 연산자 - 프로퍼티 존재 확인
interface Cat { meow(): void; }
interface Dog { bark(): void; }

function makeSound(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow(); // Cat 타입
  } else {
    animal.bark(); // Dog 타입
  }
}

// 4. 사용자 정의 타입 가드 (is 키워드)
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // string 타입으로 좁혀짐
  }
}
```

### 면접관이 주목하는 포인트
- 타입 가드가 필요한 이유(타입 좁히기)를 이해하는지
- 사용자 정의 타입 가드의 `is` 키워드를 알고 있는지

### 꼬리 질문 대비
- "타입 단언(as)과 타입 가드의 차이는?"
  → 타입 단언은 개발자가 강제로 타입을 지정(런타임 오류 위험), 타입 가드는 실제 런타임 값을 확인하여 안전하게 타입 좁힘

</details>

---

## Q6. any, unknown, never 타입의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
`any`는 모든 타입을 허용하고 타입 검사를 완전히 우회하여 TypeScript의 안전성을 포기합니다. `unknown`은 모든 타입을 허용하지만 사용 전에 타입 확인이 필요하여 `any`보다 안전합니다. `never`는 절대 발생할 수 없는 타입으로, 무한 루프 함수나 항상 예외를 던지는 함수의 반환 타입입니다.

### any vs unknown vs never 비교

| 구분 | any | unknown | never |
|------|-----|---------|-------|
| 할당 가능 | 모든 타입 | 모든 타입 | 없음 (자신에게만) |
| 사용 가능 | 제한 없음 | 타입 확인 후 | 해당 없음 |
| 타입 검사 | 우회 | 유지 | - |
| 권장 여부 | 지양 | 권장 (any 대신) | 특수 목적 |

```ts
// any: 타입 검사 우회 (위험)
let anyVal: any = 'hello';
anyVal.toFixed(2); // 오류 없음! 런타임에 오류 발생

// unknown: 사용 전 타입 확인 필요 (안전)
let unknownVal: unknown = 'hello';
// unknownVal.toUpperCase(); // 오류: 타입 확인 필요
if (typeof unknownVal === 'string') {
  unknownVal.toUpperCase(); // 타입 가드 후 사용 가능
}

// never: 절대 도달할 수 없는 타입
function throwError(message: string): never {
  throw new Error(message); // 항상 예외 발생
}

function infiniteLoop(): never {
  while (true) {} // 절대 반환하지 않음
}

// never의 실용적 사용: 완전한 switch 처리
type Shape = 'circle' | 'square';
function handleShape(shape: Shape) {
  switch (shape) {
    case 'circle': return '원';
    case 'square': return '사각형';
    default:
      const _exhaustive: never = shape; // 미처리 케이스 컴파일 오류
      return _exhaustive;
  }
}
```

### 면접관이 주목하는 포인트
- any 사용을 지양해야 하는 이유를 알고 있는지
- unknown을 any 대신 사용하는 상황을 설명할 수 있는지

### 꼬리 질문 대비
- "외부 API 응답 처리 시 어떤 타입을 사용하는 것이 좋나요?"
  → unknown을 사용하고 런타임 타입 검증(타입 가드 또는 zod 등 라이브러리)을 거쳐 사용

</details>

---

## 학습 체크리스트

- [ ] TypeScript를 사용하는 이유를 구체적 이점과 함께 설명 가능
- [ ] Type과 Interface의 차이(확장 방법, 선언 병합) 설명 가능
- [ ] Partial, Required, Pick, Omit, Record, Readonly 사용법 이해
- [ ] 제네릭의 개념과 any와의 차이 설명 가능
- [ ] typeof, instanceof, in, 사용자 정의 타입 가드 구현 가능
- [ ] any, unknown, never 차이와 적절한 사용 상황 설명 가능
