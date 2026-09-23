# CS 면접 대비 학습 자료

> 백엔드/프론트엔드 개발자를 위한 체계적인 CS 면접 준비 가이드

## 학습 목표

- 컴퓨터 공학 기초 지식 습득
- 실무 프레임워크 심층 이해
- 기술 면접 대비 QnA 학습

---

## 이 저장소를 읽는 법

각 주제 폴더는 **세 겹**으로 되어 있습니다. 처음 배우는 주제라면 위에서 아래 순서로 읽으세요.

```
01-computer-science-fundamentals/operating-system/
├── README.md                ← ① 이 주제의 지도. 무엇을 어떤 순서로 볼지
├── 01-process-thread.md     ← ② 개념 설명. "왜 필요한가"부터 코드·그림까지
├── 02-memory-management.md
├── ...
└── qna-os.md                ← ③ 면접 질문 & 모범 답변
```

| 파일 | 역할 | 이럴 때 본다 |
|------|------|------------|
| `README.md` | 주제 지도, 학습 순서, 난이도 | 무엇부터 봐야 할지 모를 때 |
| `NN-*.md` | 개념 설명 (핵심) | 개념을 처음 배울 때, 알던 걸 다시 정리할 때 |
| `qna-*.md` | 면접 질문과 답변 | 학습 후 점검할 때, 면접 직전 복습할 때 |

**개념을 모르는 상태에서 QnA부터 보면 답을 외우게 됩니다.** 개념 설명 파일을 먼저 읽고,
QnA는 "내가 설명할 수 있는지" 확인하는 용도로 쓰세요.

### 다이어그램

시간축·상태 전이·계층 중첩처럼 글과 ASCII 그림으로는 잘 전달되지 않는 곳에는
SVG 다이어그램을 함께 두었습니다(`assets/diagrams/`). 기존 ASCII 다이어그램은
그대로 남아 있습니다 — 터미널이나 `git diff`에서는 그쪽이 읽히기 때문입니다.

### 개념 설명 파일의 구성

모든 개념 설명 파일은 같은 흐름을 따릅니다. 시간이 없다면 **1 → 5 → 6**만 봐도 됩니다.

1. **학습 목표 / 선행 지식** — 읽고 나면 무엇을 설명할 수 있는지, 먼저 알아야 할 것은 무엇인지
2. **왜 필요한가** — 이 기술이 없던 시절의 문제부터 출발
3. **동작 원리** — 코드 예제, ASCII 다이어그램, 비교표
4. **실무에서는** — 실제 서비스·프레임워크에서 어떻게 쓰이는지
5. **면접 포인트** — 예상 질문, 모범 답변, 꼬리 질문 대비
6. **자주 하는 실수** — 흔한 오해와 올바른 이해를 표로 대조
7. **한 줄 정리 / 연관 개념** — 다음에 읽을 문서로 연결

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
  - [ ] 파일 시스템 (접근 방식, 디렉터리 구조)
  - [ ] 페이징 vs 세그멘테이션
  - [ ] 32비트 vs 64비트
  - [ ] QnA 복습 완료

- [ ] **[Network (네트워크)](./01-computer-science-fundamentals/network/)**
  - [ ] OSI 7계층
  - [ ] TCP/IP
  - [ ] HTTP/HTTPS
  - [ ] HTTP 메서드와 HTTP/2
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
  - [ ] 디바운스와 스로틀
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
  - [ ] 시맨틱 태그와 SEO
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
  - [ ] 트리 셰이킹
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
- [ ] 클린 코드 & 리팩터링
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

1. 질문을 먼저 읽고 **소리 내어** 스스로 답변해보세요 (면접은 말로 하는 시험입니다)
2. `<details>` 태그를 클릭하여 답변을 확인하세요
3. 막히거나 어렴풋한 부분은 같은 폴더의 개념 설명 파일(`NN-*.md`)로 돌아가세요
4. 각 QnA에는 **꼬리 질문**이 함께 있습니다. 꼬리 질문까지 답할 수 있어야 그 주제를 안다고 할 수 있습니다

### ⭐ 표시

⭐는 쓰인 자리에 따라 뜻이 다릅니다.

- **QnA 파일의 질문 제목**: 빈출도입니다. ⭐가 많을수록 면접에서 자주 나오는 질문입니다.
- **폴더 README의 문서 표**: 난이도입니다.
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
| HTML/CSS | 프론트엔드 | DOCTYPE, 시맨틱, Flexbox, Grid, 반응형, 명시도 |
| TypeScript | 프론트엔드 | Type, Interface, Generic, Utility Types |
| Build Tools | 프론트엔드 | Webpack, Babel, 번들링, 트리셰이킹 |
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

## 개념 문서 색인

주제별 개념 설명 파일 전체 목록입니다. 각 폴더의 `README.md`에는 난이도와 권장 학습 순서가 함께 있습니다.

### 01. Computer Science 기초

| 폴더 | 개념 문서 |
|------|----------|
| `algorithm` | [시간 복잡도와 점근 표기법](./01-computer-science-fundamentals/algorithm/01-time-complexity.md) · [정렬 알고리즘](./01-computer-science-fundamentals/algorithm/02-sorting.md) · [탐색 알고리즘](./01-computer-science-fundamentals/algorithm/03-searching.md) |
| `computer-architecture` | [CPU와 명령어 사이클](./01-computer-science-fundamentals/computer-architecture/01-cpu-instruction-cycle.md) · [캐시 메모리와 메모리 계층](./01-computer-science-fundamentals/computer-architecture/02-cache-memory.md) · [수 표현 방식](./01-computer-science-fundamentals/computer-architecture/03-number-representation.md) · [오류 검출·정정과 프로세서 설계 철학](./01-computer-science-fundamentals/computer-architecture/04-error-detection-risc-cisc.md) |
| `data-structure` | [배열과 리스트](./01-computer-science-fundamentals/data-structure/01-array-list.md) · [스택과 큐](./01-computer-science-fundamentals/data-structure/02-stack-queue.md) · [트리와 그래프](./01-computer-science-fundamentals/data-structure/03-tree-graph.md) · [해시 테이블](./01-computer-science-fundamentals/data-structure/04-hash-table.md) |
| `network` | [OSI 7계층과 TCP/IP 4계층](./01-computer-science-fundamentals/network/01-osi-tcp-ip.md) · [HTTP와 HTTPS](./01-computer-science-fundamentals/network/02-http-https.md) · [TCP와 UDP](./01-computer-science-fundamentals/network/03-tcp-udp.md) · [DNS 이름 해석](./01-computer-science-fundamentals/network/04-dns-resolution.md) · [SSL/TLS 핸드셰이크](./01-computer-science-fundamentals/network/05-ssl-tls-handshake.md) |
| `operating-system` | [프로세스와 스레드](./01-computer-science-fundamentals/operating-system/01-process-thread.md) · [메모리 관리 전략: Stack vs Heap](./01-computer-science-fundamentals/operating-system/02-memory-management.md) · [컨텍스트 스위칭](./01-computer-science-fundamentals/operating-system/03-context-switching.md) · [교착 상태(Deadlock)와 경쟁 상태](./01-computer-science-fundamentals/operating-system/04-deadlock-race-condition.md) · [가상 메모리](./01-computer-science-fundamentals/operating-system/05-virtual-memory.md) · [CPU 스케줄링](./01-computer-science-fundamentals/operating-system/06-cpu-scheduling.md) · [프로세스 간 통신과 동기화](./01-computer-science-fundamentals/operating-system/07-ipc-synchronization.md) · [시스템 콜과 인터럽트](./01-computer-science-fundamentals/operating-system/08-system-call-interrupt.md) |

### 02. Backend Engineering

| 폴더 | 개념 문서 |
|------|----------|
| `authentication` | [세션 기반 인증](./02-backend-engineering/authentication/01-session-based.md) · [JWT 토큰](./02-backend-engineering/authentication/02-jwt-token.md) · [OAuth 2.0](./02-backend-engineering/authentication/03-oauth2.md) |
| `database` | [JPA와 ORM](./02-backend-engineering/database/01-jpa-orm.md) · [영속성 컨텍스트](./02-backend-engineering/database/02-persistence-context.md) · [N+1 문제](./02-backend-engineering/database/03-n-plus-one-problem.md) · [트랜잭션과 격리 수준](./02-backend-engineering/database/04-transaction-isolation.md) · [인덱싱과 B-Tree](./02-backend-engineering/database/05-indexing-btree.md) |
| `java-fundamentals` | [객체지향과 SOLID](./02-backend-engineering/java-fundamentals/01-oop-solid.md) · [Java 메모리 모델](./02-backend-engineering/java-fundamentals/02-memory-model.md) · [가비지 컬렉션](./02-backend-engineering/java-fundamentals/03-garbage-collection.md) · [Call by Value와 참조의 착시](./02-backend-engineering/java-fundamentals/04-call-by-value-reference.md) · [가상 스레드](./02-backend-engineering/java-fundamentals/05-java21-virtual-threads.md) |
| `spring-framework` | [IoC와 DI](./02-backend-engineering/spring-framework/01-ioc-di.md) · [AOP와 프록시](./02-backend-engineering/spring-framework/02-aop-proxy.md) · [Spring MVC 요청 처리 흐름](./02-backend-engineering/spring-framework/03-spring-mvc-flow.md) · [Bean 생명주기와 스코프](./02-backend-engineering/spring-framework/04-bean-lifecycle.md) · [Spring Boot 자동 설정](./02-backend-engineering/spring-framework/05-spring-boot-auto-config.md) · [@Transactional의 함정](./02-backend-engineering/spring-framework/06-transactional-pitfalls.md) |

### 03. Frontend Engineering

| 폴더 | 개념 문서 |
|------|----------|
| `browser-fundamentals` | [URL 입력부터 화면 렌더링까지](./03-frontend-engineering/browser-fundamentals/01-url-to-render.md) · [크리티컬 렌더링 패스](./03-frontend-engineering/browser-fundamentals/02-critical-rendering-path.md) · [DOM과 CSSOM](./03-frontend-engineering/browser-fundamentals/03-dom-cssom.md) · [리플로우와 리페인트](./03-frontend-engineering/browser-fundamentals/04-reflow-repaint.md) · [합성과 GPU 가속](./03-frontend-engineering/browser-fundamentals/05-compositing-gpu.md) |
| `build-tools` | [모듈 시스템과 번들링](./03-frontend-engineering/build-tools/01-module-bundling.md) · [Webpack과 Babel](./03-frontend-engineering/build-tools/02-webpack-babel.md) · [트리 셰이킹과 번들 최적화](./03-frontend-engineering/build-tools/03-tree-shaking-optimization.md) |
| `frontend-architecture` | [상태 관리 전략](./03-frontend-engineering/frontend-architecture/01-state-management.md) · [컴포넌트 설계](./03-frontend-engineering/frontend-architecture/02-component-design.md) · [프로젝트 구조와 경계](./03-frontend-engineering/frontend-architecture/03-project-structure.md) |
| `html-css` | [시맨틱 HTML과 웹 접근성](./03-frontend-engineering/html-css/01-semantic-html-a11y.md) · [CSS 레이아웃](./03-frontend-engineering/html-css/02-css-layout.md) · [반응형 웹과 CSS 캐스케이드](./03-frontend-engineering/html-css/03-responsive-specificity.md) |
| `javascript-deep-dive` | [실행 컨텍스트](./03-frontend-engineering/javascript-deep-dive/01-execution-context.md) · [호이스팅과 TDZ](./03-frontend-engineering/javascript-deep-dive/02-hoisting-tdz.md) · [클로저](./03-frontend-engineering/javascript-deep-dive/03-closure.md) · [이벤트 루프](./03-frontend-engineering/javascript-deep-dive/04-event-loop.md) · [마이크로태스크와 매크로태스크](./03-frontend-engineering/javascript-deep-dive/05-microtask-macrotask.md) · [Promise와 async/await](./03-frontend-engineering/javascript-deep-dive/06-promise-async-await.md) |
| `nextjs-rendering` | [렌더링 전략](./03-frontend-engineering/nextjs-rendering/01-csr-ssr-ssg-isr.md) · [하이드레이션](./03-frontend-engineering/nextjs-rendering/02-hydration.md) · [React Server Components](./03-frontend-engineering/nextjs-rendering/03-server-components.md) |
| `react-architecture` | [가상 DOM](./03-frontend-engineering/react-architecture/01-virtual-dom.md) · [재조정](./03-frontend-engineering/react-architecture/02-reconciliation.md) · [Fiber 아키텍처](./03-frontend-engineering/react-architecture/03-fiber-architecture.md) · [Hooks 내부 동작](./03-frontend-engineering/react-architecture/04-hooks-internals.md) · [useEffect와 useLayoutEffect](./03-frontend-engineering/react-architecture/05-useEffect-vs-useLayoutEffect.md) |
| `typescript` | [왜 타입인가 — TypeScript 타입 시스템의 출발점](./03-frontend-engineering/typescript/01-why-typescript-types.md) · [제네릭과 유틸리티 타입](./03-frontend-engineering/typescript/02-generics-utility-types.md) · [타입 가드와 좁히기](./03-frontend-engineering/typescript/03-type-guards-narrowing.md) |

### 04. Design Patterns

[생성 패턴](./04-design-patterns/01-creational-patterns.md) · [구조 패턴](./04-design-patterns/02-structural-patterns.md) · [행위 패턴](./04-design-patterns/03-behavioral-patterns.md) · [아키텍처 패턴](./04-design-patterns/04-architecture-patterns.md)

### 05. API Design

[REST API 설계](./05-api-design/01-rest-api-design.md) · [GraphQL 기초](./05-api-design/02-graphql-basics.md) · [API 버저닝과 페이지네이션](./05-api-design/03-versioning-pagination.md) · [Rate Limiting](./05-api-design/04-rate-limiting.md)

### 06. Software Engineering

[애자일 프로세스와 협업](./06-software-engineering/01-agile-process.md) · [테스트와 TDD](./06-software-engineering/02-testing-tdd.md) · [클린 코드와 리팩터링](./06-software-engineering/03-clean-code-refactoring.md) · [모놀리식과 마이크로서비스](./06-software-engineering/04-architecture-monolith-msa.md)

### 07. Version Control

[Git 내부 구조](./07-version-control/01-git-internals.md) · [병합, 리베이스, 충돌 해결](./07-version-control/02-merge-rebase-conflict.md) · [브랜치 전략과 협업 규칙](./07-version-control/03-branching-strategy.md)

### 08. Security

[웹 취약점과 방어](./08-security/01-web-vulnerabilities.md) · [동일 출처 정책과 CORS](./08-security/02-cors-same-origin.md) · [HTTPS와 TLS](./08-security/03-https-tls.md) · [암호화와 해싱](./08-security/04-cryptography-hashing.md)

### 09. System Design

| 폴더 | 개념 문서 |
|------|----------|
| `(공통)` | [로드 밸런서](./09-system-design/01-load-balancer.md) · [무중단 배포](./09-system-design/02-zero-downtime-deployment.md) · [대용량 트래픽 대응](./09-system-design/03-high-traffic.md) |
| `caching` | [캐싱 전략](./09-system-design/caching/01-caching-strategies.md) · [Redis와 CDN](./09-system-design/caching/02-redis-cdn.md) |
| `performance` | [성능 병목 분석과 최적화](./09-system-design/performance/01-performance-optimization.md) · [웹 성능 최적화](./09-system-design/performance/02-web-performance.md) |
| `scalability` | [CAP 정리와 일관성 모델](./09-system-design/scalability/01-cap-consistency.md) · [로드 밸런싱과 샤딩](./09-system-design/scalability/02-load-balancing-sharding.md) |

### 10. Cloud Engineering

| 폴더 | 개념 문서 |
|------|----------|
| `aws` | [AWS 핵심 서비스 지도](./10-cloud-engineering/aws/01-core-services.md) · [AWS 네트워킹](./10-cloud-engineering/aws/02-networking.md) · [서버리스와 AWS Lambda](./10-cloud-engineering/aws/03-serverless.md) · [IAM과 접근 제어](./10-cloud-engineering/aws/04-iam-security.md) · [AWS 비용 최적화](./10-cloud-engineering/aws/05-cost-optimization.md) |
| `cloud-fundamentals` | [클라우드 컴퓨팅 기초](./10-cloud-engineering/cloud-fundamentals/01-cloud-computing-basics.md) · [가상화와 하이퍼바이저](./10-cloud-engineering/cloud-fundamentals/02-virtualization-hypervisor.md) · [클라우드 배포 모델](./10-cloud-engineering/cloud-fundamentals/03-public-private-hybrid.md) · [확장성과 고가용성](./10-cloud-engineering/cloud-fundamentals/04-scalability-availability.md) |
| `containerization/docker` | [Docker 기초](./10-cloud-engineering/containerization/docker/01-docker-basics.md) · [Docker Compose](./10-cloud-engineering/containerization/docker/02-docker-compose.md) · [컨테이너 vs 가상 머신](./10-cloud-engineering/containerization/docker/03-container-vs-vm.md) |
| `devops-cicd` | [CI/CD 개념](./10-cloud-engineering/devops-cicd/01-cicd-concepts.md) · [파이프라인 도구](./10-cloud-engineering/devops-cicd/02-pipeline-tools.md) · [배포 전략](./10-cloud-engineering/devops-cicd/03-deployment-strategies.md) · [GitOps와 IaC](./10-cloud-engineering/devops-cicd/04-gitops.md) |
| `kubernetes` | [쿠버네티스 아키텍처와 핵심 개념](./10-cloud-engineering/kubernetes/01-architecture-concepts.md) · [워크로드 리소스와 배포 관리](./10-cloud-engineering/kubernetes/02-deployment-management.md) · [서비스와 네트워킹](./10-cloud-engineering/kubernetes/03-networking-service.md) · [설정과 스토리지](./10-cloud-engineering/kubernetes/04-config-storage.md) · [실전 트러블슈팅](./10-cloud-engineering/kubernetes/05-troubleshooting.md) |
| `linux-networking` | [리눅스 기본기](./10-cloud-engineering/linux-networking/01-linux-essentials.md) · [네트워크 진단 명령어](./10-cloud-engineering/linux-networking/02-networking-commands.md) · [서버 장애 트러블슈팅](./10-cloud-engineering/linux-networking/03-troubleshooting.md) · [셸 스크립팅](./10-cloud-engineering/linux-networking/04-shell-scripting.md) · [서버 보안 기초](./10-cloud-engineering/linux-networking/05-security-basics.md) |
| `monitoring-observability` | [관측성 개념](./10-cloud-engineering/monitoring-observability/01-observability-concepts.md) · [Prometheus와 Grafana](./10-cloud-engineering/monitoring-observability/02-prometheus-grafana.md) · [로깅 스택](./10-cloud-engineering/monitoring-observability/03-logging-stack.md) · [분산 트레이싱](./10-cloud-engineering/monitoring-observability/04-distributed-tracing.md) · [알림 설계와 On-call](./10-cloud-engineering/monitoring-observability/05-alerting-oncall.md) |
| `practical-scenarios` | [장애 대응 방법론](./10-cloud-engineering/practical-scenarios/01-troubleshooting-method.md) · [시스템 설계 면접](./10-cloud-engineering/practical-scenarios/02-system-design-interview.md) · [행동 면접과 STAR](./10-cloud-engineering/practical-scenarios/03-behavioral-star.md) |

### 11. Data Engineering

[데이터 파이프라인과 ETL/ELT](./11-data-engineering/01-etl-pipeline.md) · [Airflow와 워크플로우 오케스트레이션](./11-data-engineering/02-airflow.md) · [Kafka와 이벤트 스트리밍](./11-data-engineering/03-kafka.md) · [Spark와 분산 데이터 처리](./11-data-engineering/04-spark.md) · [배치 처리와 스트리밍 처리](./11-data-engineering/05-batch-vs-streaming.md)

### 12. AI Engineering

| 폴더 | 개념 문서 |
|------|----------|
| `ai-agent` | [AI 에이전트와 LangGraph](./12-ai-engineering/ai-agent/01-agent-langgraph.md) |
| `llm-integration` | [LLM 기초와 프롬프트 엔지니어링](./12-ai-engineering/llm-integration/01-llm-basics-prompting.md) · [환각과 프로덕션 통합](./12-ai-engineering/llm-integration/02-hallucination-integration.md) |
| `ml-fundamentals` | [과적합과 정규화](./12-ai-engineering/ml-fundamentals/01-overfitting-regularization.md) · [평가 지표와 교차 검증](./12-ai-engineering/ml-fundamentals/02-evaluation-metrics.md) · [전이학습과 설명 가능한 AI](./12-ai-engineering/ml-fundamentals/03-transfer-learning-xai.md) |
| `rag-pipeline` | [RAG 파이프라인](./12-ai-engineering/rag-pipeline/01-rag-pipeline.md) |
| `vector-database` | [벡터 검색](./12-ai-engineering/vector-database/01-vector-search.md) |

### 99. Practical Interview

[기술 면접 전략](./99-practical-interview/01-interview-strategy.md) · [자기소개와 지원 동기](./99-practical-interview/02-self-introduction.md) · [포트폴리오와 프로젝트 설명](./99-practical-interview/03-portfolio-project.md)

---
## 참고 자료

- 백엔드 CS, Spring, AI 면접 질문 정리.pdf (외부 자료, 저장소 미포함)
- 프론트엔드 개발자 면접 질문 정리.pdf (외부 자료, 저장소 미포함)
- [brave-tech-interview](https://github.com/brave-people/brave-tech-interview) - 용감한 사람들의 기술 면접 질문 모음
- [backend-interview-question](https://github.com/ksundong/backend-interview-question) - 백엔드 개발자 면접 질문 모음
- [tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer) - 신입 개발자 전공 지식 & 기술 면접 백과사전 (컴퓨터 구조, CPU 스케줄링, IPC, 파일 시스템, 페이징/세그멘테이션, SQL JOIN, 이상현상, I/O 모델, 비트마스크, Radix Sort, Trie, B-Tree, 클린 코드, 함수형 프로그래밍, MSA 내용 참고)
