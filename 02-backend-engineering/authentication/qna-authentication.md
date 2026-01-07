# 인증 & 인가 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 세션 기반 인증과 토큰(JWT) 기반 인증의 차이점은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 세션 | JWT |
|------|------|-----|
| 저장 위치 | 서버 (메모리/Redis) | 클라이언트 |
| 상태 | Stateful | Stateless |
| 확장성 | 세션 동기화 필요 | 확장 용이 |
| 보안 | 서버에서 강제 로그아웃 가능 | 탈취 시 만료까지 제어 어려움 |
| 데이터 크기 | 작음 (Session ID만) | 큼 (Payload 포함) |

### 세션 기반 인증 흐름
```
1. 로그인 → 서버에서 세션 생성, 세션 ID 발급
2. 클라이언트에 세션 ID 쿠키로 전달
3. 이후 요청 시 쿠키의 세션 ID로 사용자 식별
```

### JWT 기반 인증 흐름
```
1. 로그인 → 서버에서 JWT 생성 및 발급
2. 클라이언트에서 토큰 저장 (localStorage/Cookie)
3. 이후 요청 시 Authorization 헤더에 토큰 포함
4. 서버에서 토큰 검증 (서명 확인)
```

### 면접관이 주목하는 포인트
- 스케일아웃 환경에서의 차이
- 각 방식의 보안 취약점

### 꼬리 질문 대비
- "세션 방식에서 서버 확장 시 문제점과 해결책?"
  → Sticky Session, Session Clustering, Redis 세션 스토어
- "JWT 탈취 시 대응 방안?"
  → Refresh Token Rotation, 토큰 블랙리스트

</details>

---

## Q2. JWT의 구조를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
JWT는 **Header.Payload.Signature** 3부분으로 구성됩니다.

### JWT 구조
```
xxxxx.yyyyy.zzzzz
 │      │      │
 │      │      └── Signature (서명)
 │      └── Payload (데이터)
 └── Header (알고리즘)
```

### 각 부분 설명

**Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Claims)
```json
{
  "sub": "1234567890",
  "name": "John",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Signature**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### 주의사항
- Payload는 **암호화되지 않음** (Base64 인코딩)
- 민감 정보 저장 금지
- Signature로 **위변조 검증**만 가능

### 면접관이 주목하는 포인트
- 서명의 역할 이해
- JWT에 저장하면 안 되는 정보

</details>

---

## Q3. Access Token과 Refresh Token의 역할은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Access Token | Refresh Token |
|------|--------------|---------------|
| 용도 | API 인증 | Access Token 재발급 |
| 유효기간 | 짧음 (15분~1시간) | 김 (7일~30일) |
| 저장 | 메모리/로컬스토리지 | HttpOnly 쿠키 |
| 탈취 영향 | 제한적 | 치명적 |

### 흐름
```
1. 로그인 → Access Token + Refresh Token 발급
2. API 요청 시 Access Token 사용
3. Access Token 만료 → Refresh Token으로 재발급
4. Refresh Token 만료 → 재로그인
```

### Refresh Token Rotation
- 매번 재발급 시 Refresh Token도 갱신
- 탈취된 토큰의 재사용 감지 가능

### 면접관이 주목하는 포인트
- 토큰 유효기간 설정 기준
- 보안 강화 전략

</details>

---

## Q4. OAuth 2.0의 Authorization Code 흐름을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

```
┌──────────┐                               ┌──────────────┐
│   User   │                               │ Authorization│
│ (Browser)│                               │    Server    │
└────┬─────┘                               │   (Google)   │
     │                                     └──────┬───────┘
     │  1. 소셜 로그인 클릭                        │
     ├─────────────────────────────────────────►│
     │                                          │
     │  2. 로그인 페이지 리다이렉트                 │
     │◄─────────────────────────────────────────┤
     │                                          │
     │  3. 로그인 + 권한 동의                     │
     ├─────────────────────────────────────────►│
     │                                          │
     │  4. Authorization Code 발급               │
     │◄─────────────────────────────────────────┤
     │                                          │
     │  5. Code를 백엔드 서버로 전달              │
     │                                          │
┌────┴─────┐                               ┌────┴───────┐
│ Backend  │  6. Code로 Access Token 요청   │            │
│  Server  ├───────────────────────────────►│            │
│          │  7. Access Token 발급          │            │
│          │◄───────────────────────────────┤            │
└──────────┘                               └────────────┘
```

### Grant Types

| 타입 | 용도 |
|------|------|
| Authorization Code | 서버 사이드 앱 (가장 안전) |
| Implicit | SPA (보안 취약, 비권장) |
| Client Credentials | 서버 간 통신 |
| Password | 자사 앱 (비권장) |

### PKCE (Proof Key for Code Exchange)
- Authorization Code 탈취 방지
- 모바일/SPA에서 권장

### 면접관이 주목하는 포인트
- 왜 Authorization Code를 바로 Token으로 교환하지 않는지
- Code 탈취 시 문제점과 PKCE 해결 방안

</details>

---

## Q5. XSS와 CSRF 공격은 무엇이며, 어떻게 방어하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### XSS (Cross-Site Scripting)
악의적인 스크립트를 웹 페이지에 삽입하여 사용자 정보 탈취

**방어:**
- 입력값 검증 및 이스케이프 처리
- CSP (Content Security Policy) 설정
- HttpOnly 쿠키 (JS 접근 차단)

### CSRF (Cross-Site Request Forgery)
사용자의 의도와 무관한 요청을 위조

**방어:**
- CSRF 토큰 사용
- SameSite 쿠키 속성
- Referer 검증

### JWT 저장 위치별 취약점

| 저장 위치 | XSS | CSRF |
|----------|:---:|:----:|
| localStorage | 취약 | 안전 |
| Cookie | 안전 (HttpOnly) | 취약 |
| Cookie + SameSite | 안전 | 안전 |

### 면접관이 주목하는 포인트
- 각 공격의 차이점
- 토큰 저장 위치 선택 이유

</details>

---

## 학습 체크리스트

- [ ] 세션 vs JWT 차이 및 선택 기준 설명 가능
- [ ] JWT 구조 3부분 설명 가능
- [ ] Access/Refresh Token 역할 및 보안 전략 이해
- [ ] OAuth 2.0 Authorization Code 흐름 그릴 수 있음
- [ ] XSS/CSRF 공격과 방어 방법 알기
