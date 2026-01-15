# 데이터베이스 & JPA 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. JPA의 영속성 컨텍스트란 무엇이며, 어떤 이점이 있나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
영속성 컨텍스트는 엔티티를 영구 저장하는 환경으로, 애플리케이션과 데이터베이스 사이에서 **중재자** 역할을 합니다.

### 영속성 컨텍스트의 이점

| 이점 | 설명 |
|------|------|
| **1차 캐시** | 트랜잭션 내 조회한 엔티티를 메모리에 저장, 반복 조회 시 DB 접근 X |
| **동일성 보장** | 같은 트랜잭션 내에서 같은 ID로 조회한 객체는 동일 참조 (==) |
| **쓰기 지연** | 트랜잭션 커밋 시점까지 SQL을 모아서 한 번에 전송 |
| **변경 감지** | 엔티티 수정 시 자동으로 UPDATE 쿼리 생성 (Dirty Checking) |

### 엔티티 생명주기
```
비영속 (new) → 영속 (managed) → 준영속 (detached) → 삭제 (removed)
```

### 코드 예시
```java
// 변경 감지 (Dirty Checking)
User user = em.find(User.class, 1L);  // 영속 상태
user.setName("newName");  // 값만 변경
// em.update() 호출 필요 없음!
// 트랜잭션 커밋 시 자동으로 UPDATE 쿼리 실행
```

### 면접관이 주목하는 포인트
- 1차 캐시와 쓰기 지연의 성능 이점
- 변경 감지 동작 원리

</details>

---

## Q2. N+1 문제란 무엇이며, 어떻게 해결하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
N+1 문제는 연관된 엔티티를 조회할 때, 최초 쿼리(1) + 연관 엔티티 개수(N)만큼 추가 쿼리가 발생하는 현상입니다.

### 발생 예시
```java
// Team : Member = 1 : N
List<Team> teams = teamRepository.findAll();  // 1번 쿼리

for (Team team : teams) {
    team.getMembers().size();  // 각 팀마다 Members 조회 쿼리 (N번)
}
// 총 N+1번 쿼리 실행!
```

### 해결 방법

| 방법 | 설명 |
|------|------|
| **Fetch Join** | JPQL에서 `join fetch`로 한 번에 조회 |
| **@EntityGraph** | 어노테이션으로 Fetch Join 선언 |
| **Batch Size** | IN 절로 묶어서 조회 (hibernate.default_batch_fetch_size) |

### Fetch Join 예시
```java
@Query("SELECT t FROM Team t JOIN FETCH t.members")
List<Team> findAllWithMembers();
// 한 번의 쿼리로 Team + Members 모두 조회
```

### Batch Size 설정
```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```
```sql
-- N번 → 1번 (IN절)
SELECT * FROM member WHERE team_id IN (1, 2, 3, ..., 100)
```

### 면접관이 주목하는 포인트
- 실무에서 N+1 문제 발견 및 해결 경험
- Fetch Join의 한계 (페이징 문제)

### 꼬리 질문 대비
- "Fetch Join과 페이징을 함께 사용할 수 있나요?"
  → 컬렉션 Fetch Join 시 페이징 불가 (메모리에서 처리 → 위험)
  → 해결: @BatchSize 사용 또는 쿼리 분리

</details>

---

## Q3. 트랜잭션 격리 수준에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
격리 수준은 동시에 실행되는 트랜잭션 간 데이터 가시성을 정의합니다.

### 격리 수준 비교

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read |
|----------|:----------:|:-------------------:|:------------:|
| READ_UNCOMMITTED | O | O | O |
| READ_COMMITTED | X | O | O |
| REPEATABLE_READ | X | X | O |
| SERIALIZABLE | X | X | X |

### 용어 설명
- **Dirty Read**: 커밋되지 않은 데이터 읽기
- **Non-Repeatable Read**: 같은 조회에서 다른 결과
- **Phantom Read**: 같은 범위 조회에서 새 행 발견

### MySQL 기본값
- InnoDB: REPEATABLE_READ
- MVCC로 Phantom Read도 대부분 방지

### 면접관이 주목하는 포인트
- 각 격리 수준의 문제점
- 실무에서의 선택 기준

</details>

---

## Q4. 인덱스란 무엇이며, B-Tree 구조를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
인덱스는 데이터베이스 검색 속도를 향상시키는 자료구조입니다. 대부분의 RDBMS는 **B-Tree(B+Tree)** 구조를 사용합니다.

### B-Tree 특징
- 데이터가 정렬된 상태로 유지
- 균형 트리 → O(log n) 검색
- 범위 검색, 정렬에 유리

### 인덱스 사용 시 주의사항

**인덱스가 효과적인 경우:**
- WHERE 조건에 자주 사용되는 컬럼
- 카디널리티(중복도)가 낮은 컬럼 (유니크한 값이 많음)
- JOIN, ORDER BY에 사용되는 컬럼

**인덱스가 비효율적인 경우:**
- 카디널리티가 높은 컬럼 (성별 등)
- 데이터 변경이 빈번한 테이블 (INSERT/UPDATE/DELETE 성능 저하)

### 면접관이 주목하는 포인트
- 인덱스를 무조건 거는 것이 좋지 않은 이유
- 복합 인덱스 순서의 중요성

### 꼬리 질문 대비
- "복합 인덱스 (a, b, c)가 있을 때, WHERE b = ? 조건은 인덱스를 탈까요?"
  → 아니요. 선두 컬럼(a) 조건이 없으면 인덱스 사용 불가

</details>

---

## Q5. JPA에서 지연 로딩(Lazy Loading)과 즉시 로딩(Eager Loading)의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Lazy Loading | Eager Loading |
|------|--------------|---------------|
| 시점 | 실제 사용 시 로딩 | 엔티티 조회 시 함께 로딩 |
| 프록시 | 사용 | 사용 안 함 |
| N+1 | 발생 가능 | 발생 가능 |
| 기본값 | @ManyToOne: EAGER | @OneToMany: LAZY |

### 권장 설정
```java
@ManyToOne(fetch = FetchType.LAZY)  // 항상 LAZY 권장
@OneToMany(fetch = FetchType.LAZY)  // 기본값
```

### 지연 로딩의 장점
- 필요한 데이터만 조회하여 성능 최적화
- 불필요한 JOIN 방지

### 주의사항
- 트랜잭션 외부에서 Lazy 엔티티 접근 시 LazyInitializationException
- N+1 문제 해결: Fetch Join, @EntityGraph, BatchSize

### 면접관이 주목하는 포인트
- 실무에서 기본적으로 LAZY를 사용하는 이유
- Lazy 로딩 프록시의 동작 원리

</details>

---

## Q6. JPQL과 QueryDSL의 차이점은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | JPQL | QueryDSL |
|------|------|----------|
| 형태 | 문자열 | 자바 코드 |
| 타입 안전성 | 런타임 에러 | 컴파일 에러 |
| 동적 쿼리 | 복잡 | 간편 |
| 학습 곡선 | 낮음 | 중간 |

### QueryDSL 장점
```java
// 동적 쿼리가 깔끔함
BooleanBuilder builder = new BooleanBuilder();
if (name != null) {
    builder.and(user.name.eq(name));
}
if (age != null) {
    builder.and(user.age.eq(age));
}
return queryFactory.selectFrom(user)
    .where(builder)
    .fetch();
```

### 면접관이 주목하는 포인트
- 실무에서 QueryDSL 사용 경험
- 복잡한 동적 쿼리 처리 방법

</details>

---

## Q7. 관계형 데이터베이스의 구성요소를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구성요소 | 설명 |
|---------|------|
| 테이블 (Table) | 행과 열로 구성된 데이터 집합 |
| 행 (Row/Tuple) | 하나의 레코드, 데이터 단위 |
| 열 (Column/Attribute) | 데이터의 속성 |
| 스키마 (Schema) | 테이블 구조 정의 |
| 도메인 (Domain) | 속성이 가질 수 있는 값의 범위 |

### 관계형 데이터베이스 특징
- **정형 데이터**: 스키마에 맞는 구조화된 데이터
- **ACID 보장**: 트랜잭션 안정성
- **SQL 사용**: 표준 질의 언어
- **관계 표현**: 외래키로 테이블 간 관계 정의

### 면접관이 주목하는 포인트
- 릴레이션, 튜플, 속성 등 용어 이해
- 관계형 DB vs NoSQL 비교

</details>

---

## Q8. 데이터베이스 Key의 종류를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| Key 종류 | 설명 |
|---------|------|
| 슈퍼키 (Super Key) | 유일성을 만족하는 속성 집합 |
| 후보키 (Candidate Key) | 유일성 + 최소성을 만족 |
| 기본키 (Primary Key) | 후보키 중 선택된 대표 키 |
| 대체키 (Alternate Key) | 기본키가 아닌 후보키 |
| 외래키 (Foreign Key) | 다른 테이블의 기본키 참조 |

### 예시
```sql
-- users 테이블
CREATE TABLE users (
    id BIGINT PRIMARY KEY,           -- 기본키
    email VARCHAR(100) UNIQUE,       -- 후보키 (대체키)
    phone VARCHAR(20) UNIQUE,        -- 후보키 (대체키)
    department_id BIGINT REFERENCES departments(id)  -- 외래키
);
```

### Key 특성

| 특성 | 설명 |
|------|------|
| 유일성 | 튜플을 유일하게 식별 |
| 최소성 | 꼭 필요한 속성만 포함 |
| NOT NULL | 기본키는 NULL 불가 |

### 면접관이 주목하는 포인트
- 후보키와 기본키의 관계
- 복합키 사용 시 주의점

</details>

---

## Q9. ACID란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
ACID는 트랜잭션이 안전하게 수행되기 위한 4가지 속성입니다.

| 속성 | 의미 | 설명 |
|------|------|------|
| Atomicity | 원자성 | 전부 실행 또는 전부 취소 |
| Consistency | 일관성 | 실행 전후 DB 일관성 유지 |
| Isolation | 격리성 | 동시 트랜잭션 간 간섭 방지 |
| Durability | 지속성 | 커밋된 결과는 영구 보존 |

### 상세 설명

**Atomicity (원자성)**
```sql
-- 계좌 이체: 둘 다 성공 OR 둘 다 취소
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- 또는 ROLLBACK
```

**Isolation (격리성)**
- 격리 수준으로 조절 (READ_COMMITTED, REPEATABLE_READ 등)
- 높은 격리 → 안전하지만 성능 저하

### 면접관이 주목하는 포인트
- 각 속성의 실제 의미
- 격리성과 성능의 Trade-off

</details>

---

## Q10. NoSQL이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
NoSQL(Not Only SQL)은 비관계형 데이터베이스로, 유연한 스키마와 수평적 확장성을 제공합니다.

### NoSQL 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| Key-Value | 키-값 쌍 저장 | Redis, DynamoDB |
| Document | JSON 문서 저장 | MongoDB, CouchDB |
| Column-Family | 열 기반 저장 | Cassandra, HBase |
| Graph | 노드-관계 저장 | Neo4j |

### RDBMS vs NoSQL

| 구분 | RDBMS | NoSQL |
|------|-------|-------|
| 스키마 | 고정 | 유연 |
| 확장 | 수직 (Scale-Up) | 수평 (Scale-Out) |
| 일관성 | 강한 일관성 | 최종 일관성 |
| 트랜잭션 | ACID | BASE |
| 사용 사례 | 금융, 회계 | 빅데이터, 실시간 |

### BASE 속성
- **Basically Available**: 기본적 가용성
- **Soft-state**: 시간에 따라 상태 변경 가능
- **Eventually consistent**: 최종적 일관성

### 면접관이 주목하는 포인트
- 언제 NoSQL을 선택하는지
- CAP 정리와의 관계

</details>

---

## Q11. DDL, DML, DCL에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 분류 | 의미 | 명령어 |
|------|------|--------|
| DDL | Data Definition Language | CREATE, ALTER, DROP, TRUNCATE |
| DML | Data Manipulation Language | SELECT, INSERT, UPDATE, DELETE |
| DCL | Data Control Language | GRANT, REVOKE |
| TCL | Transaction Control Language | COMMIT, ROLLBACK, SAVEPOINT |

### DDL (데이터 정의어)
```sql
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));
ALTER TABLE users ADD email VARCHAR(100);
DROP TABLE users;
TRUNCATE TABLE users;  -- 데이터만 삭제 (구조 유지)
```

### DML (데이터 조작어)
```sql
INSERT INTO users VALUES (1, 'Kim');
SELECT * FROM users WHERE id = 1;
UPDATE users SET name = 'Lee' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

### DCL (데이터 제어어)
```sql
GRANT SELECT ON users TO developer;
REVOKE SELECT ON users FROM developer;
```

### 면접관이 주목하는 포인트
- DELETE vs TRUNCATE 차이
- DDL은 Auto Commit

</details>

---

## Q12. 정규화(1NF, 2NF, 3NF)에 대해 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
정규화는 데이터 중복을 최소화하고 무결성을 보장하기 위해 테이블을 분해하는 과정입니다.

### 정규화 단계

| 단계 | 조건 |
|------|------|
| 1NF | 원자값만 포함 (다중 값 X) |
| 2NF | 1NF + 부분 함수 종속 제거 |
| 3NF | 2NF + 이행 함수 종속 제거 |
| BCNF | 모든 결정자가 후보키 |

### 1NF 예시
```
[비정규형]
학생 | 수강과목
홍길동 | 수학, 영어, 과학  ← 다중 값

[1NF]
학생 | 수강과목
홍길동 | 수학
홍길동 | 영어
홍길동 | 과학
```

### 2NF 예시
```
[1NF - 부분 함수 종속]
(학생ID, 과목코드) → 성적, 학생이름
  └─ 학생ID → 학생이름 (부분 종속)

[2NF]
학생(학생ID, 학생이름)
성적(학생ID, 과목코드, 성적)
```

### 3NF 예시
```
[2NF - 이행 함수 종속]
학생ID → 학과코드 → 학과명

[3NF]
학생(학생ID, 학과코드)
학과(학과코드, 학과명)
```

### 면접관이 주목하는 포인트
- 정규화의 장단점 (중복 감소 vs JOIN 증가)
- 실무에서의 비정규화 사례

</details>

---

## Q13. ORM이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
ORM(Object-Relational Mapping)은 객체와 관계형 데이터베이스 테이블을 매핑하여 SQL 없이 데이터를 다룰 수 있게 하는 기술입니다.

### ORM 예시

| 언어 | ORM |
|------|-----|
| Java | JPA (Hibernate) |
| Python | SQLAlchemy, Django ORM |
| Node.js | TypeORM, Prisma |
| Ruby | ActiveRecord |

### 장단점

| 장점 | 단점 |
|------|------|
| SQL 작성 감소 | 학습 곡선 |
| 객체 중심 개발 | 복잡한 쿼리 한계 |
| DB 독립성 | 성능 튜닝 어려움 |
| 보안 (SQL Injection 방지) | N+1 문제 발생 가능 |

### 매핑 예시 (JPA)
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}
```

### 면접관이 주목하는 포인트
- ORM 사용 시 주의할 점 (N+1, Lazy Loading)
- Native Query 필요한 경우

</details>

---

## 학습 체크리스트

- [ ] 영속성 컨텍스트 4가지 이점 설명 가능
- [ ] N+1 문제 원인과 해결 방법 3가지 이상 알기
- [ ] 트랜잭션 격리 수준 4가지와 발생 가능 문제 암기
- [ ] 인덱스 B-Tree 구조와 사용 주의사항 이해
- [ ] Lazy/Eager 로딩 차이와 권장 설정 알기
- [ ] 관계형 DB 구성요소와 Key 종류 설명 가능
- [ ] ACID 속성 설명 가능
- [ ] NoSQL 유형과 사용 사례 이해
- [ ] DDL, DML, DCL 구분 가능
- [ ] 정규화 1NF, 2NF, 3NF 설명 가능
- [ ] ORM 장단점 이해
