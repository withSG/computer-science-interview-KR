# API 설계 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. RESTful API의 설계 원칙은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
REST는 **Representational State Transfer**로, HTTP 기반의 아키텍처 스타일입니다.

### REST 원칙

| 원칙 | 설명 |
|------|------|
| Stateless | 서버가 클라이언트 상태 저장 X |
| Client-Server | 관심사 분리 |
| Uniform Interface | 일관된 인터페이스 |
| Cacheable | 응답 캐싱 가능 |

### HTTP 메서드

| 메서드 | 용도 | 멱등성 |
|--------|------|:------:|
| GET | 조회 | O |
| POST | 생성 | X |
| PUT | 전체 수정 | O |
| PATCH | 부분 수정 | X |
| DELETE | 삭제 | O |

### URL 설계 예시

```
✅ 좋은 예
GET    /users           # 사용자 목록
GET    /users/1         # 특정 사용자
POST   /users           # 사용자 생성
PUT    /users/1         # 사용자 수정
DELETE /users/1         # 사용자 삭제
GET    /users/1/posts   # 사용자의 게시글

❌ 나쁜 예
GET    /getUsers
POST   /createUser
GET    /user/delete/1
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 찾을 수 없음 |
| 500 | 서버 오류 |

### 면접관이 주목하는 포인트
- REST 원칙 이해
- 실제 API 설계 경험

</details>

---

## Q2. REST vs GraphQL 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | REST | GraphQL |
|------|------|---------|
| 엔드포인트 | 여러 개 | 단일 |
| 데이터 페칭 | Over/Under-fetching | 필요한 것만 |
| 버전 관리 | URL 버전 | 스키마 진화 |
| 캐싱 | HTTP 캐싱 | 복잡 |

### Over-fetching / Under-fetching

```
REST:
GET /users/1
→ 불필요한 필드도 반환 (Over-fetching)

GET /users/1
GET /users/1/posts
→ 여러 요청 필요 (Under-fetching)

GraphQL:
query {
  user(id: 1) {
    name
    posts { title }
  }
}
→ 필요한 필드만 한 번에
```

### 선택 기준

```
REST:
- 단순한 CRUD
- HTTP 캐싱 중요
- 팀에 익숙

GraphQL:
- 복잡한 데이터 관계
- 다양한 클라이언트 (모바일/웹)
- 빠른 iteration
```

</details>

---

## Q3. API 버전 관리는 어떻게 하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 버전 관리 방법

| 방법 | 예시 | 장단점 |
|------|------|--------|
| URL Path | /v1/users | 명확, 캐싱 용이 |
| Query Param | /users?version=1 | 유연 |
| Header | Accept: application/vnd.api.v1+json | 깔끔한 URL |

### 권장 사항

```
- 하위 호환성 유지가 최선
- 필드 추가 = 호환됨
- 필드 삭제/변경 = 새 버전
- 명확한 지원 중단 정책
```

</details>

---

## Q4. 페이지네이션 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 방법 | 파라미터 | 특징 |
|------|---------|------|
| Offset | ?page=2&limit=20 | 단순, 중간 페이지 이동 |
| Cursor | ?cursor=abc123&limit=20 | 성능 좋음, 실시간 데이터 |

### Offset 방식

```
GET /posts?page=2&limit=10
→ OFFSET 10 LIMIT 10

문제: 데이터 추가/삭제 시 중복/누락
```

### Cursor 방식

```
GET /posts?cursor=eyJpZCI6MTAwfQ&limit=10
→ WHERE id > 100 LIMIT 10

장점: 일관된 결과, 대용량 성능 좋음
```

</details>

---

## Q5. Rate Limiting은 왜 필요한가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Rate Limiting은 **API 남용을 방지**하고 서비스 안정성을 보장합니다.

### 구현 방법

| 알고리즘 | 설명 |
|---------|------|
| Fixed Window | 시간 창당 요청 수 제한 |
| Sliding Window | 연속적인 시간 창 |
| Token Bucket | 토큰 소비 방식 |

### 응답 헤더

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

### 초과 시 응답

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

</details>

---

## 학습 체크리스트

- [ ] REST 원칙과 HTTP 메서드 알기
- [ ] REST vs GraphQL 비교 가능
- [ ] API 버전 관리 방법 알기
- [ ] 페이지네이션 방법 비교 가능
- [ ] Rate Limiting 필요성 이해
