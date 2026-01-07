# Spring Framework 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. IoC(제어의 역전)와 DI(의존성 주입)를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
- **IoC**: 객체의 생성과 생명주기 관리를 개발자가 아닌 Spring 컨테이너에 위임하는 것
- **DI**: IoC를 구현하는 패턴으로, 객체가 필요로 하는 의존성을 외부에서 주입받는 것

### 의존성 주입 방식 비교

| 방식 | 장점 | 단점 |
|------|------|------|
| **생성자 주입** | 불변성, 테스트 용이, 순환참조 방지 | 코드 길어짐 |
| 필드 주입 | 간편 | 테스트 어려움, 불변성 X |
| 세터 주입 | 선택적 의존성 | 런타임 변경 가능성 |

### 생성자 주입을 권장하는 이유
```java
@Service
public class UserService {
    private final UserRepository userRepository;  // final 선언 가능

    @Autowired  // 생성자가 하나면 생략 가능
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

1. **불변성**: final 선언으로 변경 방지
2. **테스트 용이**: Mock 객체 주입 쉬움
3. **순환 참조 방지**: 애플리케이션 시작 시 에러 발생

### 면접관이 주목하는 포인트
- 왜 생성자 주입을 권장하는지
- 순환 참조의 문제점과 해결 방법

</details>

---

## Q2. Spring AOP의 동작 원리를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
AOP는 횡단 관심사(로깅, 트랜잭션, 보안)를 분리하여 코드 중복을 줄이는 기술입니다. Spring AOP는 **프록시 패턴**을 기반으로 동작합니다.

### 프록시 방식

| 방식 | 조건 | 특징 |
|------|------|------|
| JDK Dynamic Proxy | 인터페이스 있음 | 리플렉션 사용 |
| CGLIB | 인터페이스 없음 | 바이트코드 조작, 상속 기반 |

Spring Boot 2.0+부터 기본적으로 **CGLIB** 사용

### 동작 흐름
```
Client → Proxy → Advice 실행 → Target 메서드 호출 → Advice 실행 → Client
```

### 주요 용어
- **Aspect**: 횡단 관심사 모듈 (@Aspect)
- **Advice**: 실제 부가 기능 (@Before, @After, @Around)
- **Pointcut**: 적용 대상 지정 (execution 표현식)
- **JoinPoint**: 적용 가능 지점 (메서드 실행)

### 면접관이 주목하는 포인트
- 프록시의 한계 (Self-Invocation 문제)
- @Transactional 동작 원리

</details>

---

## Q3. @Transactional의 동작 원리와 주의사항을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
@Transactional은 AOP 기반으로 동작하며, 프록시가 트랜잭션 시작/커밋/롤백을 관리합니다.

### Self-Invocation 문제

```java
@Service
public class OrderService {
    public void createOrder() {
        // @Transactional이 동작하지 않음!
        this.processPayment();  // 내부 호출
    }

    @Transactional
    public void processPayment() {
        // 트랜잭션 미적용
    }
}
```

### 원인
프록시는 **외부 호출**에서만 개입합니다. `this.method()`는 프록시를 거치지 않고 원본 객체를 직접 호출합니다.

### 해결 방법
1. 별도 클래스로 분리 (권장)
2. 자기 자신 주입 (비권장)
3. AopContext.currentProxy() 사용 (비권장)

### 전파 속성 (Propagation)

| 속성 | 설명 |
|------|------|
| REQUIRED (기본) | 부모 트랜잭션 있으면 참여, 없으면 새로 생성 |
| REQUIRES_NEW | 항상 새 트랜잭션 생성, 부모와 독립 |
| NESTED | 중첩 트랜잭션, 부모 롤백 시 함께 롤백 |

### REQUIRES_NEW 활용
```java
@Transactional
public void mainProcess() {
    // 메인 비즈니스 로직
    logService.saveLog();  // 로그 실패해도 메인 롤백 X
}

@Transactional(propagation = REQUIRES_NEW)
public void saveLog() {
    // 독립적인 트랜잭션
}
```

### 면접관이 주목하는 포인트
- Self-Invocation 문제 해결 경험
- 전파 속성 선택 기준

</details>

---

## Q4. Spring MVC의 요청 처리 흐름을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

```
1. Request → DispatcherServlet
2. HandlerMapping → Controller 조회
3. HandlerAdapter → Controller 실행
4. Controller → 비즈니스 로직, Model + View 반환
5. ViewResolver → View 객체 조회
6. View → 렌더링 후 Response
```

### 상세 흐름도
```
Client
   │
   ▼
┌──────────────────┐
│ DispatcherServlet │  ← Front Controller
└────────┬─────────┘
         │
   ┌─────┴─────┐
   ▼           ▼
HandlerMapping  HandlerAdapter
   │               │
   └───────┬───────┘
           ▼
       Controller
           │
           ▼
       ViewResolver
           │
           ▼
         View
           │
           ▼
        Client
```

### Filter vs Interceptor

| 구분 | Filter | Interceptor |
|------|--------|-------------|
| 관리 | 서블릿 컨테이너 | 스프링 컨테이너 |
| 범위 | 모든 요청 | 스프링 내부 |
| 용도 | 인코딩, 보안 | 인증/인가, 로깅 |

### 면접관이 주목하는 포인트
- 화이트보드에 그릴 수 있는지
- Filter와 Interceptor 선택 기준

</details>

---

## Q5. Spring과 Spring Boot의 차이점은 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Spring Boot는 Spring Framework를 쉽게 사용할 수 있도록 **자동 설정, 내장 WAS, Starter 의존성**을 제공합니다.

### 주요 차이점

| 구분 | Spring | Spring Boot |
|------|--------|-------------|
| 설정 | XML/Java Config | Auto Configuration |
| WAS | 외부 설치 필요 | 내장 (Tomcat 등) |
| 의존성 | 개별 관리 | Starter로 통합 |
| 배포 | WAR | JAR (java -jar) |

### Auto Configuration 원리
1. @EnableAutoConfiguration → spring.factories 참조
2. @ConditionalOnClass: 클래스패스에 특정 클래스 존재 시
3. @ConditionalOnMissingBean: 빈이 없을 때만 자동 등록

### 예시
```
H2 라이브러리가 클래스패스에 있으면
→ 자동으로 인메모리 DB 설정 구성
```

### 면접관이 주목하는 포인트
- Auto Configuration 동작 원리
- 조건부 빈 등록 이해

</details>

---

## Q6. Bean의 생명주기를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

```
1. 스프링 컨테이너 생성
2. 빈 인스턴스화
3. 의존성 주입
4. 초기화 콜백 (@PostConstruct)
5. 사용
6. 소멸 콜백 (@PreDestroy)
7. 스프링 종료
```

### 초기화/소멸 콜백 방법

| 방법 | 예시 |
|------|------|
| 어노테이션 | @PostConstruct, @PreDestroy |
| 인터페이스 | InitializingBean, DisposableBean |
| 설정 | @Bean(initMethod, destroyMethod) |

### 활용 사례
```java
@Component
public class ConnectionPool {
    @PostConstruct
    public void init() {
        // 커넥션 풀 초기화
    }

    @PreDestroy
    public void destroy() {
        // 커넥션 반환
    }
}
```

### Bean Scope

| Scope | 설명 |
|-------|------|
| singleton (기본) | 하나의 인스턴스 공유 |
| prototype | 요청마다 새 인스턴스 |
| request | HTTP 요청마다 |
| session | HTTP 세션마다 |

### 면접관이 주목하는 포인트
- Singleton의 무상태 설계 중요성
- 실제 초기화/소멸 활용 사례

</details>

---

## Q7. @Component와 @Bean의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | @Component | @Bean |
|------|------------|-------|
| 사용 위치 | 클래스 | 메서드 |
| 등록 방식 | 컴포넌트 스캔 | 수동 등록 |
| 용도 | 직접 작성한 클래스 | 외부 라이브러리 클래스 |

### 사용 예시
```java
// @Component: 직접 작성한 클래스
@Component
public class MyService { }

// @Bean: 외부 라이브러리 빈 등록
@Configuration
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```

### 면접관이 주목하는 포인트
- 언제 어떤 것을 사용하는지

</details>

---

## 학습 체크리스트

- [ ] IoC/DI 개념과 생성자 주입 권장 이유 설명 가능
- [ ] AOP 프록시 동작 원리 이해
- [ ] @Transactional Self-Invocation 문제 해결 방법 알기
- [ ] Spring MVC 요청 흐름 그릴 수 있음
- [ ] Spring vs Spring Boot 차이 설명 가능
- [ ] Bean 생명주기와 Scope 이해
