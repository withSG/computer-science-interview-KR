# 네트워크 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. TCP와 UDP의 차이점을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
TCP는 연결 지향적 프로토콜로 신뢰성을 보장하고, UDP는 비연결 지향적 프로토콜로 속도를 우선시합니다.

### 비교 표

| 구분 | TCP | UDP |
|------|-----|-----|
| 연결 방식 | 연결 지향 (3-way handshake) | 비연결 지향 |
| 신뢰성 | 보장 (재전송, 순서 보장) | 미보장 |
| 속도 | 상대적으로 느림 | 빠름 |
| 헤더 크기 | 20바이트 | 8바이트 |
| 흐름 제어 | 있음 | 없음 |
| 사용 사례 | HTTP, FTP, 이메일 | 스트리밍, DNS, 게임 |

### 면접관이 주목하는 포인트
- 신뢰성 보장 메커니즘 설명 (ACK, 재전송)
- 실제 사용 사례와 선택 기준

### 꼬리 질문 대비
- "HTTP/3는 왜 UDP(QUIC)를 사용하나요?"
  → 연결 설정 비용 감소, Head-of-line blocking 해결

</details>

---

## Q2. HTTP와 HTTPS의 차이점은 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
HTTPS는 HTTP에 SSL/TLS 암호화를 추가한 프로토콜입니다. 데이터가 암호화되어 전송되므로 도청, 변조, 위장을 방지할 수 있습니다.

### 비교

| 구분 | HTTP | HTTPS |
|------|------|-------|
| 포트 | 80 | 443 |
| 암호화 | 없음 | SSL/TLS |
| 보안 | 취약 | 안전 |
| 인증서 | 불필요 | 필요 |
| 속도 | 빠름 | 약간 느림 (핸드셰이크) |

### SSL/TLS 핸드셰이크 과정 (간략)
1. Client Hello: 지원하는 암호화 방식 전송
2. Server Hello: 선택된 암호화 방식 + 인증서 전송
3. 키 교환: 대칭키 생성 및 공유
4. 암호화 통신 시작

### 면접관이 주목하는 포인트
- 대칭키/비대칭키 암호화 차이
- 왜 두 가지를 함께 사용하는지

### 꼬리 질문 대비
- "왜 대칭키와 비대칭키를 함께 사용하나요?"
  → 비대칭키로 대칭키를 안전하게 교환, 이후 빠른 대칭키로 통신

</details>

---

## Q3. 3-way Handshake와 4-way Handshake를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 3-way Handshake (연결 수립)
```
Client              Server
  │                   │
  │──── SYN ─────────►│  1. 연결 요청
  │                   │
  │◄─── SYN + ACK ────│  2. 요청 수락 + 확인
  │                   │
  │──── ACK ─────────►│  3. 연결 확립
  │                   │
```

### 4-way Handshake (연결 종료)
```
Client              Server
  │                   │
  │──── FIN ─────────►│  1. 종료 요청
  │                   │
  │◄─── ACK ─────────│  2. 확인
  │                   │
  │◄─── FIN ─────────│  3. 서버도 종료 준비 완료
  │                   │
  │──── ACK ─────────►│  4. 확인, 연결 종료
  │                   │
```

### 면접관이 주목하는 포인트
- 왜 3단계/4단계가 필요한지
- TIME_WAIT 상태의 역할

### 꼬리 질문 대비
- "왜 연결 종료는 4단계인가요?"
  → 서버가 남은 데이터를 전송할 시간이 필요하기 때문
- "TIME_WAIT 상태는 왜 필요한가요?"
  → 지연된 패킷 처리, ACK 손실 시 재전송 대비

</details>

---

## Q4. 주소창에 URL을 입력하면 무슨 일이 일어나나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변 (단계별)

1. **URL 파싱**: 프로토콜, 도메인, 경로 분리
2. **DNS 조회**: 도메인 → IP 주소 변환
3. **TCP 연결**: 3-way Handshake
4. **TLS 핸드셰이크**: HTTPS인 경우
5. **HTTP 요청**: GET /path HTTP/1.1
6. **서버 처리**: 요청 처리, 응답 생성
7. **HTTP 응답**: HTML, CSS, JS 등 전송
8. **브라우저 렌더링**: DOM 파싱, CSSOM, 렌더 트리

### DNS 조회 과정
```
브라우저 캐시 → OS 캐시 → 라우터 캐시 → ISP DNS →
Root DNS → TLD DNS → 권한 있는 DNS
```

### 면접관이 주목하는 포인트
- 각 단계에서의 캐싱 전략
- 성능 최적화 포인트

### 꼬리 질문 대비
- "DNS 조회를 최적화하는 방법은?"
  → DNS Prefetch, CDN 사용

</details>

---

## Q5. REST API란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
REST는 HTTP를 기반으로 자원을 이름으로 구분하여 상태를 주고받는 아키텍처 스타일입니다.

### REST 6가지 원칙
1. **Client-Server**: 클라이언트와 서버 분리
2. **Stateless**: 서버는 클라이언트 상태 저장 안 함
3. **Cacheable**: 응답은 캐시 가능해야 함
4. **Uniform Interface**: 일관된 인터페이스
5. **Layered System**: 계층화된 시스템
6. **Code on Demand** (선택): 서버에서 코드 전송 가능

### HTTP 메서드와 CRUD

| 메서드 | 동작 | 멱등성 |
|--------|------|--------|
| GET | 조회 | O |
| POST | 생성 | X |
| PUT | 전체 수정 | O |
| PATCH | 부분 수정 | X |
| DELETE | 삭제 | O |

### 면접관이 주목하는 포인트
- RESTful한 URL 설계
- 상태 코드 활용 (200, 201, 400, 401, 404, 500)

### 꼬리 질문 대비
- "PUT과 PATCH의 차이점은?"
  → PUT은 전체 리소스 교체, PATCH는 부분 수정
- "멱등성이란?"
  → 같은 요청을 여러 번 해도 결과가 동일

</details>

---

## Q6. OSI 7계층을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 계층 | 이름 | 역할 | 프로토콜/장비 |
|------|------|------|-------------|
| 7 | 응용 | 사용자 인터페이스 | HTTP, FTP |
| 6 | 표현 | 데이터 변환, 암호화 | SSL, JPEG |
| 5 | 세션 | 연결 관리 | NetBIOS |
| 4 | 전송 | 포트, 신뢰성 | TCP, UDP |
| 3 | 네트워크 | IP 주소, 라우팅 | IP, 라우터 |
| 2 | 데이터링크 | MAC 주소, 프레임 | 이더넷, 스위치 |
| 1 | 물리 | 비트 전송 | 케이블, 허브 |

### TCP/IP 4계층과 매핑
- 응용 (7,6,5) → Application
- 전송 (4) → Transport
- 네트워크 (3) → Internet
- 데이터링크+물리 (2,1) → Network Access

### 면접관이 주목하는 포인트
- 각 계층의 핵심 역할
- 실무와의 연관성 (HTTP는 7계층, TCP는 4계층)

</details>

---

## Q7. CORS란 무엇이며 왜 필요한가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CORS(Cross-Origin Resource Sharing)는 다른 출처(Origin)의 리소스에 접근할 수 있게 해주는 메커니즘입니다. 브라우저의 동일 출처 정책(SOP)을 완화하기 위해 사용됩니다.

### 동일 출처 판단 기준
`프로토콜 + 호스트 + 포트`가 모두 같아야 동일 출처

### CORS 해결 방법
1. 서버에서 Access-Control-Allow-Origin 헤더 설정
2. 프록시 서버 사용
3. JSONP (구식)

### Preflight 요청
- OPTIONS 메서드로 사전 검사
- 단순 요청이 아닌 경우 발생

### 면접관이 주목하는 포인트
- SOP가 왜 필요한지 (보안)
- 실무에서의 해결 경험

</details>

---

## Q8. 쿠키와 세션의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 쿠키 | 세션 |
|------|------|------|
| 저장 위치 | 클라이언트 | 서버 |
| 보안 | 취약 | 비교적 안전 |
| 용량 | 4KB 제한 | 서버 메모리 |
| 만료 | 설정 가능 | 브라우저 종료 시 |

### 세션 동작 방식
1. 서버에서 세션 ID 생성
2. 세션 ID를 쿠키로 클라이언트에 전달
3. 이후 요청 시 쿠키의 세션 ID로 사용자 식별

### 면접관이 주목하는 포인트
- 스케일아웃 시 세션 관리 문제
- JWT와의 비교

### 꼬리 질문 대비
- "서버 증설 시 세션 관리는 어떻게?"
  → Sticky Session, Session Clustering, Redis 세션 스토어

</details>

---

## Q9. HTTP 메소드에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 메소드 | 용도 | 멱등성 | 안전성 | 요청 Body |
|--------|------|:------:|:------:|:---------:|
| GET | 리소스 조회 | O | O | X |
| POST | 리소스 생성 | X | X | O |
| PUT | 리소스 전체 수정 | O | X | O |
| PATCH | 리소스 부분 수정 | X | X | O |
| DELETE | 리소스 삭제 | O | X | X |
| HEAD | 헤더만 조회 | O | O | X |
| OPTIONS | 지원 메소드 확인 | O | O | X |

### 멱등성(Idempotency)이란?
같은 요청을 여러 번 보내도 결과가 동일한 성질

```
GET /users/1 → 항상 같은 결과 (멱등)
POST /users  → 매번 새 유저 생성 (비멱등)
DELETE /users/1 → 첫 번째만 삭제, 이후 404 (결과 동일 → 멱등)
```

### POST vs PUT vs PATCH

| 구분 | POST | PUT | PATCH |
|------|------|-----|-------|
| 용도 | 생성 | 전체 교체 | 부분 수정 |
| 멱등성 | X | O | X |
| URL | 컬렉션 | 리소스 | 리소스 |

### 면접관이 주목하는 포인트
- 멱등성 개념 이해
- PUT과 PATCH 차이 명확히 구분

</details>

---

## Q10. HTTP/1.1과 HTTP/2의 차이점은 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | HTTP/1.1 | HTTP/2 |
|------|----------|--------|
| 프로토콜 | 텍스트 | 바이너리 |
| 다중화 | X (순차 처리) | O (멀티플렉싱) |
| 헤더 압축 | X | O (HPACK) |
| 서버 푸시 | X | O |
| 연결 | 6개 제한 (도메인당) | 단일 연결 |

### HTTP/1.1의 문제점

**1. Head-of-Line Blocking**
```
요청1 ──────────────────────────►
      ◄────────────── 응답1
요청2 ──────────────────────────►
      ◄────────────── 응답2
(앞 요청이 끝나야 다음 요청 가능)
```

**2. 헤더 중복 전송**
- 매 요청마다 동일한 헤더 반복 전송

### HTTP/2 해결책

**1. 멀티플렉싱 (Multiplexing)**
```
요청1 ──────►
요청2 ──────►  (동시에 여러 요청/응답)
요청3 ──────►
◄────── 응답2
◄────── 응답1
◄────── 응답3
```

**2. 헤더 압축 (HPACK)**
- 정적/동적 테이블로 헤더 압축
- 중복 헤더 전송 방지

**3. 서버 푸시**
- HTML 요청 시 CSS, JS를 미리 전송

### 면접관이 주목하는 포인트
- HOL Blocking 문제와 해결 방법
- HTTP/3(QUIC)의 등장 배경

</details>

---

## Q11. TCP의 흐름제어와 혼잡제어에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 흐름제어 (Flow Control) | 혼잡제어 (Congestion Control) |
|------|------------------------|------------------------------|
| 목적 | 송수신자 간 속도 조절 | 네트워크 혼잡 방지 |
| 대상 | End-to-End | 네트워크 전체 |
| 방법 | 슬라이딩 윈도우 | AIMD, Slow Start 등 |

### 흐름제어 (Flow Control)

**슬라이딩 윈도우**
```
송신자: [1][2][3][4][5][6][7][8]...
         └──윈도우──┘

수신자: Window Size = 4
        "한 번에 4개까지 받을 수 있어요"
```
- 수신자의 버퍼 오버플로우 방지
- 수신자가 Window Size를 통보

### 혼잡제어 (Congestion Control)

**1. AIMD (Additive Increase / Multiplicative Decrease)**
- 성공 시 윈도우 +1 (선형 증가)
- 실패 시 윈도우 /2 (절반 감소)

**2. Slow Start**
```
초기: 윈도우 = 1
성공 시: 윈도우 x 2 (지수 증가)
임계값 도달 시: AIMD로 전환
```

**3. Fast Retransmit / Fast Recovery**
- 중복 ACK 3번 → 즉시 재전송
- 타임아웃 전에 빠른 복구

### 면접관이 주목하는 포인트
- 흐름제어와 혼잡제어의 차이점
- TCP가 신뢰성을 보장하는 방법

</details>

---

## Q12. DNS 동작 원리를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
DNS(Domain Name System)는 도메인 이름을 IP 주소로 변환하는 분산형 데이터베이스 시스템입니다.

### DNS 조회 과정
```
1. 브라우저 캐시 확인
2. OS 캐시 확인 (/etc/hosts)
3. 라우터 캐시 확인
4. ISP DNS 서버 확인
5. DNS 재귀 조회 시작
   └─► Root DNS (.com, .org 등 안내)
      └─► TLD DNS (example.com 안내)
         └─► Authoritative DNS (IP 반환)
```

### DNS 서버 유형

| 유형 | 역할 |
|------|------|
| Root DNS | 최상위, TLD 위치 안내 |
| TLD DNS | .com, .org 등 관리 |
| Authoritative DNS | 실제 도메인 정보 보유 |
| Recursive DNS | 캐싱, 재귀 조회 수행 |

### DNS 레코드 유형

| 레코드 | 설명 |
|--------|------|
| A | 도메인 → IPv4 |
| AAAA | 도메인 → IPv6 |
| CNAME | 도메인 → 도메인 (별칭) |
| MX | 메일 서버 |
| NS | 네임서버 |
| TXT | 텍스트 정보 (SPF, DKIM 등) |

### DNS 최적화 방법
1. **DNS Prefetch**: `<link rel="dns-prefetch" href="//api.example.com">`
2. **TTL 설정**: 적절한 캐시 유지 시간
3. **CDN 사용**: 가까운 서버 응답

### 면접관이 주목하는 포인트
- 재귀 조회 vs 반복 조회
- TTL의 역할과 Trade-off

</details>

---

## Q13. SSE(Server-Sent Events)란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
SSE는 서버에서 클라이언트로의 단방향 실시간 통신 기술입니다. HTTP 기반으로 동작하며 EventSource API를 사용하고, 연결이 끊어지면 자동으로 재연결합니다.

### 특징

| 항목 | SSE |
|------|-----|
| 방향 | 단방향 (서버→클라이언트) |
| 프로토콜 | HTTP |
| 재연결 | 자동 |
| 사용 사례 | 알림, 실시간 피드, AI 스트리밍 |

```
특징:
- HTTP 기반 (방화벽 친화적)
- 단방향 (서버→클라이언트만)
- 자동 재연결
- 텍스트 데이터
```

### 면접관이 주목하는 포인트
- HTTP 기반이라 방화벽 친화적임
- WebSocket과의 차이점 (단방향 vs 양방향)

### 꼬리 질문 대비
- "SSE는 어떤 상황에 적합한가요?" → 알림, 실시간 피드, AI 응답 스트리밍처럼 서버→클라이언트 데이터만 필요한 경우

</details>

---

## Q14. WebSocket이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
WebSocket은 클라이언트와 서버 간 양방향 전이중 통신 프로토콜입니다. HTTP Upgrade 핸드셰이크로 연결을 수립한 후 지속적으로 통신합니다.

### 연결 과정

| 항목 | WebSocket |
|------|----------|
| 방향 | 양방향 |
| 프로토콜 | ws:// / wss:// |
| 연결 유지 | 지속 연결 |
| 사용 사례 | 채팅, 게임, 협업 도구 |

```
연결 과정:
1. HTTP Upgrade 요청
2. 101 Switching Protocols 응답
3. ws:// 프로토콜로 전환
4. 양방향 통신 시작
```

### 면접관이 주목하는 포인트
- HTTP Upgrade 핸드셰이크 과정
- 지속 연결로 인한 오버헤드 감소

### 꼬리 질문 대비
- "HTTP/2 서버 푸시와 WebSocket 차이?" → HTTP/2 push는 리소스 전송용, WebSocket은 실시간 양방향 메시지 교환용

</details>

---

## Q15. Polling과 Long Polling의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Short Polling은 클라이언트가 일정 간격으로 반복 요청을 보내고, Long Polling은 서버가 새 데이터가 생길 때까지 응답을 보류하다가 데이터가 있을 때 응답합니다.

### 비교

| 방식 | Short Polling | Long Polling |
|------|-------------|-------------|
| 동작 | 주기적 반복 요청 | 응답 대기 후 즉시 재요청 |
| 지연 | 폴링 간격만큼 | 거의 없음 |
| 서버 부하 | 높음 | 중간 |
| 연결 유지 | X | 임시 유지 |

### 면접관이 주목하는 포인트
- 각 방식의 실시간성과 서버 부하 트레이드오프
- SSE/WebSocket과의 비교

### 꼬리 질문 대비
- "언제 Polling을 쓰나요?" → SSE/WebSocket을 지원하지 않는 환경이나 주기적 업데이트로 충분한 경우

</details>

---

## Q16. 실시간 통신 방식을 비교해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Short Polling → Long Polling → SSE → WebSocket 순으로 효율성이 증가하며, 각 방식은 사용 목적과 환경에 따라 선택합니다.

### 비교

| 구분 | Short Polling | Long Polling | SSE | WebSocket |
|------|-------------|-------------|-----|----------|
| 방향 | 단방향 | 단방향 | 단방향 | 양방향 |
| 프로토콜 | HTTP | HTTP | HTTP | ws:// |
| 서버 부하 | 높음 | 중간 | 낮음 | 낮음 |
| 구현 복잡도 | 낮음 | 중간 | 낮음 | 높음 |
| 자동 재연결 | X | 수동 | O | 수동 |
| 사용 사례 | 단순 업데이트 | 채팅 대안 | 알림/AI | 채팅/게임 |

### 면접관이 주목하는 포인트
- 각 방식의 장단점과 적합한 사용 사례
- 실무에서 선택 기준

### 꼬리 질문 대비
- "AI 응답 스트리밍에는 어떤 방식이 적합한가요?" → SSE (서버→클라이언트 단방향, HTTP 기반, 자동 재연결)

</details>

---

## Q17. PDU(Protocol Data Unit)란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
PDU는 네트워크 계층 간 데이터 전달 단위입니다. 각 계층마다 다른 이름으로 불리며 헤더와 페이로드로 구성됩니다.

### 계층별 PDU 명칭

| 계층 | PDU 명칭 |
|------|---------|
| 애플리케이션 | 메시지(Message) |
| 전송(TCP) | 세그먼트(Segment) |
| 전송(UDP) | 데이터그램(Datagram) |
| 인터넷 | 패킷(Packet) |
| 데이터 링크 | 프레임(Frame) |
| 물리 | 비트(Bit) |

캡슐화: 상위→하위로 헤더 추가
비캡슐화: 하위→상위로 헤더 제거

### 면접관이 주목하는 포인트
- 계층별 PDU 명칭 암기
- 캡슐화/비캡슐화 개념 이해

### 꼬리 질문 대비
- "패킷과 프레임의 차이?" → 패킷은 L3(IP 주소 기반 라우팅), 프레임은 L2(MAC 주소 포함 링크 전송)

</details>

---

## Q18. I/O 모델을 설명해주세요. (Blocking/Non-blocking, Sync/Async) ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
I/O 모델은 **프로그램이 I/O 작업(파일, 네트워크 등)을 요청하고 결과를 받는 방식**을 정의합니다. Blocking/Non-blocking(제어 흐름)과 Synchronous/Asynchronous(결과 처리)의 2가지 축으로 4가지 조합이 됩니다.

### 핵심 개념 구분

```
Blocking vs Non-blocking: I/O 작업 동안 호출자가 대기하는가?
  - Blocking: 결과 나올 때까지 호출자 멈춤
  - Non-blocking: 즉시 리턴 (결과 없어도), 호출자는 다른 작업 가능

Synchronous vs Asynchronous: 결과를 누가 어떻게 처리하는가?
  - Synchronous: 호출자가 직접 결과를 확인/처리
  - Asynchronous: OS나 커널이 완료 후 콜백으로 알려줌
```

### 4가지 I/O 모델

#### 1. Blocking I/O (동기 블로킹)

```
호출자 → read() 호출 → [대기 대기 대기...] → 데이터 수신 → 처리

특징:
  - 가장 단순한 모델
  - I/O 완료까지 스레드 블로킹
  - 멀티스레드로 동시성 처리 (스레드당 1 I/O)

문제:
  - 스레드 수 = 동시 연결 수 → 스레드 폭발 위험
  - 컨텍스트 스위칭 오버헤드

예: 전통적인 Java I/O (InputStream.read())
```

#### 2. Non-blocking I/O (동기 논블로킹)

```
호출자 → read() 호출 → 즉시 반환 (EAGAIN/EWOULDBLOCK)
       → 다른 작업
       → read() 재호출 (폴링)
       → ...반복...
       → 데이터 있으면 반환

특징:
  - 호출자가 계속 확인해야 함 (Busy Waiting)
  - CPU 낭비 발생 가능

예: Unix Non-blocking 소켓 + select/poll
```

#### 3. I/O Multiplexing (동기 + 이벤트 대기)

```
호출자 → select()/epoll() 호출 → [다수 fd 동시 대기]
       → 준비된 fd 알림 → read() 호출 (즉시 데이터 있음)

특징:
  - 하나의 스레드로 다수 I/O 소켓 관리
  - Blocking이지만 여러 fd를 동시에 감시
  - Non-blocking보다 효율적

핵심 시스템 콜:
  - select(): 최대 1024 fd, 모든 fd 순회
  - poll(): fd 수 제한 없음, 역시 순회
  - epoll() (Linux): O(1) 이벤트 감지, 대규모에 적합

예: Redis (싱글 스레드 + epoll), Nginx
```

#### 4. Asynchronous I/O (비동기 논블로킹)

```
호출자 → aio_read() 호출 → 즉시 반환
       → 다른 작업 계속
       → OS가 I/O 완료 후 콜백 호출

특징:
  - 완전한 비동기: 호출자가 I/O를 신경 쓰지 않음
  - 가장 효율적이지만 구현 복잡

예: Node.js (libuv), Java NIO.2 (AIO)
```

### 4가지 조합 비교

| 모델 | Blocking | Synchronous | 설명 |
|------|---------|-------------|------|
| Blocking I/O | ✓ | ✓ | 가장 단순, 대기 발생 |
| Non-blocking I/O | ✗ | ✓ | 폴링, Busy Waiting |
| I/O Multiplexing | △ | ✓ | select/epoll 대기 |
| Async I/O | ✗ | ✗ | 콜백으로 완료 통보 |

### 실무에서의 선택

```
소규모, 단순한 서버 → Blocking I/O + 멀티스레드
대규모 동시 연결 → I/O Multiplexing (Nginx, Redis)
최고 처리량, 복잡한 로직 → Async I/O (Node.js, Netty)
```

### 면접관이 주목하는 포인트
- Blocking vs Non-blocking과 Sync vs Async를 혼동하지 않는지
- epoll이 select/poll보다 효율적인 이유 (O(1) vs O(n))

### 꼬리 질문 대비
- "Node.js가 싱글 스레드인데 빠른 이유는?" → Event Loop + Non-blocking I/O로 I/O 대기 중 다른 요청 처리, I/O는 libuv가 비동기 처리

</details>

---

## 학습 체크리스트

- [ ] TCP vs UDP 차이 설명 가능
- [ ] HTTP vs HTTPS 차이 설명 가능
- [ ] 3-way/4-way Handshake 설명 가능
- [ ] URL 입력 시 발생하는 과정 설명 가능
- [ ] REST API 원칙 설명 가능
- [ ] CORS 개념과 해결 방법 이해
- [ ] HTTP 메소드별 특징과 멱등성 이해
- [ ] HTTP/1.1 vs HTTP/2 차이 설명 가능
- [ ] 흐름제어와 혼잡제어 개념 이해
- [ ] DNS 동작 원리 설명 가능
- [ ] SSE와 WebSocket 차이 설명 가능
- [ ] 실시간 통신 4가지 방식 비교 가능
- [ ] PDU 계층별 명칭 암기
- [ ] I/O 모델 4가지(Blocking/Non-blocking/Multiplexing/Async) 설명 가능
