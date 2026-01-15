# Java 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 객체 지향 프로그래밍(OOP)의 4가지 특성을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 특성 | 설명 |
|------|------|
| **캡슐화** | 데이터와 메서드를 하나로 묶고, 외부에 필요한 것만 공개 |
| **상속** | 부모 클래스의 속성과 메서드를 자식이 물려받음 |
| **다형성** | 같은 인터페이스로 다양한 구현체를 사용 |
| **추상화** | 복잡한 내부 구현을 숨기고 핵심만 노출 |

### 면접관이 주목하는 포인트
- 실제 코드 예시와 함께 설명
- 각 특성의 장점과 활용 사례

### 꼬리 질문 대비
- "다형성의 예시를 들어주세요"
  → 인터페이스(PaymentService)를 구현한 여러 클래스(KakaoPayService, NaverPayService)

</details>

---

## Q2. SOLID 원칙을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 원칙 | 설명 | 예시 |
|------|------|------|
| **SRP** | 단일 책임 - 하나의 클래스는 하나의 책임 | UserService에서 이메일 로직 분리 |
| **OCP** | 개방 폐쇄 - 확장에 열려있고 변경에 닫혀있음 | Strategy 패턴 |
| **LSP** | 리스코프 치환 - 자식은 부모를 대체 가능 | Rectangle/Square 문제 |
| **ISP** | 인터페이스 분리 - 작은 인터페이스로 분리 | 거대 인터페이스 분할 |
| **DIP** | 의존 역전 - 추상화에 의존 | Spring DI |

### 실무 적용
- **SRP**: UserService가 이메일 발송까지 담당 → EmailService 분리
- **OCP**: 새로운 결제 수단 추가 시 기존 코드 수정 없이 구현체만 추가
- **DIP**: 구체 클래스가 아닌 인터페이스에 의존

### 면접관이 주목하는 포인트
- 단순 암기가 아닌 실무 적용 경험
- 코드 리뷰/리팩토링 사례

</details>

---

## Q3. Java의 GC(Garbage Collection)에 대해 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
GC는 JVM이 힙 메모리에서 더 이상 참조되지 않는 객체를 자동으로 제거하는 메커니즘입니다.

### GC 알고리즘 비교

| 알고리즘 | 특징 | STW 시간 | 적용 |
|---------|------|----------|------|
| Serial GC | 단일 스레드 | 김 | 소형 시스템 |
| Parallel GC | 멀티 스레드 | 중간 | Java 8 기본 |
| G1GC | Region 기반 | 예측 가능 | Java 9+ 기본 |
| ZGC | 초저지연 | <10ms | 대용량 힙 |

### 힙 메모리 구조
```
Heap
├── Young Generation
│   ├── Eden
│   └── Survivor (S0, S1)
└── Old Generation
```

### 면접관이 주목하는 포인트
- GC 튜닝 경험 (구체적 수치)
- Stop-The-World 개념

### 꼬리 질문 대비
- "GC 튜닝을 해본 경험이 있나요?"
  → MaxGCPauseMillis 조절, 힙 사이즈 최적화, Full GC 빈도 감소 등
- "G1GC의 동작 원리는?"
  → 힙을 Region으로 나누고, Garbage가 많은 Region부터 수집

</details>

---

## Q4. Java는 Call By Value인가요, Call By Reference인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Java는 **항상 Call By Value**입니다. 참조 타입의 경우 참조 값(주소)이 복사되어 전달됩니다.

### 상세 설명

**기본 타입 (Primitive)**
```java
void modify(int x) {
    x = 10; // 복사본 수정, 원본 영향 없음
}
```

**참조 타입 (Reference)**
```java
void modify(User user) {
    user.setName("Kim");  // 같은 객체 수정 → 원본 영향 O
    user = new User();    // 참조 값 변경 → 원본 영향 X
}
```

### 핵심 포인트
- 참조 타입도 **참조의 복사본**이 전달됨
- 메서드 내에서 `new`로 새 객체 할당해도 원본 변수는 변경 안 됨

### 면접관이 주목하는 포인트
- 명확한 개념 이해
- 코드 예시로 설명

</details>

---

## Q5. Java 21의 Virtual Threads에 대해 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Virtual Threads는 JVM 내부에서 관리되는 경량 스레드로, OS 스레드와 N:1 매핑됩니다. 기존 동기식 코드 스타일을 유지하면서 비동기 I/O의 성능을 얻을 수 있습니다.

### 기존 플랫폼 스레드 한계
- OS 스레드와 1:1 매핑 → 생성 비용 높음
- I/O 블로킹 시 스레드 낭비
- 수천 개 이상 생성 어려움

### Virtual Thread 장점
- 수백만 개 생성 가능
- I/O 블로킹 시 자동으로 Unmount
- 동기식 코드 스타일 유지 (WebFlux 콜백 지옥 없음)

### 동작 원리
```
Virtual Thread가 I/O 대기
    ↓
JVM이 힙에 저장 (Unmount)
    ↓
Carrier Thread가 다른 Virtual Thread 실행
    ↓
I/O 완료 시 다시 Mount
```

### WebFlux vs Virtual Threads

| 구분 | WebFlux | Virtual Threads |
|------|---------|-----------------|
| 코드 스타일 | 리액티브 (복잡) | 동기식 (간단) |
| 디버깅 | 어려움 | 쉬움 |
| 적합 환경 | CPU 집약적 | I/O 집약적 |

### 면접관이 주목하는 포인트
- 기존 스레드와의 차이점
- 실무 적용 시나리오

</details>

---

## Q6. equals()와 hashCode()를 함께 오버라이딩해야 하는 이유는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
HashMap, HashSet 등에서 객체를 저장/조회할 때 hashCode()로 버킷을 찾고, equals()로 실제 동등성을 비교하기 때문입니다.

### 규칙
1. equals()가 true면 hashCode()도 같아야 함
2. hashCode()가 같아도 equals()는 다를 수 있음 (충돌)

### 문제 상황
```java
// equals()만 오버라이딩한 경우
User user1 = new User("kim");
User user2 = new User("kim");

user1.equals(user2); // true

Set<User> set = new HashSet<>();
set.add(user1);
set.contains(user2); // false! (hashCode가 다름)
```

### 면접관이 주목하는 포인트
- HashMap의 동작 원리 이해
- 실제 코드에서의 버그 사례

</details>

---

## Q7. String, StringBuilder, StringBuffer의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 클래스 | 불변성 | 동기화 | 사용 사례 |
|--------|--------|--------|----------|
| String | 불변 | - | 변경 없는 문자열 |
| StringBuilder | 가변 | X | 단일 스레드 |
| StringBuffer | 가변 | O | 멀티 스레드 |

### String이 불변인 이유
- 보안: 파일 경로, URL 등 변조 방지
- 해시 캐싱: hashCode() 결과 캐싱 가능
- 스레드 안전: 동기화 없이 공유 가능
- String Pool: 메모리 효율

### 면접관이 주목하는 포인트
- 불변 객체의 장점
- 실무에서의 선택 기준

</details>

---

## Q8. 인터페이스와 추상 클래스의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 인터페이스 | 추상 클래스 |
|------|-----------|------------|
| 다중 상속 | 가능 | 불가 |
| 상태(필드) | 상수만 | 인스턴스 변수 가능 |
| 생성자 | 없음 | 있음 |
| 목적 | 기능 명세 | 공통 기능 + 명세 |

### Java 8 이후 인터페이스
- default 메서드: 기본 구현 제공
- static 메서드: 정적 유틸리티

### 선택 기준
- **인터페이스**: "이것을 할 수 있다" (Comparable, Serializable)
- **추상 클래스**: "이것의 일종이다" (Animal → Dog)

</details>

---

## Q9. 동기(Synchronous)와 비동기(Asynchronous)의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 동기 (Synchronous) | 비동기 (Asynchronous) |
|------|-------------------|----------------------|
| 실행 방식 | 순차적, 블로킹 | 병렬적, 논블로킹 |
| 대기 | 결과까지 대기 | 대기 없이 다음 작업 |
| 구현 | 간단 | 복잡 (콜백, Promise) |

### 동기 방식
```java
// 순차 실행 - 결과를 기다림
String result1 = api.call("/users");    // 2초 대기
String result2 = api.call("/orders");   // 3초 대기
// 총 5초 소요
```

### 비동기 방식
```java
// 병렬 실행 - 대기하지 않음
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> api.call("/users"));
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> api.call("/orders"));

CompletableFuture.allOf(future1, future2).join();
// 총 3초 소요 (더 긴 작업 기준)
```

### 블로킹 vs 논블로킹

| 구분 | 블로킹 | 논블로킹 |
|------|--------|---------|
| 제어권 | 호출된 함수가 보유 | 호출한 함수가 보유 |
| 대기 | 대기함 | 즉시 반환 |

### 면접관이 주목하는 포인트
- 동기/비동기와 블로킹/논블로킹 구분
- 비동기 사용 시 에러 처리 방법

</details>

---

## Q10. Java에서 Exception과 Error의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

```
Throwable
├── Error (심각, 복구 불가)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
│
└── Exception (복구 가능)
    ├── Checked Exception (컴파일 타임)
    │   ├── IOException
    │   ├── SQLException
    │   └── FileNotFoundException
    │
    └── Unchecked Exception (런타임)
        ├── NullPointerException
        ├── ArrayIndexOutOfBoundsException
        └── IllegalArgumentException
```

### Checked vs Unchecked Exception

| 구분 | Checked | Unchecked |
|------|---------|-----------|
| 확인 시점 | 컴파일 타임 | 런타임 |
| 처리 강제 | try-catch 필수 | 선택적 |
| 예시 | IOException | NullPointerException |
| 부모 클래스 | Exception | RuntimeException |

### 처리 예시
```java
// Checked - 반드시 처리
try {
    FileReader reader = new FileReader("file.txt");
} catch (FileNotFoundException e) {
    // 처리 필수
}

// Unchecked - 선택적 처리
String str = null;
str.length(); // NullPointerException (런타임)
```

### 면접관이 주목하는 포인트
- Error는 try-catch로 잡으면 안 되는 이유
- Checked Exception의 단점과 대안

</details>

---

## Q11. HashTable과 HashMap의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | HashTable | HashMap |
|------|-----------|---------|
| 동기화 | O (Thread-safe) | X |
| null 허용 | X (키, 값 모두) | O (키 1개, 값 N개) |
| 성능 | 느림 | 빠름 |
| 도입 시기 | Java 1.0 | Java 1.2 |

### 코드 비교
```java
// HashTable - 동기화, null 불가
Hashtable<String, String> table = new Hashtable<>();
table.put(null, "value");  // NullPointerException!

// HashMap - 비동기화, null 허용
HashMap<String, String> map = new HashMap<>();
map.put(null, "value");    // OK
```

### Thread-safe가 필요할 때
```java
// 방법 1: Collections.synchronizedMap
Map<String, String> syncMap = Collections.synchronizedMap(new HashMap<>());

// 방법 2: ConcurrentHashMap (권장)
ConcurrentHashMap<String, String> concurrentMap = new ConcurrentHashMap<>();
```

### ConcurrentHashMap이 더 좋은 이유
- HashTable: 전체 락 → 성능 저하
- ConcurrentHashMap: 버킷별 락 → 높은 동시성

### 면접관이 주목하는 포인트
- 왜 HashTable 대신 ConcurrentHashMap을 사용하는지
- HashMap의 null 키 처리 방법

</details>

---

## Q12. Thread-safe(쓰레드 세이프)란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Thread-safe는 여러 스레드가 동시에 접근해도 **정합성이 보장**되는 상태입니다.

### Thread-safe 보장 방법

| 방법 | 설명 | 예시 |
|------|------|------|
| synchronized | 암묵적 락 | synchronized 메서드/블록 |
| Lock | 명시적 락 | ReentrantLock |
| Atomic | CAS 연산 | AtomicInteger, AtomicReference |
| 불변 객체 | 상태 변경 불가 | String, final 필드 |
| ThreadLocal | 스레드별 복사본 | ThreadLocal<T> |

### 코드 예시
```java
// 1. synchronized
public synchronized void increment() {
    count++;
}

// 2. ReentrantLock
private Lock lock = new ReentrantLock();
public void increment() {
    lock.lock();
    try {
        count++;
    } finally {
        lock.unlock();
    }
}

// 3. Atomic
private AtomicInteger count = new AtomicInteger();
public void increment() {
    count.incrementAndGet();
}
```

### Thread-safe한 클래스들
- StringBuffer (StringBuilder는 X)
- Vector (ArrayList는 X)
- Hashtable (HashMap은 X)
- ConcurrentHashMap
- AtomicInteger, AtomicLong

### 면접관이 주목하는 포인트
- synchronized의 단점과 대안
- CAS(Compare-And-Swap) 원리

</details>

---

## 학습 체크리스트

- [ ] OOP 4가지 특성 설명 가능
- [ ] SOLID 원칙 실무 적용 사례 제시 가능
- [ ] GC 알고리즘과 튜닝 경험 설명 가능
- [ ] Call By Value 개념 명확히 이해
- [ ] Virtual Threads 동작 원리 설명 가능
- [ ] equals/hashCode 관계 이해
- [ ] 동기/비동기 차이 설명 가능
- [ ] Exception과 Error 구분 가능
- [ ] HashTable vs HashMap 차이 설명 가능
- [ ] Thread-safe 보장 방법 알기
