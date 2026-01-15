# 디자인 패턴 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 싱글톤(Singleton) 패턴이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
싱글톤은 **클래스의 인스턴스가 하나만 존재**하도록 보장하고, 전역 접근점을 제공하는 패턴입니다.

### 구현 예시 (Java)

```java
// Thread-safe Singleton
public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### 사용 사례
- 설정 관리자
- 커넥션 풀
- 로깅

### 단점
- 테스트 어려움 (전역 상태)
- 결합도 증가
- 멀티스레드 주의

### 면접관이 주목하는 포인트
- Double-checked locking 이해
- 싱글톤의 문제점 인식

</details>

---

## Q2. 팩토리(Factory) 패턴이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
팩토리 패턴은 **객체 생성 로직을 캡슐화**하여 클라이언트가 구체 클래스를 알 필요 없이 객체를 생성하게 합니다.

### Factory Method vs Abstract Factory

| 구분 | Factory Method | Abstract Factory |
|------|---------------|------------------|
| 목적 | 단일 객체 생성 | 관련 객체 군 생성 |
| 확장 | 서브클래스로 | 새 팩토리 추가 |

### Factory Method 예시

```java
interface Animal { void speak(); }
class Dog implements Animal { public void speak() { System.out.println("멍멍"); } }
class Cat implements Animal { public void speak() { System.out.println("야옹"); } }

class AnimalFactory {
    public static Animal create(String type) {
        return switch (type) {
            case "dog" -> new Dog();
            case "cat" -> new Cat();
            default -> throw new IllegalArgumentException();
        };
    }
}

// 사용
Animal animal = AnimalFactory.create("dog");
```

### 면접관이 주목하는 포인트
- 팩토리 패턴의 이점
- 실제 사용 경험

</details>

---

## Q3. 전략(Strategy) 패턴이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
전략 패턴은 **알고리즘을 캡슐화**하여 런타임에 교체 가능하게 합니다.

### 예시

```java
interface PaymentStrategy {
    void pay(int amount);
}

class CreditCardPayment implements PaymentStrategy {
    public void pay(int amount) {
        System.out.println("카드 결제: " + amount);
    }
}

class PayPalPayment implements PaymentStrategy {
    public void pay(int amount) {
        System.out.println("PayPal 결제: " + amount);
    }
}

class ShoppingCart {
    private PaymentStrategy strategy;

    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void checkout(int amount) {
        strategy.pay(amount);
    }
}
```

### 사용 사례
- 결제 방식 선택
- 정렬 알고리즘 선택
- 압축 알고리즘 선택

</details>

---

## Q4. 옵저버(Observer) 패턴이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
옵저버 패턴은 **객체 상태 변화 시 의존 객체들에게 자동 통지**하는 패턴입니다.

### 예시

```java
interface Observer {
    void update(String message);
}

class Subject {
    private List<Observer> observers = new ArrayList<>();

    public void subscribe(Observer o) { observers.add(o); }
    public void unsubscribe(Observer o) { observers.remove(o); }

    public void notify(String message) {
        for (Observer o : observers) {
            o.update(message);
        }
    }
}
```

### 사용 사례
- 이벤트 시스템
- MVC의 Model-View
- 실시간 알림

</details>

---

## Q5. 데코레이터(Decorator) 패턴이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
데코레이터는 **객체에 동적으로 기능을 추가**하는 패턴입니다.

### 예시

```java
interface Coffee {
    String getDescription();
    double getCost();
}

class BasicCoffee implements Coffee {
    public String getDescription() { return "커피"; }
    public double getCost() { return 2.0; }
}

abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    public CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) { super(coffee); }
    public String getDescription() { return coffee.getDescription() + ", 우유"; }
    public double getCost() { return coffee.getCost() + 0.5; }
}

// 사용
Coffee coffee = new MilkDecorator(new BasicCoffee());
// "커피, 우유" - $2.5
```

### 사용 사례
- Java I/O (BufferedReader)
- 권한 검사 래퍼

</details>

---

## Q6. MVC 패턴이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
MVC는 애플리케이션을 **Model, View, Controller** 세 부분으로 분리하여 관심사를 분리하는 아키텍처 패턴입니다.

### 구성 요소

| 구성 요소 | 역할 | 예시 |
|---------|------|------|
| Model | 데이터, 비즈니스 로직 | Entity, Service |
| View | 사용자 인터페이스 | JSP, Thymeleaf, HTML |
| Controller | 요청 처리, 흐름 제어 | @Controller |

### 동작 흐름
```
1. 사용자 요청
       ↓
2. Controller (요청 분석)
       ↓
3. Model (비즈니스 로직)
       ↓
4. Controller (결과 전달)
       ↓
5. View (화면 렌더링)
       ↓
6. 사용자 응답
```

### Spring MVC 예시
```java
// Controller
@Controller
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/users/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);  // Model 조회
        model.addAttribute("user", user);       // View에 전달
        return "user/detail";                   // View 이름
    }
}

// Model (Service)
@Service
public class UserService {
    public User findById(Long id) {
        return userRepository.findById(id);
    }
}

// View (Thymeleaf)
<div th:text="${user.name}">사용자 이름</div>
```

### MVC 패턴의 장점
- **관심사 분리**: 각 부분이 독립적으로 개발/테스트 가능
- **유지보수성**: 코드 수정이 다른 부분에 영향 최소화
- **재사용성**: Model을 여러 View에서 사용 가능

### 변형 패턴

| 패턴 | 특징 |
|------|------|
| MVP | View와 Model 분리 (Presenter 중재) |
| MVVM | 데이터 바인딩 (ViewModel) |

### 면접관이 주목하는 포인트
- MVC 패턴을 사용하는 이유
- 실제 프로젝트에서의 적용 경험
- Spring MVC의 동작 흐름

</details>

---

---

## Q7. 빌더(Builder) 패턴이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
빌더 패턴은 **복잡한 객체를 단계별로 생성**할 수 있게 하는 패턴입니다. 생성자에 많은 파라미터가 필요할 때 가독성을 높입니다.

### 빌더 패턴이 필요한 경우

```java
// 문제: 생성자 파라미터가 많음
User user = new User("Kim", 25, "kim@email.com", "Seoul", "010-1234-5678", true, false);
// 어떤 값이 뭔지 알기 어려움

// 해결: 빌더 패턴
User user = User.builder()
    .name("Kim")
    .age(25)
    .email("kim@email.com")
    .address("Seoul")
    .phone("010-1234-5678")
    .verified(true)
    .premium(false)
    .build();
```

### 빌더 패턴 구현

```java
public class User {
    private final String name;
    private final int age;
    private final String email;

    private User(Builder builder) {
        this.name = builder.name;
        this.age = builder.age;
        this.email = builder.email;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private int age;
        private String email;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder age(int age) {
            this.age = age;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public User build() {
            return new User(this);
        }
    }
}
```

### Lombok @Builder

```java
@Builder
@Getter
public class User {
    private String name;
    private int age;
    private String email;
}

// 사용
User user = User.builder()
    .name("Kim")
    .age(25)
    .build();
```

### 빌더 패턴의 장점
1. **가독성**: 어떤 값인지 명확
2. **유연성**: 선택적 파라미터 처리 쉬움
3. **불변성**: final 필드 + private 생성자

### 면접관이 주목하는 포인트
- 점층적 생성자 패턴과의 비교
- @Builder 사용 시 주의사항

</details>

---

## Q8. 퍼사드(Facade) 패턴이란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
퍼사드 패턴은 **복잡한 서브시스템에 단순한 인터페이스를 제공**하는 패턴입니다. 클라이언트가 여러 클래스를 직접 다루지 않아도 됩니다.

### 구조

```
클라이언트
    │
    ▼
┌─────────────┐
│   Facade    │  ← 단순한 인터페이스
└──────┬──────┘
       │
  ┌────┼────┐
  ▼    ▼    ▼
┌───┐ ┌───┐ ┌───┐
│ A │ │ B │ │ C │  ← 복잡한 서브시스템
└───┘ └───┘ └───┘
```

### 예시: 주문 처리

```java
// 복잡한 서브시스템들
class InventoryService { void checkStock(Item item) { } }
class PaymentService { void processPayment(Payment payment) { } }
class ShippingService { void arrangeDelivery(Order order) { } }
class NotificationService { void sendConfirmation(Order order) { } }

// 클라이언트가 직접 호출하면 복잡
inventoryService.checkStock(item);
paymentService.processPayment(payment);
shippingService.arrangeDelivery(order);
notificationService.sendConfirmation(order);

// Facade로 단순화
public class OrderFacade {
    private InventoryService inventoryService;
    private PaymentService paymentService;
    private ShippingService shippingService;
    private NotificationService notificationService;

    public void placeOrder(Order order) {
        inventoryService.checkStock(order.getItem());
        paymentService.processPayment(order.getPayment());
        shippingService.arrangeDelivery(order);
        notificationService.sendConfirmation(order);
    }
}

// 클라이언트
orderFacade.placeOrder(order);  // 한 줄로 끝
```

### 퍼사드 패턴의 장점
1. **단순화**: 복잡한 시스템을 쉽게 사용
2. **결합도 감소**: 클라이언트와 서브시스템 분리
3. **유지보수**: 내부 변경이 클라이언트에 영향 없음

### 실무 활용
- **SDK/라이브러리 래핑**: 복잡한 API 단순화
- **레거시 시스템 통합**: 구 시스템에 새 인터페이스
- **서비스 통합**: 여러 마이크로서비스 조합

### 면접관이 주목하는 포인트
- 어댑터 패턴과의 차이
- 실무 적용 사례

</details>

---

## Q9. 브릿지(Bridge) 패턴이란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
브릿지 패턴은 **추상화와 구현을 분리**하여 독립적으로 확장할 수 있게 하는 패턴입니다.

### 문제 상황

```
Shape
├── RedCircle
├── BlueCircle
├── RedSquare
├── BlueSquare
└── ... (조합 폭발!)
```

### 브릿지 패턴 적용

```
Shape (추상화)           Color (구현)
├── Circle    ─────────►  ├── Red
├── Square                └── Blue
└── Triangle
```

### 구현 예시

```java
// 구현 인터페이스
interface Color {
    void applyColor();
}

class Red implements Color {
    public void applyColor() { System.out.println("빨강"); }
}

class Blue implements Color {
    public void applyColor() { System.out.println("파랑"); }
}

// 추상화
abstract class Shape {
    protected Color color;  // 브릿지: 구현체 참조

    public Shape(Color color) {
        this.color = color;
    }

    abstract void draw();
}

class Circle extends Shape {
    public Circle(Color color) { super(color); }

    void draw() {
        System.out.print("원을 ");
        color.applyColor();  // 색상은 위임
    }
}

// 사용
Shape redCircle = new Circle(new Red());
Shape blueCircle = new Circle(new Blue());
redCircle.draw();   // "원을 빨강"
blueCircle.draw();  // "원을 파랑"
```

### 브릿지 패턴의 장점
1. **독립적 확장**: 추상화와 구현을 각각 확장
2. **조합 폭발 방지**: n*m → n+m
3. **런타임 변경**: 구현체를 동적으로 교체

### 활용 사례
- **JDBC 드라이버**: Driver(추상화) + 각 DB별 구현
- **원격 제어**: RemoteControl + Device
- **플랫폼 독립적 GUI**: Window + WindowImpl(각 OS별)

### 면접관이 주목하는 포인트
- 전략 패턴과의 차이 (전략: 행위 교체, 브릿지: 구조 분리)
- 실무 적용 사례

</details>

---

## 학습 체크리스트

- [ ] 싱글톤 패턴과 주의사항 알기
- [ ] 팩토리 패턴 종류 비교 가능
- [ ] 전략 패턴 사용 사례 설명 가능
- [ ] 옵저버 패턴 동작 이해
- [ ] 데코레이터 패턴 예시 설명 가능
- [ ] MVC 패턴의 구성 요소와 역할 설명 가능
- [ ] 빌더 패턴 사용 이유와 구현 방법 알기
- [ ] 퍼사드 패턴 개념과 장점 이해
- [ ] 브릿지 패턴 구조 설명 가능
