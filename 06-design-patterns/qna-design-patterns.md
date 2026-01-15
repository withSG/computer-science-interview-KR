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

## 학습 체크리스트

- [ ] 싱글톤 패턴과 주의사항 알기
- [ ] 팩토리 패턴 종류 비교 가능
- [ ] 전략 패턴 사용 사례 설명 가능
- [ ] 옵저버 패턴 동작 이해
- [ ] 데코레이터 패턴 예시 설명 가능
- [ ] MVC 패턴의 구성 요소와 역할 설명 가능
