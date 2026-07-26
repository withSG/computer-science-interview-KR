# N+1 문제 (N+1 Select Problem)

> 코드는 한 줄인데 SQL은 101번 나가는 상황이 왜 생기는지, 그리고 fetch join·`@EntityGraph`·batch size가 각각 어디까지 해결해 주는지 구분할 수 있게 된다.

## 학습 목표

- [ ] N+1이 발생하는 정확한 시점과 메커니즘을 SQL 로그로 설명할 수 있다
- [ ] fetch join, `@EntityGraph`, batch size의 해결 범위와 한계를 구분할 수 있다
- [ ] 컬렉션 fetch join과 페이징을 함께 쓰면 안 되는 이유를 설명할 수 있다
- [ ] `MultipleBagFetchException`의 원인과 해결 방법을 안다

## 선행 지식

- [JPA와 ORM](./01-jpa-orm.md) - 연관관계 매핑
- [영속성 컨텍스트](./02-persistence-context.md) - 프록시와 지연 로딩

---

## 1. 왜 생기는가

### 1.1 재현

`Team`과 `Member`가 1:N이고, 각 팀의 멤버 수를 출력하는 코드다.

```java
@Entity
public class Team {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "team")   // 기본값 LAZY
    private List<Member> members = new ArrayList<>();
}
```

```java
@Transactional(readOnly = true)
public void printTeamSizes() {
    List<Team> teams = teamRepository.findAll();          // 쿼리 1번
    for (Team team : teams) {
        System.out.println(team.getMembers().size());     // 팀마다 쿼리 1번
    }
}
```

팀이 10개라면 SQL 로그는 이렇게 찍힌다.

```sql
-- (1) findAll()
select t.id, t.name from team t;

-- (2) 반복문 안에서, 팀 하나마다 한 번씩
select m.id, m.name, m.team_id from member m where m.team_id = 1;
select m.id, m.name, m.team_id from member m where m.team_id = 2;
select m.id, m.name, m.team_id from member m where m.team_id = 3;
...
select m.id, m.name, m.team_id from member m where m.team_id = 10;

-- 총 11번 = 1 + 10
```

팀이 100개면 101번, 1000개면 1001번이다. **데이터가 늘어날수록 쿼리 수가 선형으로 늘어난다**는 점이 이 문제의 본질이다. 개발 DB에서 팀이 3개일 때는 아무도 눈치채지 못하다가, 운영에서 터진다.

> **비유** — 장을 보러 가면서 "일단 매장에 도착하고, 살 게 생각날 때마다 다시 다녀오자"고 하는 것과 같다. 물건이 10개면 왕복 10번이다. 목록을 미리 적어 가면 왕복은 한 번이다.
>
> **비유의 한계** — 장보기는 한 번에 다 사 오는 게 언제나 이득이지만, 데이터는 그렇지 않다. 한 번에 다 가져오면 조인 결과가 곱집합처럼 불어나 오히려 느려지는 경우가 있다. 그래서 뒤에 나오는 "batch size"라는 절충안이 필요하다.

### 1.2 정확히 어느 순간에 터지는가

```
teamRepository.findAll()
      │
      └─▶ select * from team               ← 쿼리 1
             │
             └─▶ Team 객체 10개 생성
                   각 Team.members 는 "아직 안 채워진 컬렉션 래퍼"

for (Team team : teams)
      │
      └─▶ team.getMembers().size()
             │
             └─▶ 컬렉션이 비어 있음을 확인 → 초기화 요청
                   │
                   └─▶ select * from member where team_id = ?   ← 쿼리 2 ~ 11
```

즉 N+1은 **조회 시점이 아니라 연관 데이터에 처음 접근하는 시점**에 발생한다. `findAll()` 한 줄만 보면 문제를 찾을 수 없고, 그 뒤에 있는 `getMembers()` 호출이 원인이다.

### 1.3 즉시 로딩으로 바꾸면 해결될까

```java
@OneToMany(mappedBy = "team", fetch = FetchType.EAGER)   // 안티패턴
```

**왜 문제인가.** N+1이 사라지지 않는다. `em.find()`로 단건 조회할 때는 Hibernate가 JOIN 한 방으로 처리하지만, JPQL(`findAll()` 포함)로 조회할 때는 사정이 다르다. JPQL은 작성된 그대로 SQL로 번역되므로 일단 `select * from team`이 나가고, 그 다음 **즉시 로딩 대상을 채우기 위해** 팀마다 추가 쿼리가 나간다. 결과는 똑같이 N+1이다.

게다가 EAGER는 더 나쁘다. 지연 로딩이면 `getMembers()`를 호출하는 코드 줄을 보고 "여기가 원인"이라고 특정할 수 있다. 즉시 로딩은 **연관 데이터를 쓸 생각이 전혀 없어도** 쿼리가 나가고, 어디서 나가는지 코드에 드러나지 않는다.

| | 즉시 로딩(EAGER) | 지연 로딩(LAZY) |
|---|---|---|
| 추가 쿼리 발생 시점 | 엔티티 조회 즉시 | 연관 데이터 접근 시 |
| 연관 데이터를 안 쓰면 | 그래도 쿼리가 나감 | 쿼리가 안 나감 |
| 원인 코드 추적 | 어렵다(호출부에 흔적 없음) | 쉽다(접근 코드가 곧 원인) |
| 결론 | 쓰지 않는다 | 기본값으로 두고 필요할 때 함께 조회한다 |

**모든 연관관계를 LAZY로 두고, 필요한 곳에서만 함께 조회하는 것**이 유일한 출발점이다.

---

## 2. 해결책 1: fetch join

JPQL에 `join fetch`를 쓰면 연관 엔티티를 **같은 SQL 한 번으로** 가져온다.

```java
@Query("select distinct t from Team t join fetch t.members")
List<Team> findAllWithMembers();
```

```sql
select distinct t.id, t.name, m.id, m.name, m.team_id
from team t
inner join member m on m.team_id = t.id;
-- 쿼리 1번으로 끝
```

`distinct`가 붙은 이유가 있다. 1:N을 조인하면 결과 행이 N쪽 기준으로 늘어난다. 팀 A에 멤버가 3명이면 팀 A가 3행 나오고, JPA는 이걸 `Team` 객체 3개(사실은 같은 인스턴스 3개 참조)로 만들어 리스트에 담는다. JPQL의 `distinct`는 SQL에 DISTINCT를 추가하는 동시에 **같은 식별자를 가진 엔티티 중복을 애플리케이션에서 제거**한다. Hibernate 버전에 따라 이 중복 제거가 기본 동작인 경우도 있지만, 명시해 두면 어느 환경에서든 안전하다.

### fetch join의 한계

- **JPQL을 직접 작성해야 한다.** 메서드 이름 기반 쿼리에는 붙일 수 없다.
- **INNER JOIN이 기본이다.** 멤버가 한 명도 없는 팀은 결과에서 빠진다. 필요하면 `left join fetch`를 쓴다.
- **컬렉션 fetch join은 하나만 가능하다.** (아래 `MultipleBagFetchException`)
- **컬렉션 fetch join + 페이징은 위험하다.** (아래 3절)

---

## 3. 컬렉션 fetch join과 페이징을 같이 쓰면 안 되는 이유

이 조합은 면접 단골이자 실무 장애의 단골이다.

```java
// 위험한 코드
@Query("select t from Team t join fetch t.members")
List<Team> findAllWithMembers(Pageable pageable);
```

```
데이터 상태
team              member
┌────┬──────┐    ┌────┬──────┬─────────┐
│ id │ name │    │ id │ name │ team_id │
├────┼──────┤    ├────┼──────┼─────────┤
│  1 │ A팀  │    │ 11 │ 김   │    1    │
│  2 │ B팀  │    │ 12 │ 이   │    1    │
│  3 │ C팀  │    │ 13 │ 박   │    1    │
└────┴──────┘    │ 14 │ 최   │    2    │
                 │ 15 │ 정   │    3    │
                 └────┴──────┴─────────┘

JOIN 결과 (5행)
┌───────┬────────┐
│ team  │ member │
├───────┼────────┤
│ A팀   │ 김     │  ← LIMIT 2 를 걸면
│ A팀   │ 이     │  ← 여기까지만 잘린다
│ ─────────────── │
│ A팀   │ 박     │     A팀의 멤버 한 명이 통째로 사라진다
│ B팀   │ 최     │     "팀 2개"를 원했는데 "A팀 하나(멤버 2명)"만 나온다
│ C팀   │ 정     │
└───────┴────────┘
```

**원하는 것은 "팀 단위 페이징"인데, DB는 "조인 결과 행 단위"로 자를 수밖에 없다.** `LIMIT 2`는 팀 2개가 아니라 조인 결과 2행을 의미하고, 그 결과 A팀은 멤버 3명 중 2명만 가진 반쪽짜리 객체가 된다. 데이터가 조용히 틀리는, 가장 나쁜 종류의 버그다.

Hibernate는 이 상황을 감지하면 **DB에 LIMIT을 걸지 않고 조인 결과 전체를 읽어 온 뒤 메모리에서 페이징한다.** 로그에 이런 경고가 남는다.

```
HHH000104: firstResult/maxResults specified with collection fetch;
           applying in memory!
```

결과는 정확하지만, 팀이 10만 개면 조인 결과 수십만 행을 애플리케이션 힙에 통째로 올린다. 트래픽이 몰리면 `OutOfMemoryError`로 이어진다. Hibernate에는 이 상황을 경고 대신 예외로 막는 `hibernate.query.fail_on_pagination_over_collection_fetch` 설정도 있다. 켜 두면 사고를 배포 전에 잡을 수 있다.

### 대안: ToOne은 fetch join, 컬렉션은 batch size

```java
// 1) 페이징 대상 조회 — ToOne 관계만 fetch join (행 수가 늘지 않는다)
@Query("select o from Order o join fetch o.member join fetch o.delivery")
List<Order> findAllForPaging(Pageable pageable);
```

`@ManyToOne`, `@OneToOne`은 조인해도 행이 늘어나지 않으므로 페이징과 안전하게 같이 쓸 수 있다. 컬렉션은 LAZY로 남겨 두고 batch size로 처리한다.

---

## 4. 해결책 2: batch size

```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```

특정 연관관계에만 적용하려면 필드나 엔티티에 `@BatchSize(size = 100)`를 붙인다.

동작은 이렇다. 지연 로딩된 컬렉션 하나를 초기화할 때, Hibernate가 **아직 초기화되지 않은 같은 종류의 프록시들을 함께 모아 `IN` 절로 한 번에 조회**한다.

```sql
-- batch size 적용 전 (팀 10개 → 10번)
select * from member where team_id = 1;
select * from member where team_id = 2;
...

-- batch size = 100 적용 후 (1번)
select * from member where team_id in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
```

쿼리 수는 `1 + ceil(N / batchSize)`가 된다. N이 1000이고 batch size가 100이면 1 + 10 = 11번이다. 완전히 1번은 아니지만 1001번과는 비교가 안 된다.

**가장 큰 장점은 페이징과 자유롭게 같이 쓸 수 있다는 것이다.** 조인으로 행을 늘리는 게 아니라 별도 쿼리로 나눠 가져오기 때문에, 부모 쪽 페이징이 정확하게 동작한다. 데이터 중복 전송도 없다(fetch join은 팀 이름이 멤버 수만큼 반복해서 전송된다).

| | fetch join | batch size |
|---|---|---|
| 쿼리 수 | 1 | 1 + ceil(N / size) |
| 페이징 | 컬렉션은 불가 | 가능 |
| 데이터 중복 전송 | 있음(부모 컬럼이 반복됨) | 없음 |
| 컬렉션 2개 이상 | 불가(예외) | 가능 |
| 적용 방법 | 쿼리마다 명시 | 전역 설정 한 줄 |
| 그래서 언제 | 단건/소량 조회에서 확실히 함께 필요할 때 | 기본 전략. 특히 페이징이 있는 목록 조회 |

실무 기본 전략은 **"모든 연관관계 LAZY + `default_batch_fetch_size` 전역 설정"** 이고, 그 위에서 필요한 쿼리에만 fetch join을 얹는다.

---

## 5. 해결책 3: @EntityGraph

fetch join을 어노테이션으로 선언하는 방식이다. JPQL을 쓰지 않고도 메서드 이름 기반 쿼리에 붙일 수 있다는 게 장점이다.

```java
@EntityGraph(attributePaths = {"members"})
List<Team> findAll();          // 메서드 이름 기반 쿼리에도 적용된다

@EntityGraph(attributePaths = {"member", "delivery"})
@Query("select o from Order o where o.status = :status")
List<Order> findByStatus(@Param("status") OrderStatus status);
```

| | fetch join(JPQL) | `@EntityGraph` |
|---|---|---|
| 조인 방식 | 기본 INNER (`left join fetch`로 변경 가능) | LEFT OUTER |
| 작성 위치 | 쿼리 문자열 안 | 메서드 위 어노테이션 |
| 메서드 이름 쿼리에 적용 | 불가 | 가능 |
| 복잡한 조건/서브쿼리 | 자유롭게 작성 | JPQL과 조합해야 함 |
| 컬렉션 페이징 한계 | 있음 | **똑같이 있음** |

마지막 줄이 핵심이다. `@EntityGraph`는 내부적으로 fetch join과 같은 일을 하므로, **컬렉션에 적용하면 페이징 문제도 그대로 물려받는다.** "fetch join은 페이징이 안 되니 `@EntityGraph`를 쓰겠다"는 답변은 틀렸다.

---

## 6. MultipleBagFetchException

컬렉션을 두 개 이상 fetch join하면 애플리케이션 기동 시점에 이 예외가 난다.

```java
@Entity
public class Order {
    @OneToMany(mappedBy = "order")
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "order")
    private List<Coupon> coupons = new ArrayList<>();
}
```

```java
// org.hibernate.loader.MultipleBagFetchException:
//   cannot simultaneously fetch multiple bags
@Query("select o from Order o join fetch o.orderItems join fetch o.coupons")
List<Order> findAllBad();
```

**bag**은 Hibernate 용어로 **중복을 허용하고 순서가 없는 컬렉션**, 즉 `@OrderColumn` 없는 `List`를 뜻한다. 컬렉션 두 개를 동시에 조인하면 결과가 곱집합이 된다. 주문 항목 3개, 쿠폰 2개면 조인 결과는 6행이고, Hibernate는 이 6행에서 "원래 항목이 3개였는지 6개였는지" 복원할 수 없다. `List`는 중복을 허용하므로 잘못된 개수를 그대로 담아버릴 위험이 있어, 아예 예외로 막는다.

### 해결 방법 두 가지

**1) 하나를 `Set`으로 바꾼다**

```java
@OneToMany(mappedBy = "order")
private Set<Coupon> coupons = new LinkedHashSet<>();
```

`Set`은 중복을 허용하지 않으므로 곱집합으로 불어난 행이 자동으로 정리된다. 다만 컬렉션이 두 개 조인되면서 **SQL 결과 행 수 자체는 여전히 곱집합**이다. 두 컬렉션이 모두 크면 전송량이 폭발한다.

**2) 컬렉션 하나만 fetch join하고 나머지는 batch size로 (권장)**

```java
@Query("select distinct o from Order o join fetch o.orderItems")
List<Order> findAllWithItems();
// coupons 는 default_batch_fetch_size 설정에 맡긴다 → IN 절로 한 번에
```

곱집합이 생기지 않고 페이징 제약도 피할 수 있다. 컬렉션이 여러 개일 때는 이쪽이 정석이다.

---

## 7. 해결책 4: DTO로 직접 조회

읽기 전용 화면이라면 애초에 엔티티를 만들지 않는 선택지도 있다.

```java
@Query("select new com.example.dto.TeamSummary(t.id, t.name, count(m)) " +
       "from Team t left join t.members m " +
       "group by t.id, t.name")
List<TeamSummary> findSummaries();
```

필요한 컬럼만 SELECT하므로 전송량이 가장 적고, 지연 로딩 자체가 없으니 N+1도 없다. 대신 반환된 객체는 엔티티가 아니라서 변경 감지가 동작하지 않는다. **조회 전용 API에만** 쓴다.

---

## 8. 실무에서는

**N+1은 "발견"이 절반이다.** 로컬 개발 데이터로는 재현되지 않는 경우가 많으므로, SQL 로그를 켜 두고 쿼리 개수를 세는 습관이 필요하다.

```yaml
logging:
  level:
    org.hibernate.SQL: debug
```

테스트 코드에서 Hibernate의 `Statistics`로 실행된 쿼리 수를 검증하거나, `p6spy` 같은 도구로 요청당 쿼리 수를 로깅해 임계치를 넘으면 경고하도록 만들어 두는 팀도 많다.

**판단은 대체로 이 순서를 따른다.**

```
연관 데이터가 필요한가?
 ├── 아니오 → LAZY 그대로 둔다. 문제 없음.
 └── 예
      ├── 단건 조회이고 확실히 함께 쓴다      → fetch join / @EntityGraph
      ├── 목록 + 페이징이 필요하다
      │     ├── ToOne 관계                    → fetch join (행이 안 늘어남)
      │     └── 컬렉션                        → LAZY + batch size
      ├── 컬렉션이 두 개 이상이다             → 하나만 fetch join + 나머지 batch size
      └── 읽기 전용이고 필드 몇 개만 필요하다 → DTO 직접 조회
```

---

## 9. 면접 포인트

> 면접에서 이 주제가 나오면 이렇게 답한다

**Q. N+1 문제가 무엇인가요?**

A. 부모 엔티티 N건을 조회한 뒤, 각 엔티티의 연관 데이터를 채우기 위해 추가 쿼리가 N번 더 나가는 현상입니다. 지연 로딩에서는 연관 데이터에 처음 접근하는 시점에, 즉시 로딩에서는 JPQL 조회 직후에 발생합니다. 데이터가 늘수록 쿼리 수가 선형으로 증가하는 게 문제의 핵심입니다.
- 꼬리 질문: "즉시 로딩으로 바꾸면 해결되나요?" → 안 된다. JPQL은 작성된 대로 SQL로 나가고 그 뒤에 즉시 로딩 대상을 채우는 쿼리가 따로 나간다. 오히려 원인 추적만 어려워진다.

**Q. fetch join과 페이징을 함께 쓸 수 있나요?**

A. ToOne 관계는 가능하지만 컬렉션은 안 됩니다. 1:N을 조인하면 결과 행이 자식 기준으로 늘어나서, DB의 LIMIT이 "부모 몇 건"이 아니라 "조인 결과 몇 행"을 의미하게 되기 때문입니다. Hibernate는 이 경우 LIMIT을 걸지 않고 전체를 읽어 메모리에서 페이징하며 HHH000104 경고를 남기는데, 데이터가 많으면 OOM으로 이어집니다.
- 꼬리 질문: "그럼 어떻게 해결하나요?" → ToOne은 fetch join으로 가져오고 컬렉션은 LAZY로 두되 `default_batch_fetch_size`를 설정한다. IN 절로 묶여 조회되므로 쿼리 수도 줄고 페이징도 정확하다.

**Q. batch size는 어떤 원리로 쿼리를 줄이나요?**

A. 지연 로딩 대상을 하나 초기화할 때, 영속성 컨텍스트 안에서 아직 초기화되지 않은 같은 종류의 프록시들을 모아 IN 절 하나로 함께 조회합니다. 쿼리 수가 N에서 `ceil(N / batchSize)`로 줄어듭니다. 조인이 아니라 별도 쿼리라서 행이 늘어나지 않고, 그래서 페이징과도 충돌하지 않습니다.
- 꼬리 질문: "size는 얼마로 잡나요?" → 너무 크면 IN 절 파라미터가 많아져 실행 계획이나 파싱 비용에 영향을 줄 수 있으므로, 보통 수십~수백 범위에서 실제 데이터로 측정해 정한다.

**Q. `MultipleBagFetchException`은 왜 발생하나요?**

A. `@OrderColumn` 없는 `List`, 즉 bag 컬렉션을 두 개 이상 동시에 fetch join하면 조인 결과가 곱집합이 되어 원래 개수를 복원할 수 없습니다. Hibernate는 잘못된 데이터를 만드느니 예외로 막습니다. 해결은 하나를 `Set`으로 바꾸거나, 컬렉션 하나만 fetch join하고 나머지는 batch size에 맡기는 것입니다. 곱집합을 아예 만들지 않는 후자가 더 안전합니다.

---

## 자주 하는 실수

| 실수 | 왜 틀렸나 | 올바른 이해 |
|------|----------|-----------|
| EAGER로 바꿔 N+1을 해결하려 한다 | JPQL 조회에서는 여전히 추가 쿼리가 나가고, 원인 추적만 어려워진다 | 전부 LAZY로 두고 필요한 곳에서 함께 조회한다 |
| `@EntityGraph`면 컬렉션 페이징이 된다고 생각한다 | 내부적으로 fetch join과 같아서 제약도 동일하다 | 컬렉션 페이징은 batch size로 푼다 |
| 컬렉션 fetch join에 `distinct`를 안 붙인다 | 조인으로 부모가 자식 수만큼 중복될 수 있다 | `distinct`를 붙여 엔티티 중복을 제거한다 |
| batch size를 걸었으니 쿼리가 1번이라고 말한다 | `1 + ceil(N / size)`번이다 | 완전한 1번은 fetch join, batch size는 대폭 감소 |
| N+1이 있으면 무조건 고쳐야 한다고 생각한다 | 부모가 몇 건뿐이면 추가 쿼리 2~3번이 fetch join보다 나을 수도 있다 | 실제 데이터 규모를 보고 판단한다 |

---

## 한 줄 정리

N+1은 지연 로딩이 연관 데이터를 "필요할 때 하나씩" 가져오기 때문에 생기며, 함께 가져오면 되는 상황에는 fetch join, 페이징이나 컬렉션이 여러 개인 상황에는 batch size가 정답이다.

---

## 연관 개념

- [JPA와 ORM](./01-jpa-orm.md) - 연관관계 매핑과 fetch 전략
- [영속성 컨텍스트](./02-persistence-context.md) - 프록시와 지연 로딩 동작 원리
- [인덱싱과 B-Tree](./05-indexing-btree.md) - 쿼리 수를 줄인 다음 확인할 것
- [qna-database.md](./qna-database.md) - N+1과 Fetch Join 면접 질문
