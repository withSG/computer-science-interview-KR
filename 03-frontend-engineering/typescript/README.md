# TypeScript

> TypeScript 핵심 개념과 면접 질문

## 학습 목표

- [ ] TypeScript를 사용하는 이유를 설명할 수 있다
- [ ] 구조적 타이핑이 명목적 타이핑과 어떻게 다른지 안다
- [ ] Type과 Interface의 차이를 알고 상황에 맞게 고를 수 있다
- [ ] any / unknown / never의 역할을 구분할 수 있다
- [ ] 제네릭을 이해하고 사용할 수 있다
- [ ] Utility Types를 직접 구현할 수 있다
- [ ] 타입 가드로 유니온 타입을 안전하게 좁힐 수 있다
- [ ] 판별 유니온으로 상태를 모델링할 수 있다

---

## 개념 설명 파일

| 파일 | 주제 | 난이도 |
|------|------|--------|
| [01-why-typescript-types.md](./01-why-typescript-types.md) | 왜 타입인가 — 구조적 타이핑, type vs interface, any/unknown/never | ⭐ |
| [02-generics-utility-types.md](./02-generics-utility-types.md) | 제네릭과 유틸리티 타입 — 제약, 조건부 타입, 매핑된 타입 | ⭐⭐⭐ |
| [03-type-guards-narrowing.md](./03-type-guards-narrowing.md) | 타입 가드와 좁히기 — 판별 유니온, 타입 단언, strict 옵션 | ⭐⭐ |

---

## QnA 파일

| 파일 | 내용 | 질문 수 |
|------|------|---------|
| [qna-typescript.md](./qna-typescript.md) | TypeScript 면접 질문 | 6 |

---

## 핵심 키워드

`정적 타입` `컴파일 타임` `타입 소거` `구조적 타이핑` `브랜디드 타입`
`리터럴 타입` `타입 넓히기` `as const` `satisfies`
`Type` `Interface` `선언 병합` `any` `unknown` `never`
`Generics` `제네릭 제약` `keyof` `조건부 타입` `infer` `매핑된 타입` `Utility Types`
`타입 가드` `narrowing` `판별 유니온` `완전성 검사` `타입 단언` `strict`
