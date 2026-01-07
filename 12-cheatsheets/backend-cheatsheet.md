# 백엔드 개발자 치트시트

> 면접 직전 빠르게 복습하는 핵심 요약

---

## 🖥️ 운영체제

### 프로세스 vs 스레드
```
프로세스: 독립 메모리, IPC 통신, 컨텍스트 스위칭 비용 큼
스레드: 메모리 공유, 동기화 필요, 경량
```

### 동기화
```
뮤텍스: 하나의 스레드만 접근 (Lock/Unlock)
세마포어: N개 스레드 접근 허용
데드락 조건: 상호배제, 점유대기, 비선점, 순환대기
```

### 메모리
```
스택: 정적 할당, LIFO, 빠름
힙: 동적 할당, GC 대상
```

---

## ☕ Java

### OOP 4원칙
```
캡슐화: 데이터 은닉
상속: 코드 재사용
다형성: 같은 인터페이스, 다른 구현
추상화: 핵심만 노출
```

### SOLID
```
S: 단일 책임 (하나의 책임)
O: 개방-폐쇄 (확장에 열림, 수정에 닫힘)
L: 리스코프 치환 (자식은 부모 대체 가능)
I: 인터페이스 분리 (작은 인터페이스)
D: 의존성 역전 (추상에 의존)
```

### GC
```
Young Gen: Minor GC (빠름)
Old Gen: Major GC (느림, Stop-the-world)

GC 종류: Serial, Parallel, CMS, G1, ZGC
```

### Java 21 Virtual Threads
```
경량 스레드, OS 스레드와 M:N 매핑
I/O 바운드 작업에 효과적
```

---

## 🍃 Spring

### IoC/DI
```
IoC: 객체 생성을 컨테이너가 관리
DI: 의존성을 외부에서 주입

생성자 주입 권장 (불변성, 테스트, 순환참조 방지)
```

### AOP
```
Proxy 기반 (JDK Dynamic Proxy, CGLIB)
@Transactional, @Aspect

Self-Invocation 문제: 내부 호출 시 프록시 안 탐
해결: 별도 클래스 분리
```

### Spring MVC 흐름
```
Request → DispatcherServlet → HandlerMapping
        → Controller → ViewResolver → View → Response
```

### Bean 생명주기
```
생성 → 의존성 주입 → @PostConstruct → 사용 → @PreDestroy → 소멸
```

---

## 🗄️ Database

### JPA 영속성 컨텍스트
```
1차 캐시: 같은 트랜잭션 내 조회 캐싱
쓰기 지연: 커밋 시점에 SQL 실행
변경 감지: 엔티티 변경 자동 UPDATE
```

### N+1 문제
```
원인: 연관 엔티티 지연 로딩 시 추가 쿼리

해결:
- Fetch Join (JOIN FETCH)
- @EntityGraph
- @BatchSize
```

### 트랜잭션 격리 수준
```
READ_UNCOMMITTED: Dirty Read 가능
READ_COMMITTED: Dirty Read 방지
REPEATABLE_READ: Non-Repeatable Read 방지 (MySQL 기본)
SERIALIZABLE: 모든 문제 방지 (성능 저하)
```

### 인덱스
```
B-Tree: 정렬 유지, O(log n)
복합 인덱스: 선두 컬럼 조건 필수

인덱스 피해야 할 경우:
- 카디널리티 낮은 컬럼 (성별 등)
- 데이터 변경 빈번한 테이블
```

---

## 🔐 인증

### Session vs JWT
```
Session: 서버 저장 (Stateful), 확장 시 동기화 필요
JWT: 클라이언트 저장 (Stateless), 탈취 시 제어 어려움
```

### JWT 구조
```
Header.Payload.Signature
- Payload는 암호화 X (Base64)
- Signature로 위변조 검증만
```

### OAuth 2.0 Authorization Code
```
1. 소셜 로그인 클릭
2. Authorization Server 리다이렉트
3. 로그인 + 동의
4. Authorization Code 발급
5. Code → Access Token 교환
```

---

## 🏗️ 시스템 설계

### 캐싱 전략
```
Cache-Aside: 앱이 직접 캐시 관리
Write-Through: DB와 캐시 동시 쓰기
Write-Back: 캐시 먼저, 나중에 DB
```

### 확장성
```
수직 확장: 더 강력한 서버
수평 확장: 서버 대수 증가

로드 밸런서: Round Robin, Least Connections
샤딩: Range, Hash, Directory
```

### CAP 정리
```
C: Consistency (일관성)
A: Availability (가용성)
P: Partition Tolerance (분할 내성)

분산 시스템에서 P 필수 → CP or AP 선택
```

---

## 🤖 AI/RAG

### RAG 파이프라인
```
1. Indexing: 문서 → 청킹 → 임베딩 → 벡터DB
2. Retrieval: 쿼리 → 임베딩 → 유사도 검색
3. Generation: 쿼리 + 컨텍스트 → LLM → 답변
```

### 청킹 전략
```
Fixed Size: 고정 토큰/문자 수
Semantic: 의미 유사도 기반
Recursive: 계층적 분할
```

### 벡터 DB 알고리즘
```
HNSW: 계층적 그래프, 빠름, 메모리 많음
IVF: 클러스터링, 메모리 효율적
```

---

## ✅ 최종 체크

```
□ 프로세스/스레드 차이
□ GC 동작 원리
□ Spring DI 방식, AOP 프록시
□ N+1 문제 해결 방법 3가지
□ JWT 구조, Session 차이
□ 캐싱 전략 비교
□ CAP 정리
□ RAG 파이프라인
```
