# CS 면접 대비 학습 자료

> 백엔드/프론트엔드 개발자를 위한 체계적인 CS 면접 준비 가이드

## 학습 목표

- 컴퓨터 공학 기초 지식 습득
- 실무 프레임워크 심층 이해
- 기술 면접 대비 QnA 학습

---

## 학습 진행 체크리스트

> 학습이 완료된 항목에 체크(`[x]`)하여 진행 상황을 관리하세요.

### 01. Computer Science 기초 (공통)

- [ ] **Operating System (운영체제)**
  - [ ] 프로세스와 스레드
  - [ ] 프로세스 vs 프로그램
  - [ ] 메모리 관리
  - [ ] 컨텍스트 스위칭
  - [ ] 데드락과 레이스 컨디션
  - [ ] 가상 메모리
  - [ ] 인터럽트와 시스템 콜
  - [ ] 이중 모드 (User/Kernel Mode)
  - [ ] DMA
  - [ ] QnA 복습 완료

- [ ] **Network (네트워크)**
  - [ ] OSI 7계층
  - [ ] TCP/IP
  - [ ] HTTP/HTTPS
  - [ ] HTTP 메소드와 HTTP/2
  - [ ] 흐름제어와 혼잡제어
  - [ ] DNS 동작 원리
  - [ ] QnA 복습 완료

- [ ] **Data Structure (자료구조)**
  - [ ] 배열과 링크드 리스트
  - [ ] 스택과 큐
  - [ ] 트리와 그래프
  - [ ] 해시 테이블과 충돌 해결
  - [ ] Set 종류 (HashSet, TreeSet, LinkedHashSet)
  - [ ] AVL 트리
  - [ ] DFS vs BFS
  - [ ] QnA 복습 완료

- [ ] **Algorithm (알고리즘)**
  - [ ] 시간/공간 복잡도
  - [ ] 정렬 알고리즘
  - [ ] 탐색 알고리즘
  - [ ] 코딩 문제 (배열 조작, 유전 알고리즘)
  - [ ] 피보나치 구현 방법 비교
  - [ ] QnA 복습 완료

---

### 02. Backend Engineering (백엔드)

- [ ] **Java Fundamentals**
  - [ ] OOP와 SOLID 원칙
  - [ ] 메모리 모델
  - [ ] Garbage Collection
  - [ ] Call by Value/Reference
  - [ ] Java 21 Virtual Threads
  - [ ] 동기/비동기와 Thread-safe
  - [ ] Exception vs Error
  - [ ] HashTable vs HashMap
  - [ ] JVM 구조와 클래스 로더
  - [ ] 제네릭(Generics)
  - [ ] 오버라이딩 vs 오버로딩
  - [ ] static 키워드
  - [ ] 접근 제어자
  - [ ] Java 8 주요 기능
  - [ ] try-with-resource
  - [ ] 직렬화(Serialization)
  - [ ] QnA 복습 완료

- [ ] **Spring Framework**
  - [ ] IoC/DI
  - [ ] AOP와 Proxy
  - [ ] Spring MVC 흐름
  - [ ] Bean 생명주기
  - [ ] Spring Boot 자동 설정
  - [ ] @Transactional 주의사항
  - [ ] Bean Scope
  - [ ] @Autowired 동작 원리
  - [ ] DispatcherServlet
  - [ ] Filter vs Interceptor
  - [ ] 생성자 주입
  - [ ] QnA 복습 완료

- [ ] **Database**
  - [ ] 관계형 DB 구성요소와 Key 종류
  - [ ] JPA/ORM 개념
  - [ ] 영속성 컨텍스트
  - [ ] N+1 문제
  - [ ] 트랜잭션 격리 수준과 ACID
  - [ ] 트랜잭션 전파(Propagation)
  - [ ] JPA 프록시와 지연 로딩
  - [ ] 인덱싱과 B-Tree
  - [ ] 정규화 (1NF, 2NF, 3NF)
  - [ ] DDL/DML/DCL
  - [ ] NoSQL
  - [ ] QnA 복습 완료

- [ ] **Authentication (인증/인가)**
  - [ ] Session 기반 인증
  - [ ] JWT
  - [ ] OAuth 2.0
  - [ ] QnA 복습 완료

---

### 03. Frontend Engineering (프론트엔드)

- [ ] **Browser Fundamentals**
  - [ ] URL에서 렌더링까지
  - [ ] Critical Rendering Path
  - [ ] DOM/CSSOM
  - [ ] Reflow/Repaint
  - [ ] 합성과 GPU
  - [ ] QnA 복습 완료

- [ ] **JavaScript Deep Dive**
  - [ ] 실행 컨텍스트
  - [ ] 호이스팅과 TDZ
  - [ ] 클로저
  - [ ] 이벤트 루프
  - [ ] Microtask/Macrotask
  - [ ] Promise/async-await
  - [ ] QnA 복습 완료

- [ ] **React Architecture**
  - [ ] Virtual DOM
  - [ ] 재조정(Reconciliation)
  - [ ] Fiber 아키텍처
  - [ ] Hooks 내부 동작
  - [ ] useEffect vs useLayoutEffect
  - [ ] QnA 복습 완료

- [ ] **Next.js Rendering**
  - [ ] CSR/SSR/SSG/ISR
  - [ ] Hydration
  - [ ] React Server Components
  - [ ] QnA 복습 완료

---

### 04. System Design (시스템 설계)

- [ ] **Caching (캐싱)**
  - [ ] 캐싱 전략
  - [ ] CDN
  - [ ] QnA 복습 완료

- [ ] **Scalability (확장성)**
  - [ ] CAP 정리
  - [ ] 로드밸런싱
  - [ ] 샤딩
  - [ ] QnA 복습 완료

- [ ] **Performance (성능)**
  - [ ] 성능 최적화 기법
  - [ ] 병목 지점 분석
  - [ ] QnA 복습 완료

- [ ] **Infrastructure (인프라)**
  - [ ] 로드 밸런서 (L4/L7)
  - [ ] 무중단 배포 (Rolling, Blue/Green, Canary)
  - [ ] 대용량 트래픽 대응
  - [ ] QnA 복습 완료

---

### 05. AI Engineering (AI 엔지니어링)

- [ ] **RAG Pipeline**
  - [ ] 청킹 전략
  - [ ] 임베딩
  - [ ] 검색 최적화
  - [ ] QnA 복습 완료

- [ ] **Vector Database**
  - [ ] HNSW, IVF 알고리즘
  - [ ] 벡터 DB 선택
  - [ ] QnA 복습 완료

- [ ] **LLM Integration**
  - [ ] 프롬프트 엔지니어링
  - [ ] 환각 완화 기법
  - [ ] QnA 복습 완료

---

### 06. Design Patterns (디자인 패턴)

- [ ] 생성 패턴 (Singleton, Factory, Builder)
- [ ] 구조 패턴 (Adapter, Decorator, Proxy, Facade, Bridge)
- [ ] 행동 패턴 (Observer, Strategy, Template Method)
- [ ] 아키텍처 패턴 (MVC, MVP, MVVM)
- [ ] QnA 복습 완료

---

### 07. Security (보안)

- [ ] OWASP Top 10
- [ ] XSS, CSRF, SQL Injection
- [ ] HTTPS/TLS
- [ ] 암호화 (대칭키/비대칭키)
- [ ] 해시 함수와 비밀번호 저장
- [ ] QnA 복습 완료

---

### 08. API Design (API 설계)

- [ ] REST API 설계 원칙
- [ ] GraphQL 기초
- [ ] API 버저닝
- [ ] QnA 복습 완료

---

### 09. Software Engineering (소프트웨어 공학)

- [ ] 애자일/스크럼
- [ ] 코드 리뷰
- [ ] 테스트 전략 (단위/통합/시스템/인수)
- [ ] 테스트 코드 작성 이유
- [ ] 테스트 커버리지
- [ ] KISS, YAGNI, DRY 원칙
- [ ] 브룩스의 법칙
- [ ] QnA 복습 완료

---

### 10. Version Control (버전 관리)

- [ ] Git 기본 명령어
- [ ] 브랜칭 전략
- [ ] Git Flow vs GitHub Flow
- [ ] QnA 복습 완료

---

### 11. Practical Interview (실전 면접)

- [ ] STAR 기법 이해
- [ ] 행동 면접 질문 준비
- [ ] 자기소개/지원동기 준비
- [ ] QnA 복습 완료

---

### 12. Cheatsheets (치트시트)

- [ ] Backend Cheatsheet 정리
- [ ] Frontend Cheatsheet 정리

---

### 13. Cloud Engineering (클라우드 엔지니어링)

- [ ] **Cloud Fundamentals (클라우드 기초)**
  - [ ] IaaS/PaaS/SaaS
  - [ ] 가상화와 Hypervisor (Type 1/Type 2)
  - [ ] VM vs Container
  - [ ] QnA 복습 완료

- [ ] **Containerization (컨테이너화)**
  - [ ] **Docker**
    - [ ] 컨테이너 기본 개념
    - [ ] 이미지와 레이어
    - [ ] Dockerfile 작성
    - [ ] Docker Compose
    - [ ] 네트워킹
    - [ ] QnA 복습 완료

- [ ] **AWS**
  - [ ] VPC/Subnet 설계
  - [ ] Security Group vs NACL
  - [ ] EC2 Auto Scaling
  - [ ] Lambda
  - [ ] S3 정책
  - [ ] QnA 복습 완료

- [ ] **Kubernetes**
  - [ ] Pod, Service, Deployment
  - [ ] StatefulSet vs Deployment
  - [ ] ConfigMap/Secret
  - [ ] Ingress
  - [ ] 트러블슈팅
  - [ ] QnA 복습 완료

- [ ] **DevOps & CI/CD**
  - [ ] CI/CD 개념
  - [ ] 배포 전략 (Blue-Green, Canary, Rolling)
  - [ ] GitHub Actions/Jenkins
  - [ ] GitOps (ArgoCD)
  - [ ] IaC (Terraform)
  - [ ] QnA 복습 완료

- [ ] **Monitoring & Observability**
  - [ ] Logs, Metrics, Traces
  - [ ] Prometheus/Grafana
  - [ ] 로그 수집 (ELK, Loki)
  - [ ] SLI/SLO/SLA
  - [ ] 알림 설계
  - [ ] QnA 복습 완료

- [ ] **Linux & Networking**
  - [ ] 파일 권한 (chmod)
  - [ ] 프로세스 관리 (ps, top, kill)
  - [ ] 네트워크 명령어 (netstat, curl, tcpdump)
  - [ ] SSH 키 인증
  - [ ] 방화벽 (iptables, firewalld)
  - [ ] QnA 복습 완료

- [ ] **Practical Scenarios (실전 시나리오)**
  - [ ] 트러블슈팅 경험 정리
  - [ ] 시스템 설계 면접 준비
  - [ ] 행동 면접 (STAR) 답변 준비
  - [ ] QnA 복습 완료

---

## 학습 로드맵

### 신입 개발자 (0-2년)

**필수 학습 순서:**
1. CS 기초 (OS, Network, Data Structure)
2. 직무별 기초 (Java/Spring 또는 JavaScript/React)
3. REST API 설계
4. Git 기본

### 주니어 개발자 (2-4년)

**추가 학습:**
- 디자인 패턴 (Singleton, Factory, Observer)
- 시스템 설계 입문
- OOP & SOLID 원칙
- Docker/Kubernetes 기초

### 시니어 개발자 (4년+)

**심화 학습:**
- 디자인 패턴 전체
- MSA, Event-Driven Architecture
- AI 통합 (RAG, Vector DB)
- 클라우드 아키텍처 설계
- 모니터링/Observability

---

## QnA 파일 사용 방법

1. 질문을 먼저 읽고 스스로 답변해보세요
2. `<details>` 태그를 클릭하여 답변을 확인하세요
3. 부족한 부분은 개념 설명 파일을 참고하세요

### 난이도 표시
- ⭐ (기본): 신입 필수
- ⭐⭐ (중급): 경력 1-3년
- ⭐⭐⭐ (고급): 시니어 레벨

---

## 카테고리별 학습 가이드

| 카테고리 | 대상 | 핵심 키워드 |
|---------|------|-----------|
| OS | 공통 | 프로세스, 스레드, 메모리, 데드락, 시스템콜 |
| Network | 공통 | OSI, TCP/IP, HTTP/2, DNS, 흐름/혼잡제어 |
| Data Structure | 공통 | Array, LinkedList, HashMap, Set, Tree |
| Algorithm | 공통 | 시간복잡도, 정렬, 탐색, DP |
| Java | 백엔드 | OOP, GC, Thread-safe, Exception |
| Spring | 백엔드 | IoC/DI, AOP, MVC, JPA |
| Database | 백엔드 | ACID, 정규화, 인덱스, NoSQL |
| Security | 공통 | XSS, CSRF, 암호화, 해시 |
| Browser | 프론트엔드 | CRP, DOM, 리플로우 |
| JavaScript | 프론트엔드 | 클로저, 이벤트 루프, 호이스팅 |
| React | 프론트엔드 | Virtual DOM, Fiber, Hooks |
| Next.js | 프론트엔드 | SSR, SSG, RSC |
| Cloud | DevOps | Docker, K8s, CI/CD, AWS |

---

## 참고 자료

- 백엔드 CS, Spring, AI 면접 질문 정리.pdf
- 프론트엔드 개발자 면접 질문 정리.pdf
- [brave-tech-interview](https://github.com/brave-people/brave-tech-interview) - 용감한 사람들의 기술 면접 질문 모음
- [backend-interview-question](https://github.com/ksundong/backend-interview-question) - 백엔드 개발자 면접 질문 모음
