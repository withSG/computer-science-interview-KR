# CS 면접 대비 학습 자료

> 백엔드/프론트엔드 개발자를 위한 체계적인 CS 면접 준비 가이드

## 학습 목표

- 컴퓨터 공학 기초 지식 습득
- 실무 프레임워크 심층 이해
- 기술 면접 대비 QnA 학습

---

## 학습 진행 체크리스트

> 학습이 완료된 항목에 체크(`[x]`)하여 진행 상황을 관리하세요.

### [01. Computer Science 기초 (공통)](./01-computer-science-fundamentals/)

- [ ] **[Computer Architecture (컴퓨터 구조)](./01-computer-science-fundamentals/computer-architecture/)**
  - [ ] CPU 구성요소 (ALU, 제어장치, 레지스터)
  - [ ] 명령어 사이클 (Fetch-Decode-Execute)
  - [ ] 캐시 메모리 (L1/L2/L3, 지역성 원리, 캐시 미스)
  - [ ] 고정 소수점 vs 부동 소수점
  - [ ] 패리티 비트와 해밍 코드 (ECC)
  - [ ] ARM vs x86 (RISC vs CISC)
  - [ ] QnA 복습 완료

- [ ] **[Operating System (운영체제)](./01-computer-science-fundamentals/operating-system/)**
  - [ ] 프로세스와 스레드
  - [ ] 프로세스 vs 프로그램
  - [ ] 메모리 관리
  - [ ] 컨텍스트 스위칭
  - [ ] 데드락과 레이스 컨디션
  - [ ] 뮤텍스와 세마포어
  - [ ] 가상 메모리
  - [ ] 페이지 교체 알고리즘 (LRU)
  - [ ] 인터럽트와 시스템 콜
  - [ ] 이중 모드 (User/Kernel Mode)
  - [ ] DMA
  - [ ] CPU 스케줄링 알고리즘 (FCFS, SJF, RR, MLFQ)
  - [ ] IPC (Pipe, Message Queue, Shared Memory, Socket)
  - [ ] 파일 시스템 (접근 방식, 디렉토리 구조)
  - [ ] 페이징 vs 세그멘테이션
  - [ ] 32비트 vs 64비트
  - [ ] QnA 복습 완료

- [ ] **[Network (네트워크)](./01-computer-science-fundamentals/network/)**
  - [ ] OSI 7계층
  - [ ] TCP/IP
  - [ ] HTTP/HTTPS
  - [ ] HTTP 메소드와 HTTP/2
  - [ ] 흐름제어와 혼잡제어
  - [ ] DNS 동작 원리
  - [ ] I/O 모델 (Blocking/Non-blocking/Multiplexing/Async)
  - [ ] 실시간 통신 (Polling, Long Polling, SSE, WebSocket)
  - [ ] PDU (Protocol Data Unit)
  - [ ] QnA 복습 완료

- [ ] **[Data Structure (자료구조)](./01-computer-science-fundamentals/data-structure/)**
  - [ ] 배열과 링크드 리스트
  - [ ] 스택과 큐
  - [ ] 트리와 그래프
  - [ ] 힙 (Heap)
  - [ ] 해시 테이블과 충돌 해결
  - [ ] Set 종류 (HashSet, TreeSet, LinkedHashSet)
  - [ ] AVL 트리
  - [ ] DFS vs BFS
  - [ ] Trie (트라이)
  - [ ] B-Tree
  - [ ] QnA 복습 완료

- [ ] **[Algorithm (알고리즘)](./01-computer-science-fundamentals/algorithm/)**
  - [ ] 시간/공간 복잡도
  - [ ] 정렬 알고리즘
  - [ ] 탐색 알고리즘
  - [ ] 동적 프로그래밍 (DP)
  - [ ] 다익스트라 알고리즘
  - [ ] 알고리즘 패턴 (빈도수 카운터, 투 포인터, 슬라이딩 윈도우)
  - [ ] 코딩 문제 (배열 조작, 유전 알고리즘)
  - [ ] 피보나치 구현 방법 비교
  - [ ] 비트마스크 (BitMask)
  - [ ] 기수 정렬 (Radix Sort)
  - [ ] QnA 복습 완료

---

### [02. Backend Engineering (백엔드)](./02-backend-engineering/)

- [ ] **[Java Fundamentals](./02-backend-engineering/java-fundamentals/)**
  - [ ] OOP와 SOLID 원칙
  - [ ] Garbage Collection
  - [ ] JVM 구조와 클래스 로더
  - [ ] Call by Value/Reference
  - [ ] 원시타입 vs 참조타입 (Wrapper, Auto Boxing)
  - [ ] Java 21 Virtual Threads
  - [ ] 동기/비동기와 Thread-safe
  - [ ] Exception vs Error
  - [ ] HashTable vs HashMap
  - [ ] equals()와 hashCode() 오버라이딩
  - [ ] String vs StringBuilder vs StringBuffer
  - [ ] 인터페이스 vs 추상 클래스
  - [ ] 제네릭(Generics)
  - [ ] 오버라이딩 vs 오버로딩
  - [ ] static 키워드
  - [ ] 접근 제어자
  - [ ] Java 8 주요 기능
  - [ ] try-with-resource
  - [ ] 직렬화(Serialization)
  - [ ] JDK vs JRE
  - [ ] QnA 복습 완료

- [ ] **[Spring Framework](./02-backend-engineering/spring-framework/)**
  - [ ] IoC/DI
  - [ ] AOP와 Proxy
  - [ ] Spring MVC 흐름
  - [ ] Bean 생명주기
  - [ ] Bean Scope
  - [ ] @Component vs @Bean
  - [ ] Spring Boot 자동 설정
  - [ ] @Transactional 주의사항
  - [ ] @Autowired 동작 원리
  - [ ] DispatcherServlet
  - [ ] Filter vs Interceptor
  - [ ] 생성자 주입
  - [ ] POJO
  - [ ] Spring CORS 설정 (@CrossOrigin, WebMvcConfigurer)
  - [ ] 구동 시 초기화 실행 (CommandLineRunner, @PostConstruct)
  - [ ] QnA 복습 완료

- [ ] **[Database](./02-backend-engineering/database/)**
  - [ ] 관계형 DB 구성요소와 Key 종류
  - [ ] JPA/ORM 개념
  - [ ] 영속성 컨텍스트
  - [ ] N+1 문제
  - [ ] 트랜잭션 격리 수준과 ACID
  - [ ] 트랜잭션 전파(Propagation)
  - [ ] JPA 프록시와 지연 로딩
  - [ ] JPQL vs QueryDSL
  - [ ] 인덱싱과 B-Tree
  - [ ] 정규화 (1NF, 2NF, 3NF)
  - [ ] DDL/DML/DCL
  - [ ] NoSQL
  - [ ] SQL JOIN 종류 (INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF)
  - [ ] 이상현상 (삽입/삭제/갱신 Anomaly)
  - [ ] QnA 복습 완료

- [ ] **[Authentication (인증/인가)](./02-backend-engineering/authentication/)**
  - [ ] Session 기반 인증
  - [ ] JWT
  - [ ] OAuth 2.0
  - [ ] XSS/CSRF 방어와 JWT 저장 위치별 취약점
  - [ ] QnA 복습 완료

---

### [03. Frontend Engineering (프론트엔드)](./03-frontend-engineering/)

- [ ] **[Browser Fundamentals](./03-frontend-engineering/browser-fundamentals/)**
  - [ ] URL에서 렌더링까지
  - [ ] Critical Rendering Path
  - [ ] DOM/CSSOM
  - [ ] Reflow/Repaint
  - [ ] 합성과 GPU
  - [ ] 브라우저 저장소 (Cookie/LocalStorage/SessionStorage)
  - [ ] JWT 저장 보안 고려사항
  - [ ] CORS 동작 원리
  - [ ] QnA 복습 완료

- [ ] **[JavaScript Deep Dive](./03-frontend-engineering/javascript-deep-dive/)**
  - [ ] 실행 컨텍스트
  - [ ] 호이스팅과 TDZ
  - [ ] 클로저
  - [ ] this 바인딩 규칙
  - [ ] 이벤트 루프
  - [ ] Microtask/Macrotask
  - [ ] Promise/async-await
  - [ ] 제너레이터 함수
  - [ ] var/let/const 차이와 스코프
  - [ ] 데이터 타입 (원시/참조)
  - [ ] 프로토타입과 프로토타입 체인
  - [ ] ES6 클래스
  - [ ] 이벤트 전파 (버블링/캡처링/위임)
  - [ ] 디바운스와 쓰로틀
  - [ ] 가비지 컬렉션
  - [ ] 고차 함수와 함수형 프로그래밍
  - [ ] Map/Set
  - [ ] ES Modules vs CommonJS
  - [ ] 에러 처리 (try/catch)
  - [ ] REST API 기초
  - [ ] QnA 복습 완료

- [ ] **[React Architecture](./03-frontend-engineering/react-architecture/)**
  - [ ] Virtual DOM
  - [ ] 재조정(Reconciliation)
  - [ ] Fiber 아키텍처
  - [ ] Hooks 활용 (useMemo, useCallback, useRef)
  - [ ] useEffect vs useLayoutEffect
  - [ ] key와 리스트 렌더링
  - [ ] 제어 컴포넌트 vs 비제어 컴포넌트
  - [ ] State 불변성과 성능 최적화
  - [ ] 함수 컴포넌트 vs 클래스 컴포넌트
  - [ ] 상태 관리 (Redux, Zustand, React Query)
  - [ ] FLUX 패턴
  - [ ] 컴포넌트 라이프사이클
  - [ ] 리렌더링 조건
  - [ ] SPA / SSR / SEO
  - [ ] Suspense
  - [ ] QnA 복습 완료

- [ ] **[Next.js Rendering](./03-frontend-engineering/nextjs-rendering/)**
  - [ ] CSR/SSR/SSG/ISR
  - [ ] Hydration
  - [ ] React Server Components
  - [ ] App Router vs Pages Router
  - [ ] Next.js 캐싱
  - [ ] Streaming SSR
  - [ ] QnA 복습 완료

- [ ] **[HTML/CSS](./03-frontend-engineering/html-css/)**
  - [ ] DOCTYPE, meta 태그
  - [ ] 웹 표준 및 웹 접근성
  - [ ] 시멘틱 태그와 SEO
  - [ ] 크로스 브라우징과 SVG
  - [ ] CSS display, position, float
  - [ ] display:none vs visibility:hidden
  - [ ] Flexbox vs Grid
  - [ ] 반응형 웹 vs 적응형 웹 (미디어 쿼리, em/rem)
  - [ ] CSS 명시도
  - [ ] CSS-in-JS, CSS 전처리기
  - [ ] 박스 모델
  - [ ] QnA 복습 완료

- [ ] **[TypeScript](./03-frontend-engineering/typescript/)**
  - [ ] TypeScript 사용 이유
  - [ ] Type vs Interface
  - [ ] any vs unknown vs never
  - [ ] Utility Types
  - [ ] 제네릭
  - [ ] 타입 가드
  - [ ] QnA 복습 완료

- [ ] **[Build Tools](./03-frontend-engineering/build-tools/)**
  - [ ] 모듈 번들링
  - [ ] Webpack (entry/output/loader/plugin)
  - [ ] Babel 트랜스파일링
  - [ ] 트리 쉐이킹
  - [ ] QnA 복습 완료

- [ ] **[Frontend Architecture](./03-frontend-engineering/frontend-architecture/)**
  - [ ] Monolithic vs MSA vs BFF
  - [ ] 상태 관리 전략 (서버/클라이언트/로컬)
  - [ ] 폴더 구조 설계
  - [ ] 컴포넌트 설계 원칙
  - [ ] 의존성 방향과 관심사 분리
  - [ ] QnA 복습 완료

---

### [04. Design Patterns (디자인 패턴)](./04-design-patterns/)

- [ ] 생성 패턴 (Singleton, Factory, Builder)
- [ ] 구조 패턴 (Decorator, Facade, Bridge)
- [ ] 행동 패턴 (Observer, Strategy)
- [ ] 아키텍처 패턴 (MVC, MVP/MVVM 비교)
- [ ] QnA 복습 완료

---

### [05. API Design (API 설계)](./05-api-design/)

- [ ] REST API 설계 원칙
- [ ] GraphQL 기초
- [ ] API 버저닝
- [ ] 페이지네이션 (Offset vs Cursor)
- [ ] Rate Limiting
- [ ] QnA 복습 완료

---

### [06. Software Engineering (소프트웨어 공학)](./06-software-engineering/)

- [ ] 애자일/스크럼
- [ ] 코드 리뷰
- [ ] TDD (Red-Green-Refactor 사이클)
- [ ] 테스트 전략 (단위/통합/E2E/시스템/인수)
- [ ] 테스트 코드 작성 이유
- [ ] 테스트 커버리지
- [ ] CI/CD 개념과 이점
- [ ] KISS, YAGNI, DRY 원칙
- [ ] 브룩스의 법칙
- [ ] 클린 코드 & 리팩토링
- [ ] 함수형 프로그래밍 (순수 함수, 불변성, 고차 함수)
- [ ] MSA vs 모놀리식 아키텍처
- [ ] QnA 복습 완료

> CI/CD 심화 내용(배포 전략, GitHub Actions, GitOps)은 [10. Cloud Engineering](./10-cloud-engineering/devops-cicd/)의 DevOps & CI/CD에서 다룹니다.

---

### [07. Version Control (버전 관리)](./07-version-control/)

- [ ] Git 기본 개념과 명령어 (영역, .git 구조)
- [ ] Merge vs Rebase
- [ ] 충돌(Conflict) 발생 원인과 해결 방법
- [ ] git reset vs git revert
- [ ] 브랜칭 전략
- [ ] Git Flow vs GitHub Flow
- [ ] QnA 복습 완료

---

### [08. Security (보안)](./08-security/)

- [ ] XSS, CSRF, SQL Injection
- [ ] CORS와 Same-Origin Policy
- [ ] HTTPS/TLS
- [ ] 암호화 (대칭키/비대칭키)
- [ ] 해시 함수와 비밀번호 저장
- [ ] JWT 구조와 인증 흐름
- [ ] OAuth 2.0과 JWT/OAuth 차이
- [ ] QnA 복습 완료

> JWT/OAuth는 [02. Backend Engineering의 Authentication](./02-backend-engineering/authentication/)과 연계하여 학습하세요.

---

### [09. System Design (시스템 설계)](./09-system-design/)

- [ ] **[Caching (캐싱)](./09-system-design/caching/)**
  - [ ] 캐싱 전략
  - [ ] CDN
  - [ ] QnA 복습 완료

- [ ] **[Scalability (확장성)](./09-system-design/scalability/)**
  - [ ] CAP 정리
  - [ ] 로드밸런싱
  - [ ] 샤딩
  - [ ] QnA 복습 완료

- [ ] **[Performance (성능)](./09-system-design/performance/)**
  - [ ] 성능 최적화 기법
  - [ ] 병목 지점 분석
  - [ ] 웹 성능 (Core Web Vitals, 프론트엔드 최적화, CDN, Cache-Control/ETag)
  - [ ] QnA 복습 완료

- [ ] **[Infrastructure (인프라)](./09-system-design/qna-infrastructure.md)**
  - [ ] 로드밸런서 (L4/L7)
  - [ ] 무중단 배포 (Rolling, Blue-Green, Canary)
  - [ ] 대용량 트래픽 대응
  - [ ] QnA 복습 완료

> 배포 전략의 실무 심화 내용은 [10. Cloud Engineering](./10-cloud-engineering/devops-cicd/)의 DevOps & CI/CD를 참고하세요.

---

### [10. Cloud Engineering (클라우드 엔지니어링)](./10-cloud-engineering/)

- [ ] **[Cloud Fundamentals (클라우드 기초)](./10-cloud-engineering/cloud-fundamentals/)**
  - [ ] IaaS/PaaS/SaaS
  - [ ] Public/Private/Hybrid Cloud
  - [ ] 가상화와 Hypervisor (Type 1/Type 2)
  - [ ] VM vs Container
  - [ ] Scale-up vs Scale-out과 고가용성(HA)
  - [ ] QnA 복습 완료

- [ ] **[Containerization (컨테이너화)](./10-cloud-engineering/containerization/)**
  - [ ] **[Docker](./10-cloud-engineering/containerization/docker/)**
    - [ ] 컨테이너 기본 개념
    - [ ] 이미지와 레이어
    - [ ] Dockerfile 작성
    - [ ] Docker Compose
    - [ ] 네트워킹
    - [ ] Volume과 데이터 영속성
    - [ ] QnA 복습 완료

- [ ] **[AWS](./10-cloud-engineering/aws/)**
  - [ ] VPC/Subnet 설계
  - [ ] Security Group vs NACL
  - [ ] EC2 Auto Scaling
  - [ ] Lambda
  - [ ] S3 버킷 정책 vs IAM 정책
  - [ ] 비용 최적화 (Spot/Reserved Instance)
  - [ ] QnA 복습 완료

- [ ] **[Kubernetes](./10-cloud-engineering/kubernetes/)**
  - [ ] Pod, Service, Deployment
  - [ ] StatefulSet vs Deployment
  - [ ] ConfigMap/Secret
  - [ ] Ingress
  - [ ] 트러블슈팅
  - [ ] QnA 복습 완료

- [ ] **[DevOps & CI/CD](./10-cloud-engineering/devops-cicd/)**
  - [ ] CI/CD 개념
  - [ ] 배포 전략 (Blue-Green, Canary, Rolling)
  - [ ] 파이프라인 테스트 전략
  - [ ] 롤백 전략
  - [ ] GitHub Actions/Jenkins
  - [ ] GitOps (ArgoCD)
  - [ ] IaC (Terraform)
  - [ ] QnA 복습 완료

- [ ] **[Monitoring & Observability](./10-cloud-engineering/monitoring-observability/)**
  - [ ] Logs, Metrics, Traces
  - [ ] Prometheus/Grafana
  - [ ] 로그 수집 (ELK, Loki)
  - [ ] 분산 추적 (Jaeger, OpenTelemetry)
  - [ ] SLI/SLO/SLA
  - [ ] 알림 설계
  - [ ] 장애 대응 프로세스 (On-call, Postmortem)
  - [ ] QnA 복습 완료

- [ ] **[Linux & Networking](./10-cloud-engineering/linux-networking/)**
  - [ ] 파일 권한 (chmod)
  - [ ] 프로세스 관리 (ps, top, kill)
  - [ ] 시스템 리소스 모니터링 (top, vmstat, iostat)
  - [ ] 로그 파일 분석 (journalctl, grep/awk)
  - [ ] 네트워크 명령어 (netstat, curl, tcpdump)
  - [ ] SSH 키 인증
  - [ ] 방화벽 (iptables, firewalld)
  - [ ] QnA 복습 완료

- [ ] **[Practical Scenarios (실전 시나리오)](./10-cloud-engineering/practical-scenarios/)**
  - [ ] 트러블슈팅 경험 정리
  - [ ] 시스템 설계 면접 준비
  - [ ] 행동 면접 (STAR) 답변 준비
  - [ ] QnA 복습 완료

---

### [11. Data Engineering (데이터 엔지니어링)](./11-data-engineering/)

- [ ] **데이터 파이프라인**
  - [ ] ETL vs ELT
  - [ ] 파이프라인 구성 요소

- [ ] **Apache Airflow**
  - [ ] DAG, Operator, 스케줄링
  - [ ] 멱등성과 백필(Backfill)

- [ ] **Apache Kafka**
  - [ ] Topic/Partition/Consumer Group
  - [ ] 스트리밍, 전달 보장 (at-least-once 등)

- [ ] **Apache Spark**
  - [ ] RDD/DataFrame, 분산 처리
  - [ ] 지연 실행(Lazy Evaluation), Spark vs MapReduce

- [ ] **배치 vs 스트리밍**
  - [ ] Lambda / Kappa 아키텍처
  - [ ] 데이터 레이크 vs 웨어하우스

- [ ] QnA 복습 완료

---

### [12. AI Engineering (AI 엔지니어링)](./12-ai-engineering/)

- [ ] **[ML Fundamentals](./12-ai-engineering/ml-fundamentals/)**
  - [ ] 과적합/과소적합과 완화
  - [ ] 정규화 (L1/L2, Dropout)
  - [ ] 전이학습 (ResNet18)
  - [ ] 평가지표 (정밀도/재현율/F1/ROC-AUC)
  - [ ] 편향-분산 트레이드오프와 교차 검증 (K-Fold)
  - [ ] 설명가능 AI (SHAP/XAI)
  - [ ] QnA 복습 완료

- [ ] **[LLM Integration](./12-ai-engineering/llm-integration/)**
  - [ ] 프롬프트 엔지니어링
  - [ ] Temperature / Top-p 파라미터
  - [ ] 토큰과 비용 (컨텍스트 윈도우)
  - [ ] Fine-tuning vs RAG vs Prompt Engineering
  - [ ] 환각 완화 기법
  - [ ] LLM API 통합 고려사항 (에러 처리, 비용, 레이턴시)
  - [ ] QnA 복습 완료

- [ ] **[Vector Database](./12-ai-engineering/vector-database/)**
  - [ ] HNSW, IVF 알고리즘
  - [ ] FAISS 인덱스 (IndexFlatL2 등)
  - [ ] 유사도 측정 (코사인/L2/내적)
  - [ ] 메타데이터 필터링 (Pre/Post-filtering)
  - [ ] 벡터 DB 선택
  - [ ] QnA 복습 완료

- [ ] **[RAG Pipeline](./12-ai-engineering/rag-pipeline/)**
  - [ ] 청킹 전략
  - [ ] 임베딩
  - [ ] 검색 최적화
  - [ ] RAG 환각 완화 (Grounding)
  - [ ] RAG 평가 지표 (RAGAS)
  - [ ] QnA 복습 완료

- [ ] **[AI Agent / LangGraph](./12-ai-engineering/ai-agent/)**
  - [ ] AI Agent와 ReAct 루프
  - [ ] 에이전트 vs RAG vs 단순 LLM 호출 선택 기준
  - [ ] LangGraph State/Node/Edge
  - [ ] 조건부 분기 (add_conditional_edges)
  - [ ] Human-in-the-Loop (interrupt)
  - [ ] 무한 루프 방지 (recursion_limit)
  - [ ] 프롬프트 → 플로우 엔지니어링
  - [ ] AI 하네스 (Agent Harness)
  - [ ] BMAD Method
  - [ ] QnA 복습 완료

---

### [99. Practical Interview (실전 면접)](./99-practical-interview/)

- [ ] STAR 기법 이해
- [ ] 행동 면접 질문 준비
- [ ] 자기소개/지원동기 준비
- [ ] 프론트엔드 기업별 실전 면접 질문 복습 (JS/React/CS/CSS/포트폴리오)
- [ ] 프론트엔드 자가 진단 체크리스트 점검
- [ ] QnA 복습 완료

---

## 학습 로드맵

### 신입 개발자 (0-2년)

**필수 학습 순서:**
1. CS 기초 (OS, Network, Data Structure)
2. 직무별 기초 (Java/Spring 또는 JavaScript/React)
3. REST API 설계
4. Git 기본
5. 실전 면접 준비 (STAR 기법, 자기소개)

### 주니어 개발자 (2-4년)

**추가 학습:**
- 디자인 패턴 (Singleton, Factory, Observer)
- 시스템 설계 입문
- OOP & SOLID 원칙
- 보안 기초 (XSS, CSRF, HTTPS/TLS)
- Docker/Kubernetes 기초

### 시니어 개발자 (4년+)

**심화 학습:**
- 디자인 패턴 전체
- MSA, Event-Driven Architecture
- AI 통합 (RAG, Vector DB, AI Agent/LangGraph)
- 데이터 엔지니어링 (ETL, Airflow, Kafka, Spark)
- 클라우드 아키텍처 설계
- 모니터링/Observability

---

## QnA 파일 사용 방법

1. 질문을 먼저 읽고 스스로 답변해보세요
2. `<details>` 태그를 클릭하여 답변을 확인하세요
3. 부족한 부분은 개념 설명 파일(있는 경우)을 참고하세요

### 난이도 표시
- ⭐ (기본): 전공자 1-2학년 수준
- ⭐⭐ (중급): 전공자 3-4학년 수준
- ⭐⭐⭐ (고급): 주니어 현업 개발자 수준

---

## 카테고리별 학습 가이드

| 카테고리 | 대상 | 핵심 키워드 |
|---------|------|-----------|
| Computer Architecture | 공통 | CPU, 캐시, 고정/부동소수점, 패리티, ARM |
| OS | 공통 | 프로세스, 스레드, 메모리, 데드락, CPU 스케줄링, IPC |
| Network | 공통 | OSI, TCP/IP, HTTP/2, DNS, I/O 모델, WebSocket |
| Data Structure | 공통 | Array, LinkedList, HashMap, Heap, Trie, B-Tree |
| Algorithm | 공통 | 시간복잡도, 정렬, 탐색, DP, 비트마스크 |
| Java | 백엔드 | OOP, GC, Thread-safe, Exception |
| Spring | 백엔드 | IoC/DI, AOP, MVC, JPA |
| Database | 백엔드 | ACID, 정규화, 인덱스, NoSQL |
| Authentication | 백엔드 | Session, JWT, OAuth 2.0 |
| Browser | 프론트엔드 | CRP, DOM, 리플로우 |
| JavaScript | 프론트엔드 | 클로저, 이벤트 루프, 호이스팅, this |
| React | 프론트엔드 | Virtual DOM, Fiber, Hooks |
| Next.js | 프론트엔드 | SSR, SSG, RSC |
| HTML/CSS | 프론트엔드 | DOCTYPE, 시멘틱, Flexbox, Grid, 반응형, 명시도 |
| TypeScript | 프론트엔드 | Type, Interface, Generic, Utility Types |
| Build Tools | 프론트엔드 | Webpack, Babel, 번들링, 트리쉐이킹 |
| Frontend Architecture | 프론트엔드 | BFF, 상태관리, 의존성방향, 관심사분리 |
| Design Patterns | 공통 | 싱글톤, 팩토리, 옵저버, 전략, MVC/MVVM |
| API Design | 공통 | REST, GraphQL, 버저닝, 페이지네이션 |
| Software Engineering | 공통 | 애자일, 테스트/TDD, 클린코드, MSA |
| Version Control | 공통 | Git, 브랜칭, Merge/Rebase, Git Flow |
| Security | 공통 | XSS, CSRF, CORS, 암호화, 해시, JWT |
| System Design | 공통 | 캐싱, 확장성, 로드밸런싱, 샤딩, 무중단 배포 |
| Cloud | DevOps | Docker, K8s, CI/CD, AWS |
| Data Engineering | AI/데이터 | ETL, Airflow, Kafka, Spark |
| ML Fundamentals | AI/데이터 | 과적합, 정규화, 평가지표, XAI |
| AI Engineering | AI/데이터 | RAG, 임베딩, 벡터DB, FAISS, 환각완화 |
| AI Agent | AI/데이터 | LangGraph, ReAct, 하네스, BMAD, 플로우엔지니어링 |
| Practical Interview | 공통 | STAR 기법, 행동 면접, 기업별 실전 질문 |

---

## 참고 자료

- 백엔드 CS, Spring, AI 면접 질문 정리.pdf (외부 자료, 저장소 미포함)
- 프론트엔드 개발자 면접 질문 정리.pdf (외부 자료, 저장소 미포함)
- [brave-tech-interview](https://github.com/brave-people/brave-tech-interview) - 용감한 사람들의 기술 면접 질문 모음
- [backend-interview-question](https://github.com/ksundong/backend-interview-question) - 백엔드 개발자 면접 질문 모음
- [tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer) - 신입 개발자 전공 지식 & 기술 면접 백과사전 (컴퓨터 구조, CPU 스케줄링, IPC, 파일 시스템, 페이징/세그멘테이션, SQL JOIN, 이상현상, I/O 모델, 비트마스크, Radix Sort, Trie, B-Tree, 클린 코드, 함수형 프로그래밍, MSA 내용 참고)
