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

---

## Q8. Bean Scope의 종류와 차이점을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| Scope | 설명 | 생명주기 |
|-------|------|---------|
| singleton | 하나의 인스턴스 공유 (기본값) | 컨테이너와 동일 |
| prototype | 요청마다 새 인스턴스 | 컨테이너가 관리 X |
| request | HTTP 요청마다 | 요청 시작~종료 |
| session | HTTP 세션마다 | 세션 시작~종료 |
| application | ServletContext마다 | 애플리케이션 생명주기 |

### Singleton vs Prototype

```java
@Component
@Scope("singleton")  // 기본값, 생략 가능
public class SingletonBean {}

@Component
@Scope("prototype")
public class PrototypeBean {}
```

```java
// Singleton: 항상 같은 인스턴스
singletonBean1 == singletonBean2  // true

// Prototype: 매번 새 인스턴스
prototypeBean1 == prototypeBean2  // false
```

### Prototype 주의사항

```java
@Component
public class SingletonService {
    @Autowired
    private PrototypeBean prototypeBean;  // 주입 시점에 1번만 생성!

    // 해결: ObjectProvider 사용
    @Autowired
    private ObjectProvider<PrototypeBean> provider;

    public void logic() {
        PrototypeBean bean = provider.getObject();  // 매번 새로 생성
    }
}
```

### 면접관이 주목하는 포인트
- Singleton에서 상태를 가지면 안 되는 이유
- Prototype Bean의 생명주기 관리 문제

</details>

---

## Q9. @Autowired의 동작 원리를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
@Autowired는 **타입을 기준으로 빈을 자동 주입**합니다. 같은 타입이 여러 개면 이름으로 구분합니다.

### 주입 순서

```
1. 타입 매칭 → 하나면 주입
2. 타입이 여러 개 → 필드/파라미터 이름으로 매칭
3. @Qualifier로 명시적 지정
4. @Primary로 우선순위 지정
```

### 동일 타입 여러 빈 처리

```java
// 방법 1: @Qualifier
@Autowired
@Qualifier("mainDataSource")
private DataSource dataSource;

// 방법 2: @Primary
@Bean
@Primary
public DataSource mainDataSource() { ... }

// 방법 3: 필드명 매칭
@Autowired
private DataSource mainDataSource;  // 빈 이름과 동일
```

### 필수 여부 설정

```java
@Autowired(required = false)  // 빈이 없어도 에러 X
private Optional<SomeBean> optionalBean;  // 또는 Optional 사용
```

### 면접관이 주목하는 포인트
- 생성자 주입에서 @Autowired 생략 가능 (단일 생성자)
- 순환 참조 발생 시 동작

</details>

---

## Q10. DispatcherServlet의 역할은 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
DispatcherServlet은 **Spring MVC의 프론트 컨트롤러**로, 모든 요청을 받아 적절한 컨트롤러에 위임합니다.

### 프론트 컨트롤러 패턴

```
       ┌──────────────────────┐
       │   DispatcherServlet   │  ← 모든 요청의 진입점
       └──────────┬───────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
Controller1  Controller2  Controller3
```

### 처리 흐름

```
1. 클라이언트 요청
       ↓
2. DispatcherServlet 수신
       ↓
3. HandlerMapping: 어떤 컨트롤러?
       ↓
4. HandlerAdapter: 컨트롤러 실행
       ↓
5. Controller: 비즈니스 로직 + ModelAndView 반환
       ↓
6. ViewResolver: View 객체 조회
       ↓
7. View: 렌더링
       ↓
8. 클라이언트 응답
```

### 주요 구성요소

| 구성요소 | 역할 |
|---------|------|
| HandlerMapping | URL → Controller 매핑 |
| HandlerAdapter | Controller 실행 |
| ViewResolver | View 이름 → View 객체 |
| HandlerExceptionResolver | 예외 처리 |

### 면접관이 주목하는 포인트
- 프론트 컨트롤러 패턴의 장점
- @RestController의 동작 (ViewResolver 생략)

</details>

---

## Q11. Filter와 Interceptor의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Filter | Interceptor |
|------|--------|-------------|
| 소속 | 서블릿 컨테이너 | 스프링 컨테이너 |
| 실행 시점 | DispatcherServlet 전/후 | Controller 전/후 |
| Spring Bean | 접근 어려움 | 접근 용이 |
| 용도 | 인코딩, 보안, 로깅 | 인증/인가, 로깅, 공통 로직 |

### 실행 순서

```
요청 → Filter → DispatcherServlet → Interceptor → Controller
                                               ↓
응답 ← Filter ← DispatcherServlet ← Interceptor ←
```

### 구현 예시

```java
// Filter
@Component
public class LogFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {
        log.info("Filter 시작");
        chain.doFilter(req, res);
        log.info("Filter 종료");
    }
}

// Interceptor
@Component
public class LogInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                             Object handler) {
        log.info("Interceptor preHandle");
        return true;  // true: 진행, false: 중단
    }

    @Override
    public void postHandle(...) { }

    @Override
    public void afterCompletion(...) { }
}
```

### 선택 기준
- **Filter**: 모든 요청에 적용, Spring 무관한 처리
- **Interceptor**: Spring 빈 활용, 컨트롤러 전후 처리

### 면접관이 주목하는 포인트
- 예외 발생 시 동작 차이
- 실무에서의 선택 기준

</details>

---

## Q12. POJO란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
POJO(Plain Old Java Object)는 **특정 기술에 종속되지 않는 순수 자바 객체**입니다.

### POJO vs Non-POJO

```java
// POJO - 순수 자바 객체
public class User {
    private String name;
    private int age;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

// Non-POJO - 특정 기술 종속
public class UserServlet extends HttpServlet {
    // HttpServlet 상속 → 서블릿 컨테이너에 종속
}

public class UserEJB extends EJBObject {
    // EJB 상속 → EJB 컨테이너에 종속
}
```

### POJO의 장점
1. **테스트 용이**: 컨테이너 없이 테스트 가능
2. **유연성**: 기술 변경에 유연
3. **재사용성**: 다른 환경에서도 사용 가능

### Spring과 POJO
- Spring은 POJO 기반 개발 지향
- 어노테이션으로 설정 → 코드 자체는 POJO 유지

```java
@Service  // Spring 어노테이션이지만
public class UserService {  // 클래스 자체는 POJO
    public User findUser(Long id) { ... }
}
```

### 면접관이 주목하는 포인트
- POJO 기반 개발의 이점
- Spring이 POJO를 유지하면서 기능을 제공하는 방법 (AOP, DI)

</details>

---

## Q13. Spring에서 CORS 에러를 해결하는 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Spring에서 CORS를 해결하는 방법은 **@CrossOrigin, WebMvcConfigurer, Filter** 세 가지가 있습니다.

### 방법 1: @CrossOrigin 어노테이션

```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @CrossOrigin(origins = "*", maxAge = 3600)
    @GetMapping("/users")
    public List<User> getUsers() { ... }
}
```

### 방법 2: WebMvcConfigurer (전역 설정)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 방법 3: CorsFilter

```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOrigin("http://localhost:3000");
    config.addAllowedMethod("*");
    config.addAllowedHeader("*");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}
```

### 선택 기준

| 방법 | 사용 시점 |
|------|---------|
| @CrossOrigin | 특정 컨트롤러/메서드만 |
| WebMvcConfigurer | 전역 설정, Spring MVC |
| CorsFilter | Spring Security와 함께 |

### 면접관이 주목하는 포인트
- Preflight 요청 처리
- Spring Security와 CORS 설정

</details>

---

## Q14. 애플리케이션 구동 시 특정 메서드를 실행하는 방법은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Spring Boot에서 구동 시 코드를 실행하는 방법은 **@PostConstruct, ApplicationRunner, CommandLineRunner, EventListener** 등이 있습니다.

### 방법 비교

| 방법 | 실행 시점 | 특징 |
|------|----------|------|
| @PostConstruct | 빈 초기화 후 | 의존성 주입 완료 후 |
| CommandLineRunner | 애플리케이션 시작 후 | args 전달받음 |
| ApplicationRunner | 애플리케이션 시작 후 | ApplicationArguments |
| @EventListener | 이벤트 발생 시 | 다양한 이벤트 처리 |

### 구현 예시

```java
// 1. @PostConstruct
@Component
public class InitService {
    @PostConstruct
    public void init() {
        log.info("빈 초기화 완료 후 실행");
    }
}

// 2. CommandLineRunner
@Component
public class DataInitRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        log.info("애플리케이션 시작 후 실행");
    }
}

// 3. ApplicationRunner
@Component
public class AppRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        log.info("옵션: " + args.getOptionNames());
    }
}

// 4. EventListener
@Component
public class StartupListener {
    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        log.info("애플리케이션 준비 완료");
    }
}
```

### 실행 순서
```
@PostConstruct → CommandLineRunner/ApplicationRunner → ApplicationReadyEvent
```

### 면접관이 주목하는 포인트
- 초기 데이터 로딩, 캐시 워밍 사례
- 실패 시 애플리케이션 시작 중단 여부

</details>

---

## Q15. 생성자 주입을 권장하는 이유는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
생성자 주입은 **불변성, 테스트 용이성, 순환 참조 방지** 때문에 권장됩니다.

### 주입 방식 비교

```java
// 1. 생성자 주입 (권장)
@Service
public class UserService {
    private final UserRepository userRepository;  // final 가능

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 2. 필드 주입 (비권장)
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // final 불가
}

// 3. Setter 주입
@Service
public class UserService {
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository repo) {
        this.userRepository = repo;
    }
}
```

### 생성자 주입의 장점

| 장점 | 설명 |
|------|------|
| 불변성 | final 선언으로 변경 방지 |
| 테스트 용이 | Mock 객체 주입 쉬움 |
| 순환 참조 방지 | 컴파일 타임에 발견 |
| NPE 방지 | 주입 누락 시 컴파일 에러 |

### 순환 참조 예시

```java
// 생성자 주입: 애플리케이션 시작 시 에러
@Service
public class AService {
    public AService(BService bService) {}  // B 필요
}

@Service
public class BService {
    public BService(AService aService) {}  // A 필요
}
// → BeanCurrentlyInCreationException (시작 시 발견)

// 필드 주입: 런타임에 발견
// → StackOverflowError (호출 시 발견)
```

### Lombok 활용

```java
@Service
@RequiredArgsConstructor  // final 필드 생성자 자동 생성
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
}
```

### 면접관이 주목하는 포인트
- 순환 참조 해결 방법
- @RequiredArgsConstructor 활용

</details>

---

## 학습 체크리스트

- [ ] IoC/DI 개념과 생성자 주입 권장 이유 설명 가능
- [ ] AOP 프록시 동작 원리 이해
- [ ] @Transactional Self-Invocation 문제 해결 방법 알기
- [ ] Spring MVC 요청 흐름 그릴 수 있음
- [ ] Spring vs Spring Boot 차이 설명 가능
- [ ] Bean 생명주기와 Scope 이해
- [ ] Bean Scope 종류와 Prototype 주의사항 알기
- [ ] @Autowired 동작 원리와 우선순위 이해
- [ ] DispatcherServlet 역할 설명 가능
- [ ] Filter와 Interceptor 차이 설명 가능
- [ ] POJO 개념 이해
- [ ] CORS 해결 방법 알기
- [ ] 애플리케이션 구동 시 초기화 방법 알기
