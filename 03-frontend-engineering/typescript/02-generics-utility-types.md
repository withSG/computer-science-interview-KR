# 제네릭과 유틸리티 타입 (Generics & Utility Types)

> 타입을 파라미터로 받는다는 말이 정확히 무슨 뜻인지, `Partial`이나 `ReturnType` 같은 내장 타입이 사실은 몇 줄짜리 코드라는 것을 직접 구현해보며 설명할 수 있게 된다.

## 학습 목표

- [ ] 제네릭이 없을 때 생기는 중복과 `any` 남용을 코드로 지적할 수 있다
- [ ] 제네릭 함수·인터페이스·클래스를 직접 작성할 수 있다
- [ ] `extends` 제약과 `keyof`, `typeof`, 인덱스 접근 타입을 조합할 수 있다
- [ ] 조건부 타입과 `infer`가 어떻게 타입을 뽑아내는지 설명할 수 있다
- [ ] 매핑된 타입으로 `Partial`, `Pick`, `Omit`을 직접 만들 수 있다
- [ ] 불필요한 제네릭과 필요한 제네릭을 구분할 수 있다

## 선행 지식

- [01-why-typescript-types.md](./01-why-typescript-types.md) — 유니온, 리터럴 타입, `any`/`unknown`/`never`를 알고 있어야 한다

---

## 1. 왜 필요한가

### 선택지가 둘뿐이던 시절

배열의 첫 요소를 꺼내는 함수를 만든다고 하자. 제네릭을 모르면 갈림길은 두 개뿐이다.

```ts
// 갈림길 A — 타입마다 복제한다
function firstString(arr: string[]): string | undefined { return arr[0]; }
function firstNumber(arr: number[]): number | undefined { return arr[0]; }
function firstUser(arr: User[]): User | undefined { return arr[0]; }
// ... 타입이 늘어날 때마다 함수가 하나씩 늘어난다
```

```ts
// 갈림길 B — any로 뭉갠다
function first(arr: any[]): any { return arr[0]; }

const u = first(users);
u.nmae;            // 오타인데 컴파일 통과
u.toFixed(2);      // User인데 통과
```

A는 로직이 똑같은 함수를 계속 복제해야 하고, B는 타입 검사를 포기한다. 문제의 본질은 **입력 타입과 출력 타입 사이의 관계가 끊어졌다**는 데 있다.

```
[any 방식]                          [제네릭 방식]

 User[] ──┐                          User[] ──┐
          │                                   │ T = User 로 기억
          ▼                                   ▼
     ┌─────────┐                       ┌─────────────┐
     │ first() │  관계 소실             │ first<T>()  │  관계 보존
     └─────────┘                       └─────────────┘
          │                                   │
          ▼                                   ▼
        any  ← 무엇이든 될 수 있음      User | undefined
```

### 제네릭은 "타입을 나중에 정하겠다"는 선언

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const u = first(users);   // T = User 로 추론 → 반환 타입 User | undefined
const n = first([1, 2]);  // T = number
u?.nmae;                  // 오류: 'nmae' 속성이 없습니다
```

`<T>`는 **함수가 값을 매개변수로 받듯, 타입을 매개변수로 받는다**는 표시다. 호출할 때마다 `T`가 결정되고, 그 결정이 반환 타입까지 따라온다.

### 비유: 택배 상자

제네릭은 내용물 종류를 적지 않은 빈 택배 상자와 같다. 상자 자체는 무엇이든 담을 수 있지만, 신발을 넣는 순간 상자 겉면에 "신발"이라는 라벨이 자동으로 붙는다. 받는 사람은 열어보지 않고도 안에 신발이 있다는 걸 안다.

> **비유의 한계**: 진짜 상자는 내용물을 물리적으로 담지만, 제네릭 타입 파라미터는 **컴파일 시점에만 존재하고 실행 시점에는 사라진다.** 그래서 함수 안에서 "`T`가 지금 무슨 타입이지?"를 런타임에 물어볼 수는 없다. 이걸 하려면 별도의 인자를 받아야 한다.

---

## 2. 제네릭의 세 가지 자리

### 함수

```ts
function toMap<T>(items: T[], keyOf: (item: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) map.set(keyOf(item), item);
  return map;
}

const byEmail = toMap(users, (u) => u.email);   // T = User 로 추론. u도 User로 문맥 추론된다
const empty = toMap<User>([], (u) => u.email);  // 추론할 근거가 없을 때만 명시한다
```

`T`가 매개변수, 콜백 인자, 반환 타입 세 곳을 한 줄로 꿰고 있다. 호출부에서 `User[]`를 넘기는 순간 콜백의 `u`까지 `User`로 정해지는 것이 제네릭이 하는 일이다.

타입 파라미터는 여러 개 쓸 수 있고, 관계를 표현할 때 진짜 위력이 나온다.

```ts
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((v, i) => [v, b[i]]);
}

const pairs = zip(["a", "b"], [1, 2]);   // [string, number][]
```

### 인터페이스

API 응답 래퍼가 대표적인 예다.

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
  requestedAt: string;
}

type UserResponse = ApiResponse<User>;
type UserListResponse = ApiResponse<User[]>;

async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json() as Promise<ApiResponse<T>>;
}

const r = await fetchJson<User>("/api/me");
r.data.name;   // User로 보장된다
```

> 주의: 위 `as`는 "서버가 이 모양으로 준다"는 **약속**일 뿐 검사가 아니다. 실제 응답이 다르면 런타임에 터진다. 경계에서의 검증은 [03-type-guards-narrowing.md](./03-type-guards-narrowing.md)에서 다룬다.

### 클래스

클래스에 붙은 타입 파라미터는 **인스턴스 하나가 사는 동안 계속 유지되는 약속**이다. 필드, 메서드 인자, 메서드 반환 타입이 전부 그 약속을 공유한다.

```ts
class Cache<T> {
  private store = new Map<string, T>();

  set(key: string, value: T): void {
    this.store.set(key, value);
  }
  get(key: string): T | undefined {
    return this.store.get(key);
  }
  getOrCreate(key: string, create: () => T): T {
    const hit = this.store.get(key);
    if (hit !== undefined) return hit;
    const created = create();
    this.store.set(key, created);
    return created;
  }
}

const userCache = new Cache<User>();
userCache.set("u_1", currentUser);
userCache.set("u_2", "kim");        // 오류: string은 User에 할당할 수 없다
const cached = userCache.get("u_1");  // User | undefined
```

`new Cache<User>()`로 한 번 정한 `T`가 `set`의 인자 타입, `get`의 반환 타입, `getOrCreate`의 팩토리 반환 타입까지 동시에 고정한다. 함수 제네릭이 호출 한 번짜리 약속이라면, 클래스 제네릭은 객체 수명 전체에 걸친 약속이다.

### 안티패턴 — 필요 없는 제네릭

제네릭을 배우고 나면 아무 데나 붙이고 싶어진다. 판별 기준이 있다.

```ts
// 안티패턴
function logId<T>(id: T): void {
  console.log(id);
}
```

**왜 문제인가**: `T`가 시그니처에 **딱 한 번만** 등장한다. 타입 파라미터의 존재 이유는 두 지점 사이의 관계를 잇는 것인데, 한 번만 나오면 이을 것이 없다. 읽는 사람에게 없는 규칙을 암시하는 소음일 뿐이다.

```ts
// 개선 — 그냥 넓은 타입을 받으면 된다
function logId(id: unknown): void {
  console.log(id);
}
```

```ts
// 또 다른 안티패턴 — 제약을 쓰면 될 것을 제네릭으로 만든 경우
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}

// 개선 — 반환 타입이 T와 무관하므로 파라미터 타입을 직접 쓰면 충분하다
function getLength(x: { length: number }): number {
  return x.length;
}
```

위 `getLength`는 제네릭 제약 문법을 설명할 때 교과서적으로 등장하는 형태다. 문법 예제로는 훌륭하지만, 실제 코드로 옮길 때는 `T`가 반환 타입에 관여하지 않는다는 점을 보고 한 번 더 생각해야 한다. 다음 절의 `printName<T extends { name: string }>(x: T): T`처럼 **반환 타입에도 `T`가 등장할 때** 비로소 제약이 값어치를 한다.

> 기준: **타입 파라미터가 시그니처에서 두 번 이상 쓰여 관계를 만들 때만 제네릭을 쓴다.** 한 번만 쓰인다면 그 자리에 제약 타입을 바로 넣는다.

---

## 3. 제약(`extends`)과 타입 연산자

### `extends` — "최소한 이 모양이어야 한다"

순수한 `<T>`는 어떤 타입이든 받기 때문에, 함수 안에서 `T`에 대해 아무것도 할 수 없다.

```ts
function printName<T>(x: T) {
  console.log(x.name);   // 오류: 'T' 형식에 'name' 속성이 없습니다
}
```

`extends`로 상한(upper bound)을 걸면 그 범위 안의 속성은 안전하게 쓸 수 있다.

```ts
function printName<T extends { name: string }>(x: T): T {
  console.log(x.name);   // OK
  return x;              // 반환 타입은 여전히 구체적인 T
}

const u = printName({ name: "kim", age: 30 });
u.age;   // 30 — { name: string }으로 좁아지지 않고 원래 타입이 유지된다
```

여기서 제네릭을 쓸 값어치가 생겼다. 파라미터를 `{ name: string }`으로 직접 받으면 반환값에서 `age`가 사라지지만, `T`로 받으면 **들어온 타입 그대로 돌려줄 수 있다.**

### `keyof` — 객체 타입에서 키 유니온 뽑기

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKey = keyof User;   // "id" | "name" | "email"
```

`keyof`와 **인덱스 접근 타입** `T[K]`를 합치면 타입 안전한 속성 접근기를 만들 수 있다.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, name: "kim", email: "a@b.c" };

const id = getProperty(user, "id");       // number
const name = getProperty(user, "name");   // string
getProperty(user, "phone");               // 오류: 'phone'은 키가 아니다
```

`K extends keyof T` 하나로 "존재하는 키만 허용" + "그 키에 맞는 타입 반환"이 동시에 해결된다. 제네릭이 진짜로 필요한 전형적인 사례다.

### `typeof` — 값에서 타입 뽑기

JavaScript의 `typeof`와 이름은 같지만 **타입 자리에서 쓰이면 완전히 다른 연산자**다. 값의 타입을 그대로 가져온다.

```ts
const defaultConfig = {
  retries: 3,
  endpoint: "/api",
  verbose: false,
};

type Config = typeof defaultConfig;
// { retries: number; endpoint: string; verbose: boolean }

function applyConfig(c: Config) { /* ... */ }
```

설정 객체를 하나 만들어두면 타입은 자동으로 따라온다. 값과 타입이 어긋날 일이 구조적으로 없어진다.

```
값의 세계                      타입의 세계
─────────────                 ─────────────
const defaultConfig  ──typeof──▶  Config
                                     │
                                   keyof
                                     ▼
                        "retries" | "endpoint" | "verbose"
                                     │
                                   T[K]
                                     ▼
                              number | string | boolean
```

값의 세계에서 타입의 세계로 건너오는 통로가 `typeof`라는 점만 기억하면 헷갈리지 않는다. (클래스 이름처럼 값과 타입을 동시에 만드는 선언도 있지만, 일반 값에서 타입을 꺼내는 수단은 `typeof`다.)

---

## 4. 조건부 타입과 `infer`

### 타입에도 if가 있다

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;   // true
type B = IsString<42>;        // false
```

`T extends U ? X : Y`는 "`T`가 `U`에 할당 가능하면 `X`, 아니면 `Y`"라는 뜻이다. 타입 레벨의 삼항 연산자다.

### 유니온에 적용하면 분배된다

여기서 한 번은 놀라게 되는 동작이 있다.

```ts
type NoString<T> = T extends string ? never : T;

type R = NoString<string | number | boolean>;
// 기대: never?
// 실제: number | boolean
```

타입 파라미터가 조건부 타입의 왼쪽에 **벌거벗은 채로**(다른 타입으로 감싸이지 않고) 놓이면, 유니온의 각 멤버에 조건이 **따로따로** 적용된 뒤 결과가 다시 유니온으로 합쳐진다. 이걸 **분배 조건부 타입(distributive conditional type)**이라고 한다.

```
NoString<string | number | boolean>
  ↓ 분배
(string extends string ? never : string)   → never
| (number extends string ? never : number) → number
| (boolean extends string ? never : boolean) → boolean
  ↓ 합침 (never는 유니온에서 사라진다)
number | boolean
```

분배를 원하지 않으면 대괄호로 감싸 벌거벗은 상태를 푼다.

```ts
type NoStringStrict<T> = [T] extends [string] ? never : T;
type R2 = NoStringStrict<string | number>;   // string | number (분배 안 됨)
```

이 동작이 `Exclude`와 `Extract`가 작동하는 원리 그 자체다.

### `infer` — 타입 안에서 꺼내오기

`infer`는 조건부 타입의 `extends` 절 안에서 **"이 자리에 있는 타입을 변수에 담아라"**라고 지시한다.

```ts
type ElementOf<T> = T extends (infer E)[] ? E : never;

type A = ElementOf<string[]>;     // string
type B = ElementOf<User[][]>;     // User[]
type C = ElementOf<number>;       // never (배열이 아니므로)
```

함수의 반환 타입을 꺼내는 것도 같은 원리다.

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function createUser(name: string) {
  return { id: 1, name, createdAt: new Date() };
}

type CreatedUser = MyReturnType<typeof createUser>;
// { id: number; name: string; createdAt: Date }
```

`typeof createUser`로 값에서 타입을 꺼내고, `infer R`로 그 함수 타입에서 반환 부분만 뽑았다. **함수 구현이 바뀌면 타입이 저절로 따라온다** — 손으로 관리하는 타입과 구현이 어긋날 여지가 사라진다.

---

## 5. 매핑된 타입

### 기존 타입의 모든 속성을 돌면서 변형하기

```ts
type Optional<T> = {
  [K in keyof T]?: T[K];
};
```

`[K in keyof T]`는 "`T`의 모든 키를 순회하며"라는 뜻이다. `for...in`의 타입 버전이라고 보면 된다.

```
       User                        Optional<User>
 ┌──────────────────┐        ┌──────────────────────┐
 │ id:    number    │  ───▶  │ id?:    number       │
 │ name:  string    │   각    │ name?:  string       │
 │ email: string    │  속성   │ email?: string       │
 └──────────────────┘   에 ? └──────────────────────┘
                        추가
```

### 수정자 추가와 제거

`readonly`와 `?`는 `+`로 붙이고 `-`로 뗀다.

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };   // readonly 제거
type Concrete<T> = { [K in keyof T]-?: T[K] };          // ? 제거
type Frozen<T> = { +readonly [K in keyof T]: T[K] };    // + 는 생략 가능
```

### 키 이름 바꾸기 (`as`)

TypeScript 4.1부터 매핑 중에 키 이름을 재작성할 수 있다.

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Point { x: number; y: number }

type PointGetters = Getters<Point>;
// { getX: () => number; getY: () => number }
```

`` `get${...}` ``는 템플릿 리터럴 타입이고, `Capitalize`는 내장 문자열 유틸리티다. 키를 `never`로 만들면 그 속성이 결과에서 제거되는데, 이 성질이 `Omit`류 타입의 뼈대가 된다.

---

## 6. 내장 유틸리티 타입을 직접 만들어보기

이 절이 이 문서의 핵심이다. `Partial`이나 `Omit`이 마법이 아니라 **여기까지 배운 문법 두세 개의 조합**이라는 걸 확인하면, 필요할 때 직접 만들어 쓸 수 있게 된다.

### 매핑된 타입 계열

```ts
// 모든 속성을 선택적으로
type MyPartial<T> = { [K in keyof T]?: T[K] };

// 모든 속성을 필수로 (? 제거)
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// 모든 속성을 읽기 전용으로
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// 지정한 키만 남기기
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

// 키-값 매핑 객체 만들기
type MyRecord<K extends keyof any, V> = { [P in K]: V };
```

`keyof any`는 `string | number | symbol`이다. "객체 키가 될 수 있는 모든 타입"이라는 뜻으로 읽으면 된다.

### 조건부 타입 계열

```ts
// 유니온에서 U에 해당하는 것을 빼기 (분배 조건부 타입)
type MyExclude<T, U> = T extends U ? never : T;

// 유니온에서 U에 해당하는 것만 남기기
type MyExtract<T, U> = T extends U ? T : never;

// null과 undefined 제거
type MyNonNullable<T> = T extends null | undefined ? never : T;

type A = MyExclude<"a" | "b" | "c", "a">;      // "b" | "c"
type B = MyExtract<string | number, number>;   // number
type C = MyNonNullable<string | null>;         // string
```

> `NonNullable`은 원래 위와 같은 조건부 타입이었지만, TypeScript 4.8에서 표준 라이브러리 정의가 `T & {}`로 바뀌었다. `{}`가 "`null`도 `undefined`도 아닌 값"을 뜻한다는 성질을 이용한 것이고, 결과는 같으면서 제네릭 `T`에 대해서도 좁히기가 더 잘 작동한다. 결과만 필요하면 조건부 버전으로 이해해도 무방하다.

### 두 계열의 조합 — `Omit`

`Omit`은 새 문법 없이 `Pick`과 `Exclude`만으로 만들어진다.

```ts
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;
```

읽는 순서는 안쪽부터다. `keyof T`로 전체 키를 꺼내고 → `Exclude`로 `K`를 빼고 → 남은 키만 `Pick`한다.

여기 실무에서 사람을 잡는 함정이 하나 숨어 있다. **`Omit`의 두 번째 파라미터 제약은 `keyof T`가 아니라 `keyof any`다.**

```ts
interface User { id: number; name: string; email: string }

type A = Pick<User, "emial">;   // 오류: 'emial'은 User의 키가 아니다
type B = Omit<User, "emial">;   // 오류가 안 난다! 결과는 User 그대로
```

`Omit`은 존재하지 않는 키를 지워도 그냥 아무것도 안 지운 결과를 낸다. "비밀번호를 뺐다고 생각했는데 오타 때문에 그대로 남아 있는" 사고가 여기서 나온다. 민감 필드 제거처럼 중요한 곳에서는 제약을 좁힌 자체 버전을 두는 것도 방법이다.

```ts
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type Safe = StrictOmit<User, "emial">;   // 오류로 잡힌다
```

### `infer` 계열

4절에서 만든 `MyReturnType`에 `T extends (...args: any) => any` 제약을 붙인 형태가 표준 라이브러리의 정의다. 제약이 있으면 함수가 아닌 타입을 넘겼을 때 결과가 조용히 `never`가 되는 대신 호출 지점에서 오류가 난다.

```ts
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

declare function updateUser(id: number, patch: Partial<User>): Promise<User>;

type R = MyReturnType<typeof updateUser>;   // Promise<User>
type P = MyParameters<typeof updateUser>;   // [id: number, patch: Partial<User>]
```

### 정리 표

| 유틸리티 | 한 줄 정의 | 만들어진 원리 | 실무 용례 |
|----------|-----------|--------------|-----------|
| `Partial<T>` | 모든 속성 선택적 | 매핑 + `?` | PATCH 요청 본문 타입 |
| `Required<T>` | 모든 속성 필수 | 매핑 + `-?` | 기본값 병합 후의 옵션 객체 |
| `Readonly<T>` | 모든 속성 읽기 전용 | 매핑 + `readonly` | 스토어 상태 불변 보장 |
| `Pick<T, K>` | 지정 키만 남김 | 매핑(`P in K`) | 목록 미리보기 DTO |
| `Omit<T, K>` | 지정 키 제거 | `Pick` + `Exclude` | 비밀번호 제외 응답 타입 |
| `Record<K, V>` | 키-값 매핑 객체 | 매핑(`P in K`) | 역할별 권한 테이블 |
| `Exclude<T, U>` | 유니온에서 빼기 | 분배 조건부 | 특정 상태 제외한 유니온 |
| `Extract<T, U>` | 유니온에서 고르기 | 분배 조건부 | 판별 유니온에서 한 갈래만 |
| `NonNullable<T>` | `null`/`undefined` 제거 | `T & {}` (4.8 이전엔 조건부) | 필터링 후 타입 정리 |
| `ReturnType<T>` | 함수 반환 타입 | `infer` | 팩토리 함수 결과 타입 재사용 |
| `Parameters<T>` | 함수 매개변수 튜플 | `infer` | 래퍼 함수 시그니처 재사용 |

> 표 요약: **매핑된 타입은 "속성을 변형", 조건부 타입은 "유니온을 걸러냄", `infer`는 "안에서 꺼냄"** 세 가지 도구뿐이다. 나머지는 전부 이 셋의 조합이다.

### 안티패턴 — 타입을 손으로 복제하기

```ts
// 안티패턴
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface UserResponse {   // User에서 password만 뺀 것
  id: number;
  name: string;
  email: string;
}

interface UserUpdateRequest {   // User의 일부만 받는 것
  name?: string;
  email?: string;
}
```

**왜 문제인가**: `User`에 `phone` 필드가 추가되면 세 곳을 전부 고쳐야 하는데, 컴파일러는 하나도 알려주지 않는다. 세 타입이 조용히 어긋나기 시작하고, 응답에 새 민감 필드가 딸려 나가는 사고로 이어진다.

```ts
// 개선 — 원본 하나에서 파생시킨다
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type UserResponse = Omit<User, "password">;
type UserUpdateRequest = Partial<Pick<User, "name" | "email">>;
```

이제 `User`가 바뀌면 파생 타입이 자동으로 따라온다. **타입에도 단일 진실 공급원(single source of truth)이 있어야 한다**는 원칙이다.

---

## 7. 실무에서는

- **API 클라이언트가 제네릭의 1순위 용처다.** `fetchJson<User>("/api/me")`처럼 호출부에서 응답 타입을 정하는 패턴은 거의 모든 프론트엔드 코드베이스에 있다. 최근에는 여기에 zod 같은 스키마 검증기를 붙여, 스키마 하나로 런타임 검증과 타입 추론을 동시에 얻는 방식이 널리 쓰인다.
- **React 컴포넌트 props 타입도 유틸리티 타입 조합이다.** 기본 HTML 속성을 그대로 받으면서 몇 개만 덧붙일 때 `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & { variant: "primary" | "ghost" }` 같은 형태를 쓴다.
- **`ReturnType<typeof ...>` 패턴을 기억하자.** Redux Toolkit의 `RootState` 타입을 `ReturnType<typeof store.getState>`로 잡는 것이 대표적이다. 스토어 구조가 바뀌면 상태 타입이 저절로 따라간다.
- **타입 체조는 도구지 목적이 아니다.** 조건부 타입을 세 겹 중첩하면 나 말고는 아무도 못 읽는다. 팀 코드에서는 "읽고 5초 안에 이해되는가"를 기준으로 삼고, 복잡해지면 차라리 타입 두 개로 나누거나 중간 타입에 이름을 붙인다.
- **`type-fest` 같은 커뮤니티 유틸리티 타입 모음**이 있다. 깊은 `Partial`, 읽기 쉬운 병합 타입 등 내장 유틸리티에 없는 것들이 정리되어 있어, 직접 구현하기 전에 한 번 찾아보는 편이 낫다.

---

## 8. 면접 포인트

> 면접에서 이 주제가 나오면 이렇게 답한다

**Q. 제네릭이 `any`와 무엇이 다른가요?**
A. `any`는 타입 검사를 끄는 것이고, 제네릭은 타입 정보를 보존하는 것입니다. `function first(arr: any[]): any`는 어떤 배열이든 받지만 반환값의 타입 정보가 사라져서 이후 코드가 전부 검사 대상에서 빠집니다. `function first<T>(arr: T[]): T | undefined`는 호출 시점의 타입이 반환 타입까지 이어져서 유연성과 안전성을 동시에 가집니다. 핵심은 **입력과 출력 사이의 관계를 유지하느냐**입니다.
- 꼬리 질문: "그럼 제네릭은 언제 쓰지 말아야 하나요?" → 타입 파라미터가 시그니처에 한 번만 등장하면 관계를 만들 게 없으므로, 그냥 제약 타입을 직접 파라미터 타입으로 쓰는 게 낫다고 답한다.

**Q. 제네릭 제약(`extends`)은 왜 필요한가요?**
A. 순수한 `<T>`는 어떤 타입이든 받기 때문에 함수 안에서 `T`에 어떤 속성이 있는지 보장할 수 없어 접근 자체가 오류가 납니다. `T extends { length: number }`처럼 상한을 지정하면 그 범위 안의 속성은 안전하게 쓸 수 있으면서, 반환할 때는 여전히 들어온 구체적인 타입을 유지합니다. Java의 bounded type parameter와 같은 개념입니다.
- 꼬리 질문: "`K extends keyof T`는 왜 쓰나요?" → 객체 속성 접근기를 만들 때 존재하는 키만 허용하고, 그 키에 맞는 값 타입 `T[K]`를 반환하기 위해서라고 답한다.

**Q. `Partial<T>`는 어떻게 구현되어 있나요?**
A. `type Partial<T> = { [K in keyof T]?: T[K] }` 한 줄입니다. `keyof T`로 키 유니온을 만들고, 매핑된 타입으로 순회하면서 각 속성에 `?`를 붙입니다. 반대로 `Required`는 `-?`로 선택 표시를 제거합니다. 내장 유틸리티 타입은 대부분 매핑된 타입, 조건부 타입, `infer` 세 가지의 조합이라 필요하면 직접 만들 수 있습니다.
- 꼬리 질문: "`Omit`은요?" → `Pick<T, Exclude<keyof T, K>>`다. 그리고 `Omit`의 두 번째 파라미터 제약이 `keyof T`가 아니라 `keyof any`라서 존재하지 않는 키를 넘겨도 오류가 안 난다는 함정을 덧붙이면 좋다.

**Q. 조건부 타입이 유니온에 적용될 때 어떻게 동작하나요?**
A. 타입 파라미터가 조건부 타입의 왼쪽에 다른 타입으로 감싸이지 않고 놓이면 유니온의 각 멤버에 조건이 개별 적용되고 결과가 다시 유니온으로 합쳐집니다. 이를 분배 조건부 타입이라 하고, `Exclude`와 `Extract`가 정확히 이 성질로 동작합니다. 분배를 막으려면 `[T] extends [U]`처럼 튜플로 감싸면 됩니다.
- 꼬리 질문: "`infer`는 뭔가요?" → 조건부 타입의 `extends` 절 안에서 특정 위치의 타입을 변수에 담는 문법이고, `ReturnType`이 `T extends (...args: any) => infer R ? R : any`로 반환 타입을 꺼낸다고 설명한다.

---

## 자주 하는 실수

| 실수 | 왜 틀렸나 | 올바른 이해 |
|------|----------|-----------|
| "제네릭은 `any`의 안전한 버전이다" | `any`는 검사를 끄고, 제네릭은 타입 관계를 잇는다. 목적 자체가 다르다 | 제네릭의 가치는 입력 타입이 출력 타입까지 이어진다는 것 |
| "제네릭은 많이 쓸수록 유연하다" | 시그니처에 한 번만 등장하는 타입 파라미터는 아무 관계도 만들지 않는다 | 두 번 이상 쓰여 관계를 만들 때만 제네릭을 쓴다 |
| "`Omit`은 잘못된 키를 넘기면 오류가 난다" | 제약이 `keyof any`라 존재하지 않는 키도 통과한다 | 오타가 조용히 넘어간다. 중요한 곳은 `K extends keyof T`로 감싼 자체 타입을 쓴다 |
| "타입에서 쓰는 `typeof`는 JS의 `typeof`와 같다" | 값 자리의 `typeof`는 `"string"` 같은 문자열을 반환하고, 타입 자리의 `typeof`는 값의 타입을 가져온다 | 완전히 다른 두 연산자가 키워드만 공유한다 |
| "제네릭 타입 파라미터는 런타임에도 남는다" | 컴파일 시 지워지므로 함수 안에서 `T`가 무엇인지 알 수 없다 | 런타임 분기가 필요하면 별도 인자나 판별 필드를 받는다 |
| "필요한 타입은 그때그때 인터페이스로 새로 만든다" | 원본이 바뀌어도 사본은 따라오지 않아 조용히 어긋난다 | 원본 하나를 두고 `Pick`/`Omit`/`Partial`로 파생시킨다 |

---

## 한 줄 정리

제네릭은 입력 타입과 출력 타입 사이의 관계를 끊지 않고 코드를 재사용하는 장치이며, 내장 유틸리티 타입은 **매핑된 타입·조건부 타입·`infer`** 세 도구의 조합일 뿐이라 필요하면 직접 만들어 쓸 수 있다.

---

## 연관 개념

- [01-why-typescript-types.md](./01-why-typescript-types.md) - 제네릭이 다루는 재료인 기본 타입, 유니온, `keyof`의 출발점
- [03-type-guards-narrowing.md](./03-type-guards-narrowing.md) - 제네릭으로 만든 넓은 타입을 실제 값 검사로 좁히는 방법
- [qna-typescript.md](./qna-typescript.md) - 이 주제 면접 질문(Q3, Q4)
- [../react-architecture/04-hooks-internals.md](../react-architecture/04-hooks-internals.md) - `useState<T>` 같은 제네릭 훅이 타입을 어떻게 이어받는지
