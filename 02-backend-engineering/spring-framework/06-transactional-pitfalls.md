# @Transactional의 함정 (Declarative Transaction Pitfalls)

> 어노테이션 한 줄로 트랜잭션이 걸리는 원리와, 그 원리 때문에 "분명 붙였는데 롤백이 안 되는" 상황들이 왜 생기는지 설명하고 피할 수 있게 된다.

## 학습 목표

- [ ] `@Transactional`이 프록시와 `TransactionInterceptor`로 동작하는 과정을 그릴 수 있다
- [ ] 롤백되지 않는 대표적인 네 가지 상황을 원인과 함께 설명할 수 있다
- [ ] 전파 속성 일곱 가지의 차이와 `REQUIRES_NEW`/`NESTED`의 주의점을 안다
- [ ] 트랜잭션 안에서 외부 API를 호출하면 안 되는 이유를 커넥션 관점에서 설명할 수 있다

## 선행 지식

- [02-aop-proxy.md](./02-aop-proxy.md) - 이 문서의 함정 대부분이 프록시 구조에서 나온다
- 데이터베이스 트랜잭션의 ACID와 커밋/롤백 개념

---

## 1. 왜 필요한가

### 손으로 쓰는 트랜잭션 코드

계좌 이체처럼 두 개의 쓰기가 전부 성공하거나 전부 실패해야 하는 로직을 트랜잭션 없이 짤 수는 없다. JDBC로 직접 쓰면 이렇다.

```java
public void transfer(Long fromId, Long toId, int amount) {
    Connection conn = null;
    try {
        conn = dataSource.getConnection();
        conn.setAutoCommit(false);              // 트랜잭션 시작
        accountDao.withdraw(conn, fromId, amount);
        accountDao.deposit(conn, toId, amount);
        conn.commit();                          // 성공
    } catch (Exception e) {
        if (conn != null) conn.rollback();      // 실패
        throw new RuntimeException(e);
    } finally {
        if (conn != null) conn.close();         // 반드시 반환
    }
}
```

진짜 로직은 가운데 두 줄인데 나머지가 전부 배관 코드다. 게다가 이 코드에는 세 가지 위험이 숨어 있다.

- `conn.close()`를 빠뜨리면 커넥션이 새고, 얼마 지나 풀이 고갈되어 서비스 전체가 멈춘다
- `rollback()`을 조건에 따라 빠뜨리면 절반만 반영된 데이터가 남는다
- `Connection`을 DAO 파라미터로 계속 넘겨야 해서 메서드 시그니처가 오염된다

같은 코드가 서비스 메서드마다 반복되고 한 곳만 실수해도 데이터가 깨진다. [AOP 문서](./02-aop-proxy.md)에서 본 횡단 관심사의 전형이다.

### 선언적 트랜잭션

```java
@Transactional
public void transfer(Long fromId, Long toId, int amount) {
    accountService.withdraw(fromId, amount);
    accountService.deposit(toId, amount);
}
```

배관이 전부 사라졌다. 편해진 만큼 대가가 있다. **트랜잭션 경계가 코드에 보이지 않기 때문에, 경계가 어긋나도 눈에 띄지 않는다.** 이 문서의 나머지는 전부 그 이야기다.

---

## 2. 어떻게 동작하나

### 프록시가 대신 감싼다

```
Controller
    │ orderService.placeOrder(...)
    ▼
┌──────────────────────────────────────────────────────┐
│ OrderService$$Proxy                                  │
│                                                      │
│  TransactionInterceptor  (@Around 성격의 Advice)     │
│    ├─ PlatformTransactionManager.getTransaction()    │
│    │    → 커넥션 획득, setAutoCommit(false)          │
│    │    → 커넥션을 ThreadLocal 에 보관               │
│    ▼                                                 │
│  ┌────────────────────────────────────────────┐     │
│  │ OrderService (원본)  placeOrder() 실제 로직 │     │
│  │ Repository 들은 ThreadLocal 에서            │     │
│  │ 같은 커넥션을 꺼내 쓴다                     │     │
│  └────────────────┬───────────────────────────┘     │
│      정상 반환 → commit()   예외 → rollback()        │
│                   ▼                                  │
│             커넥션 반환                               │
└──────────────────────────────────────────────────────┘
```

프록시가 하는 일을 의사코드로 옮기면 이렇다. 조건절에 `RuntimeException`과 `Error`만 적혀 있다는 점을 기억하자.

```java
public void placeOrder(...) {
    TransactionStatus status = txManager.getTransaction(definition);
    try {
        target.placeOrder(...);          // 원본 메서드
        txManager.commit(status);
    } catch (Throwable e) {
        // ↓ 기본 롤백 규칙
        if (e instanceof RuntimeException || e instanceof Error) txManager.rollback(status);
        else txManager.commit(status);   // Checked Exception 은 커밋하고 예외만 내보낸다
        throw e;
    }
}
```

실제 구현(`TransactionAspectSupport`)은 모든 `Throwable`을 잡은 뒤 롤백 규칙에 물어보는 형태이고, 그 기본 규칙이 "`RuntimeException`과 `Error`만 롤백"이다. `rollbackFor`를 지정하면 이 규칙이 바뀐다. 뒤에 나올 함정의 절반이 이 조건 한 줄에서 나온다.

### 커넥션은 ThreadLocal에 있다

`@Transactional` 메서드 안에서 여러 Repository를 호출해도 전부 **같은 커넥션**을 쓴다. `TransactionSynchronizationManager`가 커넥션을 현재 스레드의 `ThreadLocal`에 담아두기 때문이다. 그래서 Repository 메서드에 `Connection`을 넘길 필요가 없다.

이 사실에서 중요한 따름정리가 나온다. **스레드가 바뀌면 트랜잭션도 끊긴다.** `@Async` 메서드나 별도 스레드에서 실행되는 코드는 바깥 트랜잭션에 참여하지 못한다.

---

## 3. 실전 함정

### 함정 1. self-invocation

```java
// 안티패턴
@Service
public class OrderService {

    public void placeOrder(OrderRequest req) {
        validate(req);
        this.saveOrder(req);        // 내부 호출
    }

    @Transactional
    public void saveOrder(OrderRequest req) { ... }
}
```

**왜 문제인가**: 트랜잭션은 프록시에 있는데, `placeOrder`가 실행되는 시점에는 이미 원본 객체 안이다. `this.saveOrder()`는 프록시를 다시 거치지 않으므로 트랜잭션이 시작되지 않는다. 예외도 경고도 없다.

```java
// 개선 - 트랜잭션이 필요한 단위를 별도 Bean으로 분리한다
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderWriter orderWriter;

    public void placeOrder(OrderRequest req) {
        validate(req);
        orderWriter.save(req);      // 다른 Bean → 프록시 경유 → 트랜잭션 적용
    }
}
```

### 함정 2. private / 접근 제한자

```java
// 안티패턴
@Transactional
private void updateStock(Long productId) { ... }
```

**왜 문제인가**: CGLIB 프록시는 원본 클래스를 상속해 메서드를 오버라이드하는데, `private` 메서드는 오버라이드할 수 없다. 게다가 `private` 메서드는 정의상 항상 내부 호출이라 프록시를 거칠 방법이 없다. `final`이나 `static` 메서드도 같은 이유로 적용되지 않는다. 프록시 기반 트랜잭션은 **public 메서드에만 붙인다**고 생각하는 것이 안전하다.

### 함정 3. Checked Exception은 롤백되지 않는다

```java
// 안티패턴
@Transactional
public void placeOrder(OrderRequest req) throws IOException {
    orderRepository.save(new Order(req));
    fileStorage.writeReceipt(req);      // IOException 발생
    // 예외가 던져졌는데도 주문은 커밋된다
}
```

**왜 문제인가**: 기본 롤백 규칙이 보는 것은 `RuntimeException`과 `Error`뿐이다. `IOException` 같은 Checked Exception은 롤백 대상이 아니라서, 예외가 밖으로 나가는데도 트랜잭션은 커밋된다. 영수증 없는 주문이 DB에 남는다.

이 규칙은 EJB 시절의 관례를 계승한 것으로, "Checked Exception은 호출자가 복구할 수 있는 상황"이라는 전제에 서 있다. 지금의 코드 스타일과는 잘 맞지 않아 사고를 부르는 편이다.

```java
// 개선 1 - 롤백 대상을 명시한다
@Transactional(rollbackFor = Exception.class)
public void placeOrder(OrderRequest req) throws IOException { ... }

// 개선 2 (권장) - 애초에 비즈니스 예외를 RuntimeException 계열로 설계한다
public class ReceiptWriteFailedException extends RuntimeException { }

@Transactional
public void placeOrder(OrderRequest req) {
    orderRepository.save(new Order(req));
    try {
        fileStorage.writeReceipt(req);
    } catch (IOException e) {
        throw new ReceiptWriteFailedException(e);   // RuntimeException 이므로 롤백된다
    }
}
```

### 함정 4. 예외를 잡아먹으면 롤백되지 않는다

```java
// 안티패턴
@Transactional
public void placeOrder(OrderRequest req) {
    orderRepository.save(new Order(req));
    try {
        pointService.usePoint(req.getUserId(), req.getPoint());
    } catch (Exception e) {
        log.error("포인트 차감 실패", e);   // 삼켰다
    }
}
```

**왜 문제인가**: 프록시는 메서드 밖으로 나온 예외만 본다. 안에서 잡아버리면 프록시 입장에서는 정상 종료이므로 커밋한다. 포인트는 안 빠지고 주문만 생성된 데이터가 남는다.

**같은 코드가 더 나쁘게 동작하는 변형**도 있다. `pointService.usePoint()`가 `@Transactional`이고 그 안에서 예외가 났다면, 안쪽 트랜잭션이 전체 트랜잭션에 `rollback-only` 표시를 남긴다. 바깥에서 예외를 삼키고 커밋을 시도하면 이런 예외를 만난다.

```
UnexpectedRollbackException:
  Transaction silently rolled back because it has been marked as rollback-only
```

"나는 예외를 다 잡았는데 왜 죽지?"의 정체가 이것이다. 기본 전파인 `REQUIRED`에서는 안쪽과 바깥쪽이 **같은 물리 트랜잭션**을 공유하므로, 안에서 한 번 롤백 표시가 붙으면 되돌릴 수 없다.

```java
// 개선 - 실패해도 진행해야 하는 작업은 트랜잭션을 분리한다
@Service
public class PointService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void usePoint(Long userId, int point) { ... }
}
```

또는 애초에 부가 작업을 트랜잭션 밖으로 빼거나 커밋 후 이벤트로 처리한다.

### 함정 5. readOnly = true의 오해

`@Transactional(readOnly = true)`가 하는 일은 **최적화 힌트**다. JPA를 쓰면 영속성 컨텍스트의 플러시 모드가 바뀌어 변경 감지를 위한 스냅샷 비교와 플러시를 건너뛴다. 조회가 많은 메서드에서 메모리와 CPU를 아낄 수 있다.

오해는 여기서 생긴다. **이것은 쓰기를 차단하는 보안 장치가 아니다.** 예를 들어 식별자 생성 전략에 따라 `persist` 시점에 곧바로 INSERT가 나가는 경우처럼, 플러시와 무관하게 SQL이 실행되는 경로가 있다. "`readOnly`를 붙였으니 실수로 저장될 일은 없다"고 믿으면 안 된다.

더 자주 사고를 내는 쪽은 **클래스 레벨 `readOnly`가 쓰기 메서드에까지 상속되는 것**이다.

```java
@Service
@Transactional(readOnly = true)   // 클래스 전체 기본값
public class OrderService {

    public List<Order> findAll() { ... }         // 의도대로

    // 안티패턴 - 클래스의 readOnly 가 그대로 적용된다
    public void updateStatus(Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.complete();                        // 변경 감지가 플러시되지 않아 반영 안 됨
    }

    // 개선 - 쓰기 메서드에서 readOnly = false 로 명시적으로 덮어쓴다
    @Transactional
    public void updateStatusFixed(Long id) { ... }
}
```

"클래스에 `readOnly = true`, 쓰기 메서드에만 `@Transactional`"은 널리 쓰이는 관례지만, 붙이는 것을 잊으면 조용히 반영이 안 된다는 위험이 늘 따라다닌다.

### 함정 6. 트랜잭션 안에서 외부 API 호출

```java
// 안티패턴
@Transactional
public void placeOrder(OrderRequest req) {
    Order order = orderRepository.save(new Order(req));
    paymentClient.pay(order);          // 외부 결제 API. 응답까지 최대 10초
    order.markPaid();
}
```

**왜 문제인가**: 세 가지가 동시에 잘못된다.

```
[트랜잭션 없이]                    [트랜잭션 안에서]

커넥션 점유 ██                     커넥션 점유 ██████████████
             ↑                                  ↑         ↑
          DB 작업                            DB 작업   외부 API 10초
                                              커넥션과 락을 10초 동안 붙잡고 있다
```

1. **커넥션 점유 시간이 API 응답 시간만큼 늘어난다.** 풀 크기가 10인데 동시 주문이 10건이면 11번째 요청부터 커넥션을 못 받고 대기한다. 결제 API가 느려지는 순간 서비스 전체가 멈춘다. 재시도 로직까지 트랜잭션 안에서 돌면 점유 시간은 배로 늘어난다.
2. **DB 락도 그만큼 유지된다.** 재고 행을 잠근 채 10초를 기다리면 같은 상품을 사려는 다른 요청이 전부 밀린다. 데드락 확률도 올라간다.
3. **롤백해도 외부 호출은 되돌아가지 않는다.** DB는 롤백됐는데 결제는 이미 승인된 상태가 만들어진다.

```java
// 개선 1 - 트랜잭션 경계를 쪼개서 외부 호출을 밖으로 뺀다
@Service
@RequiredArgsConstructor
public class OrderFacade {
    private final OrderService orderService;
    private final PaymentClient paymentClient;

    public void placeOrder(OrderRequest req) {
        Long orderId = orderService.createPending(req);   // 짧은 트랜잭션
        PaymentResult result = paymentClient.pay(orderId, req.getAmount());  // 트랜잭션 밖
        orderService.applyPaymentResult(orderId, result); // 짧은 트랜잭션
    }
}

// 개선 2 - 커밋된 뒤에 실행되도록 이벤트로 미룬다
@Transactional
public void placeOrder(OrderRequest req) {
    Order order = orderRepository.save(new Order(req));
    publisher.publishEvent(new OrderPlacedEvent(order.getId()));   // ApplicationEventPublisher
}

@Component
public class OrderNotificationListener {
    // 커밋이 끝난 뒤 실행된다. 여기서 실패해도 주문은 롤백되지 않는다
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendNotification(OrderPlacedEvent event) {
        notificationClient.send(event.getOrderId());
    }
}
```

원칙은 하나다. **트랜잭션 안에는 DB 작업만 둔다.** 메일 발송, 파일 업로드, 외부 결제, 슬랙 알림은 모두 밖으로 뺀다.

---

## 4. 전파 속성 (Propagation)

전파 속성은 **"이미 진행 중인 트랜잭션이 있을 때 어떻게 할 것인가"** 를 정한다.

| 속성 | 기존 트랜잭션이 있으면 | 없으면 |
|------|---------------------|-------|
| `REQUIRED` (기본) | 참여한다 | 새로 만든다 |
| `REQUIRES_NEW` | 기존 것을 보류하고 **새로 만든다** | 새로 만든다 |
| `SUPPORTS` | 참여한다 | 트랜잭션 없이 실행 |
| `NOT_SUPPORTED` | 보류하고 트랜잭션 없이 실행 | 트랜잭션 없이 실행 |
| `MANDATORY` | 참여한다 | **예외를 던진다** |
| `NEVER` | **예외를 던진다** | 트랜잭션 없이 실행 |
| `NESTED` | Savepoint를 만들어 중첩 | 새로 만든다 |

> 결론: 실무에서 쓰는 것은 사실상 `REQUIRED`(기본)와 `REQUIRES_NEW` 둘이다. `MANDATORY`는 "이 메서드는 반드시 상위 트랜잭션 안에서만 불려야 한다"는 계약을 코드로 강제하고 싶을 때 가끔 쓴다.

### REQUIRED와 REQUIRES_NEW의 차이

```
[REQUIRED]  하나의 물리 트랜잭션을 공유한다

  outer()  ─── BEGIN ─────────────────────────── COMMIT/ROLLBACK
                 └── inner()  (같은 커넥션, 같은 트랜잭션)
                        └─ 여기서 예외 → 전체가 롤백된다

[REQUIRES_NEW]  물리 트랜잭션이 두 개다

  outer()  ─── BEGIN ──────[보류]──────[재개]─── COMMIT/ROLLBACK
                             │  ↑
                             ▼  │
  inner()            BEGIN ─── COMMIT   (별도 커넥션)
                     └─ inner 가 롤백돼도 outer 는 영향받지 않고,
                        outer 가 롤백돼도 inner 커밋은 남는다
```

`REQUIRES_NEW`의 대표 용도는 **본 작업의 성패와 무관하게 남아야 하는 기록**이다. 주문이 실패해도 시도 이력은 남겨야 하는 감사 로그가 전형적이다. 다만 안쪽 트랜잭션이 도는 동안 **커넥션을 두 개 점유한다.** 풀 크기가 10인데 `REQUIRES_NEW`를 쓰는 요청이 10개 동시에 들어오면, 바깥 트랜잭션 10개가 커넥션을 다 쓴 상태에서 안쪽이 커넥션을 기다리는 교착이 생길 수 있다.

### NESTED

`NESTED`는 부모 트랜잭션 안에 Savepoint를 찍는 방식이다. 자식이 실패하면 Savepoint까지만 되돌리고 부모는 계속 진행할 수 있지만, **부모가 롤백되면 자식도 함께 사라진다.** 물리적으로 하나의 트랜잭션이기 때문이다. 주의할 점은 Savepoint를 지원하는 트랜잭션 매니저에서만 동작한다는 것이다. JDBC 기반 매니저는 지원하지만 **JPA 트랜잭션 매니저는 지원하지 않아 예외가 발생하므로**, JPA 프로젝트에서는 사실상 선택지가 아니다.

---

## 5. 격리 수준 (Isolation)

격리 수준은 동시에 실행되는 트랜잭션들이 서로의 중간 상태를 얼마나 볼 수 있는지를 정한다.

| 수준 | Dirty Read | Non-Repeatable Read | Phantom Read |
|------|-----------|--------------------|--------------|
| `READ_UNCOMMITTED` | 발생 | 발생 | 발생 |
| `READ_COMMITTED` | 방지 | 발생 | 발생 |
| `REPEATABLE_READ` | 방지 | 방지 | 발생 가능 |
| `SERIALIZABLE` | 방지 | 방지 | 방지 |

**Dirty Read**는 아직 커밋되지 않은 다른 트랜잭션의 변경을 읽는 것, **Non-Repeatable Read**는 같은 행을 두 번 읽었는데 값이 달라지는 것, **Phantom Read**는 같은 조건으로 두 번 조회했는데 없던 행이 나타나는 것이다.

> 결론: 아래로 갈수록 안전하지만 동시성이 떨어진다. `@Transactional(isolation = ...)`로 바꿀 수 있지만, **기본값인 `DEFAULT`(DB 설정을 따름)를 그대로 쓰는 것이 대부분 맞다.** 특정 구간만 격리를 올려야 한다면 격리 수준을 손대기보다 비관적 락이나 낙관적 락처럼 목적이 분명한 도구를 먼저 검토한다.

DB마다 기본값이 다르다는 점은 알아둘 만하다. MySQL(InnoDB)은 `REPEATABLE READ`, PostgreSQL과 Oracle은 `READ COMMITTED`가 기본이라, 같은 코드가 DB를 바꾸면 다르게 동작할 수 있다.

---

## 6. 실무에서는

- **트랜잭션은 짧게, 경계는 서비스 계층에.** 컨트롤러에 `@Transactional`을 붙이면 뷰 렌더링이나 직렬화 시간까지 트랜잭션에 포함된다. Repository에 붙이면 여러 저장 작업이 하나로 묶이지 않는다. 비즈니스 단위인 서비스 메서드가 자연스러운 경계다.
- **타임아웃을 걸어두면 사고가 커지는 것을 막는다.** `@Transactional(timeout = 5)`처럼 상한을 두면 예상치 못하게 오래 걸리는 쿼리가 커넥션을 무한정 붙잡는 상황을 끊을 수 있다.
- **`readOnly = true`는 읽기 전용 복제본 라우팅에도 쓰인다.** `AbstractRoutingDataSource`로 현재 트랜잭션이 읽기 전용인지 판단해 리더/라이터 DB를 나눠 보내는 구성이 흔하다. 반대로 트랜잭션이 실제로 걸렸는지 확인하려면 `org.springframework.transaction.interceptor` 로거를 DEBUG로 켜서 생성/커밋 로그를 보면 된다.
- **테스트의 `@Transactional`은 성격이 다르다.** 테스트 메서드에 붙이면 끝난 뒤 자동 롤백되어 DB가 깨끗해지는데, 이 때문에 실제 커밋 시점에만 드러나는 문제(제약조건 위반, `AFTER_COMMIT` 리스너 동작)를 테스트가 놓칠 수 있다.

---

## 7. 면접 포인트

> 면접에서 이 주제가 나오면 이렇게 답한다

**Q. `@Transactional`의 동작 원리를 설명해주세요.**
A. Spring AOP 프록시 기반입니다. 컨테이너가 대상 Bean을 프록시로 감싸고, 그 안의 `TransactionInterceptor`가 Around Advice로 동작합니다. 메서드 호출이 들어오면 `PlatformTransactionManager`로 트랜잭션을 시작하면서 커넥션을 획득해 `ThreadLocal`에 보관하고, 원본 메서드를 실행한 뒤 정상 반환이면 커밋, 예외면 롤백합니다. Repository들이 같은 커넥션을 쓰는 것도 `ThreadLocal`에서 꺼내기 때문입니다.
- 꼬리 질문: "그럼 `@Async` 안에서 바깥 트랜잭션에 참여할 수 있나요?" → 스레드가 바뀌면 `ThreadLocal`이 달라지므로 참여할 수 없다.

**Q. `@Transactional`을 붙였는데 롤백이 안 되는 경우를 말해보세요.**
A. 크게 네 가지입니다. 첫째, 같은 클래스 안에서 `this`로 호출하면 프록시를 거치지 않아 트랜잭션 자체가 시작되지 않습니다. 둘째, `private`이나 `final` 메서드는 프록시가 개입할 수 없습니다. 셋째, Checked Exception은 기본 롤백 대상이 아니어서 예외가 나가는데도 커밋됩니다. 넷째, 메서드 안에서 예외를 `try-catch`로 삼키면 프록시 입장에서는 정상 종료라 커밋합니다.
- 꼬리 질문: "Checked Exception을 롤백하려면요?" → `rollbackFor = Exception.class`를 명시하거나, 애초에 비즈니스 예외를 `RuntimeException` 계열로 설계한다.

**Q. 예외를 다 잡았는데 `UnexpectedRollbackException`이 나는 이유는 뭔가요?**
A. 기본 전파인 `REQUIRED`에서는 안쪽 메서드가 바깥과 같은 물리 트랜잭션을 공유합니다. 안쪽에서 예외가 나면 그 트랜잭션에 rollback-only 표시가 찍히는데, 바깥에서 예외를 잡고 커밋을 시도하면 "이미 롤백 표시된 트랜잭션"이라 커밋이 거부되면서 이 예외가 납니다. 실패해도 계속 진행해야 하는 작업이라면 `REQUIRES_NEW`로 트랜잭션을 분리하거나 아예 트랜잭션 밖으로 빼야 합니다.

**Q. 트랜잭션 안에서 외부 API를 호출하면 왜 안 되나요?**
A. 커넥션과 DB 락을 API 응답 시간만큼 붙잡고 있게 되기 때문입니다. 결제 API가 평소 100ms인데 장애로 10초가 되면, 커넥션 풀이 순식간에 고갈되어 그 API와 무관한 요청까지 전부 막힙니다. 또 DB는 롤백할 수 있지만 이미 나간 외부 호출은 되돌릴 수 없어서, 결제는 승인됐는데 주문은 없는 불일치가 생깁니다. 저는 트랜잭션 경계를 쪼개서 외부 호출을 밖으로 빼거나, `@TransactionalEventListener`의 `AFTER_COMMIT` 단계로 미루는 방식을 씁니다.
- 꼬리 질문: "`AFTER_COMMIT`에서 실패하면 어떻게 하나요?" → 이미 커밋된 상태라 롤백은 불가능하다. 재시도 큐에 넣거나 보상 트랜잭션으로 처리하는 설계가 필요하다.

**Q. `REQUIRES_NEW`는 언제 쓰나요?**
A. 본 작업이 실패해도 반드시 남아야 하는 기록, 예를 들어 주문 시도 이력이나 감사 로그에 씁니다. 다만 안쪽 트랜잭션이 도는 동안 커넥션을 두 개 점유하기 때문에, 풀 크기를 넘어서면 서로 커넥션을 기다리는 교착이 생길 수 있어 남용하지 않습니다.

---

## 자주 하는 실수

| 실수 | 왜 틀렸나 | 올바른 이해 |
|------|----------|-----------|
| "모든 예외에서 롤백된다" | 기본 대상은 `RuntimeException`과 `Error`뿐 | Checked Exception은 `rollbackFor` 명시가 필요하다 |
| "`readOnly = true`면 쓰기가 막힌다" | 플러시를 생략하는 최적화 힌트일 뿐이다 | 쓰기 차단 장치가 아니다. 예외 경로가 존재한다 |
| "`try-catch`로 로그만 남기면 안전하다" | 프록시가 예외를 못 보므로 커밋된다 | 롤백이 필요하면 예외를 다시 던지거나 트랜잭션을 분리한다 |
| "`REQUIRES_NEW`를 쓰면 항상 안전하다" | 커넥션을 두 개 점유해 풀 고갈 위험이 있다 | 꼭 필요한 곳에만 쓴다 |
| "JPA에서도 `NESTED`를 쓸 수 있다" | JPA 트랜잭션 매니저는 Savepoint를 지원하지 않는다 | JPA 환경에서는 사용할 수 없다 |
| "트랜잭션은 넓게 잡을수록 안전하다" | 커넥션 점유와 락 유지 시간이 길어져 처리량이 무너진다 | 필요한 최소 범위로 짧게 잡는다 |
| "`@Transactional`은 컨트롤러에 붙여도 된다" | 요청 처리 전체가 트랜잭션에 들어간다 | 서비스 계층에 붙여 비즈니스 단위로 경계를 잡는다 |

---

## 한 줄 정리

`@Transactional`은 프록시가 메서드를 감싸 커밋과 롤백을 대신해주는 장치이고, 이 문서의 함정은 전부 **"프록시를 거치지 않았거나(1·2번), 프록시가 예외를 보지 못했거나(3·4번), 트랜잭션 경계가 너무 넓거나(6번)"** 세 가지 중 하나로 환원된다.

---

## 연관 개념

- [02-aop-proxy.md](./02-aop-proxy.md) - self-invocation과 `final`/`private` 제약의 근본 원리
- [01-ioc-di.md](./01-ioc-di.md) - 프록시가 주입되는 컨테이너 구조
- [05-spring-boot-auto-config.md](./05-spring-boot-auto-config.md) - `DataSource`와 트랜잭션 매니저가 자동 등록되는 과정
- [qna-spring.md](./qna-spring.md) - `@Transactional` 면접 질문(Q3)
- [../database/qna-database.md](../database/qna-database.md) - 트랜잭션 격리 수준과 락에 대한 DB 관점 정리
- [../../01-computer-science-fundamentals/operating-system/04-deadlock-race-condition.md](../../01-computer-science-fundamentals/operating-system/04-deadlock-race-condition.md) - 커넥션 교착과 데드락의 일반 원리
