# 보안 (Security)

> 웹 애플리케이션 보안의 핵심 개념

## 학습 목표

- [ ] XSS 3종과 CSRF, SQL Injection의 공격 원리와 방어를 코드로 설명할 수 있다
- [ ] OWASP Top 10 상위 항목이 무엇을 가리키는지 안다
- [ ] Same-Origin Policy가 막는 것과 막지 않는 것을 구분할 수 있다
- [ ] CORS 에러 메시지를 보고 원인 위치를 진단할 수 있다
- [ ] HTTPS가 보장하는 세 가지와 중간자 공격의 성립 조건을 설명할 수 있다
- [ ] 암호화와 해싱의 차이를 알고 비밀번호 저장 방식을 설계할 수 있다
- [ ] Salt, Pepper, work factor가 각각 무엇을 막는지 설명할 수 있다

---

## 개념 설명 파일

| 파일 | 주제 | 난이도 |
|------|------|--------|
| [01-web-vulnerabilities.md](./01-web-vulnerabilities.md) | 웹 취약점과 방어 (XSS, CSRF, SQL Injection, OWASP Top 10) | ⭐⭐ |
| [02-cors-same-origin.md](./02-cors-same-origin.md) | 동일 출처 정책과 CORS | ⭐⭐ |
| [03-https-tls.md](./03-https-tls.md) | HTTPS와 TLS | ⭐⭐ |
| [04-cryptography-hashing.md](./04-cryptography-hashing.md) | 암호화와 해싱 | ⭐⭐⭐ |

---

## QnA 파일

- [qna-security.md](./qna-security.md) - 보안 면접 질문 모음

---

## 핵심 키워드

`OWASP` `XSS` `CSRF` `SQL Injection` `PreparedStatement`
`출력 인코딩` `CSP` `HttpOnly` `SameSite` `IDOR`
`Same-Origin Policy` `Origin` `Preflight` `credentials`
`HTTPS` `TLS` `핸드셰이크` `인증서 체인` `CA` `HSTS` `MITM`
`대칭키` `비대칭키` `AES` `RSA` `해싱` `Salt` `Pepper`
`bcrypt` `Argon2` `work factor` `전자서명` `HMAC`
