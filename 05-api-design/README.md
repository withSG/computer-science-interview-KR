# API 설계 (API Design)

> RESTful API와 GraphQL의 설계 원칙, 그리고 API를 운영하며 마주치는 문제들

## 학습 목표

- [ ] REST의 6가지 제약조건과 실무 준수 범위를 설명할 수 있다
- [ ] 리소스 중심 URI를 설계하고 나쁜 URI를 고칠 수 있다
- [ ] HTTP 메서드의 안전성과 멱등성을 구분하고 재시도 전략에 활용할 수 있다
- [ ] 상태 코드를 상황에 맞게 고르고 에러 응답 포맷을 통일할 수 있다
- [ ] GraphQL이 해결하는 문제와 그 대가를 REST와 비교해 설명할 수 있다
- [ ] N+1 문제와 DataLoader의 동작을 설명할 수 있다
- [ ] API 버전 관리 전략과 하위 호환을 깨는 변경을 판별할 수 있다
- [ ] Offset과 Cursor 페이지네이션을 성능·정합성 관점에서 비교할 수 있다
- [ ] Rate Limiting 알고리즘을 비교하고 분산 환경에서 구현할 수 있다

---

## 개념 설명 파일

| 파일 | 주제 | 난이도 |
|------|------|--------|
| [01-rest-api-design.md](./01-rest-api-design.md) | REST API 설계 (제약조건, URI, 메서드, 상태 코드) | ⭐ |
| [02-graphql-basics.md](./02-graphql-basics.md) | GraphQL 기초 (스키마, 리졸버, N+1과 DataLoader) | ⭐⭐ |
| [03-versioning-pagination.md](./03-versioning-pagination.md) | API 버저닝과 페이지네이션 | ⭐⭐ |
| [04-rate-limiting.md](./04-rate-limiting.md) | Rate Limiting (알고리즘과 분산 구현) | ⭐⭐⭐ |

---

## QnA 파일

- [qna-api-design.md](./qna-api-design.md) - API 설계 면접 질문 모음

---

## 핵심 키워드

`REST` `RESTful` `HTTP Methods` `멱등성` `안전성` `Status Codes`
`Idempotency-Key` `HATEOAS` `리처드슨 성숙도 모델` `Problem Details`
`GraphQL` `Query` `Mutation` `Subscription` `Schema` `Resolver` `DataLoader`
`API Versioning` `Breaking Change` `Sunset 헤더` `Pagination` `Cursor` `Deep Pagination`
`Rate Limiting` `Token Bucket` `Sliding Window` `429` `Retry-After` `지수 백오프`
