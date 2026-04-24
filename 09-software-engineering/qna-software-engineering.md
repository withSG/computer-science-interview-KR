# 소프트웨어 공학 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 애자일(Agile) 방법론이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
애자일은 **짧은 주기의 반복적 개발**을 통해 변화에 빠르게 대응하는 개발 방법론입니다.

### 애자일 원칙

```
- 프로세스보다 개인과 상호작용
- 문서보다 작동하는 소프트웨어
- 계약보다 고객 협력
- 계획보다 변화 대응
```

### Scrum vs Kanban

| 구분 | Scrum | Kanban |
|------|-------|--------|
| 반복 | 스프린트 (2-4주) | 연속적 |
| 역할 | PO, SM, Team | 없음 |
| 변경 | 스프린트 중 고정 | 언제든 가능 |
| 측정 | 번다운 차트 | 리드 타임 |

### Scrum 이벤트

```
- Sprint Planning: 작업 계획
- Daily Standup: 15분 공유
- Sprint Review: 결과 데모
- Retrospective: 회고
```

</details>

---

## Q2. TDD(Test-Driven Development)란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
TDD는 **테스트를 먼저 작성하고 코드를 구현**하는 개발 방법입니다.

### TDD 사이클 (Red-Green-Refactor)

```
1. Red: 실패하는 테스트 작성
2. Green: 테스트 통과하는 최소 코드 작성
3. Refactor: 코드 개선 (테스트 유지)
```

### 예시

```python
# 1. Red - 실패하는 테스트
def test_add():
    assert add(1, 2) == 3  # NameError: add 없음

# 2. Green - 통과하는 코드
def add(a, b):
    return a + b

# 3. Refactor - 필요시 개선
```

### TDD 장점

- 설계 개선 (테스트 가능한 코드)
- 회귀 방지
- 문서화 역할
- 자신감 있는 리팩토링

### 면접관이 주목하는 포인트
- TDD 실제 경험
- 장단점 인식

</details>

---

## Q3. 테스트 종류에는 어떤 것이 있나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 테스트 피라미드

```
        /\
       /  \     E2E Test (적음)
      /----\
     /      \   Integration Test
    /--------\
   /          \  Unit Test (많음)
  --------------
```

### 테스트 종류

| 종류 | 범위 | 속도 | 비용 |
|------|------|------|------|
| Unit | 함수/클래스 | 빠름 | 낮음 |
| Integration | 모듈 간 연동 | 중간 | 중간 |
| E2E | 전체 시스템 | 느림 | 높음 |

### 예시

```python
# Unit Test
def test_calculate_total():
    assert calculate_total([10, 20]) == 30

# Integration Test
def test_user_creation():
    user = UserService.create({"name": "test"})
    assert UserRepository.find(user.id) is not None

# E2E Test
def test_checkout_flow():
    driver.get("/shop")
    driver.find_element(By.ID, "add-to-cart").click()
    driver.find_element(By.ID, "checkout").click()
    assert "주문 완료" in driver.page_source
```

</details>

---

## Q4. CI/CD란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 용어 | 설명 |
|------|------|
| CI (Continuous Integration) | 코드 변경을 자주 통합, 자동 빌드/테스트 |
| CD (Continuous Delivery) | 언제든 배포 가능한 상태 유지 |
| CD (Continuous Deployment) | 자동 프로덕션 배포 |

### CI/CD 파이프라인 예시

```yaml
# GitHub Actions
name: CI/CD

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: ./deploy.sh
```

### CI/CD 이점

```
- 빠른 피드백
- 버그 조기 발견
- 배포 자동화
- 일관된 품질
```

</details>

---

## Q5. 코드 리뷰의 목적은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
코드 리뷰는 **코드 품질 향상과 지식 공유**를 위한 협업 프로세스입니다.

### 리뷰 포인트

```
- 로직 정확성
- 코드 스타일 일관성
- 성능 문제
- 보안 취약점
- 테스트 커버리지
- 가독성
```

### 좋은 리뷰어

```
- 구체적인 피드백 제공
- 질문 형태로 제안
- 긍정적인 부분도 언급
- 적시에 리뷰
```

</details>

---

## Q6. KISS 원칙이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
KISS(Keep It Simple, Stupid)는 **가능한 한 단순하게 설계**해야 한다는 소프트웨어 원칙입니다.

### 핵심 개념
```
복잡한 해결책보다 단순한 해결책이 더 좋다
- 유지보수 용이
- 버그 감소
- 이해하기 쉬움
```

### KISS 위반 예시
```python
# 복잡한 코드 (KISS 위반)
def is_even(n):
    return n % 2 == 0 if n >= 0 else (n * -1) % 2 == 0

# 단순한 코드 (KISS 준수)
def is_even(n):
    return n % 2 == 0
```

### 관련 원칙들

| 원칙 | 의미 |
|------|------|
| KISS | 단순하게 유지 |
| YAGNI | 필요없는 것은 만들지 말기 |
| DRY | 반복하지 않기 |
| SOLID | 객체지향 설계 원칙 |

### 면접관이 주목하는 포인트
- 과도한 추상화/설계의 문제점 인식
- 언제 단순함을 선택하는지

</details>

---

## Q7. 브룩스의 법칙(Brooks' Law)이란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
> "지연되고 있는 프로젝트에 인력을 추가하면 더 늦어진다"
> — Fred Brooks, 《The Mythical Man-Month》

### 이유

**1. 온보딩 비용**
```
새로운 인력의 학습 시간
- 코드베이스 이해
- 도메인 지식 습득
- 팀 프로세스 적응
```

**2. 커뮤니케이션 오버헤드**
```
인원 수(n)에 따른 커뮤니케이션 채널: n(n-1)/2

4명: 6채널
5명: 10채널
6명: 15채널
```

**3. 작업 분할 한계**
- 모든 작업이 병렬화 가능하지 않음
- 순차적 의존성 존재

### 해결 방안
- 초기 단계에서 적절한 인력 투입
- 작은 자율적 팀 구성
- 명확한 인터페이스와 책임 분리

### 면접관이 주목하는 포인트
- 소프트웨어 프로젝트 관리 이해
- 팀 규모와 생산성 관계

</details>

---

## Q8. 테스트 종류(시스템 테스트, 인수 테스트)를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 테스트 | 수행 주체 | 목적 | 시점 |
|--------|----------|------|------|
| 단위 테스트 | 개발자 | 함수/클래스 검증 | 개발 중 |
| 통합 테스트 | 개발자/QA | 모듈 연동 검증 | 개발 후 |
| 시스템 테스트 | QA | 전체 시스템 검증 | 통합 후 |
| 인수 테스트 | 고객/사용자 | 요구사항 충족 확인 | 배포 전 |

### 시스템 테스트 (System Testing)
```
전체 시스템이 요구사항대로 동작하는지 검증
- 기능 테스트
- 성능 테스트
- 보안 테스트
- 스트레스 테스트
```

### 인수 테스트 (Acceptance Testing)
```
고객 관점에서 비즈니스 요구사항 충족 확인
- 알파 테스트: 개발사 내부
- 베타 테스트: 실제 사용자
- UAT: 최종 사용자 승인
```

### 인수 테스트 예시 (Gherkin)
```gherkin
Feature: 사용자 로그인

Scenario: 올바른 자격증명으로 로그인
  Given 사용자가 로그인 페이지에 있다
  When 올바른 이메일과 비밀번호를 입력한다
  And 로그인 버튼을 클릭한다
  Then 대시보드 페이지로 이동한다
```

### V-모델
```
요구사항 분석 ←――――――――――→ 인수 테스트
      ↓                      ↑
   시스템 설계 ←―――――――→ 시스템 테스트
        ↓                  ↑
    상세 설계 ←――――――→ 통합 테스트
          ↓              ↑
        코딩 ←――――→ 단위 테스트
```

### 면접관이 주목하는 포인트
- 각 테스트 단계의 목적 차이
- 실무에서의 테스트 전략

</details>

---

## Q9. 테스트 코드를 작성해야 하는 이유는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
테스트 코드는 **코드의 정확성을 보장하고, 변경에 대한 자신감을 주며, 문서 역할**을 합니다.

### 테스트 코드의 이점

| 이점 | 설명 |
|------|------|
| 회귀 방지 | 기존 기능이 깨지지 않음을 보장 |
| 리팩토링 안정성 | 코드 변경 후 검증 자동화 |
| 문서화 | 코드 사용법을 예제로 제공 |
| 설계 개선 | 테스트하기 쉬운 구조로 유도 |
| 디버깅 시간 단축 | 문제 발생 시 빠른 원인 파악 |

### 테스트가 없는 경우의 문제점

```
❌ 수동 테스트에 의존 → 시간 소모, 휴먼 에러
❌ 리팩토링 두려움 → 기술 부채 증가
❌ 배포 불안감 → 릴리즈 지연
❌ 버그 재발 → 같은 문제 반복
```

### 테스트 코드의 비용 vs 가치

```
초기 비용: 테스트 작성 시간
장기 가치:
  - 수동 테스트 시간 절약
  - 버그 수정 비용 감소
  - 유지보수 비용 절감

→ 프로젝트가 길어질수록 테스트의 ROI가 증가
```

### 테스트 작성 우선순위

```
1. 핵심 비즈니스 로직
2. 버그가 자주 발생하는 코드
3. 복잡한 알고리즘
4. 외부 시스템 연동부
5. 자주 변경되는 코드
```

### 면접관이 주목하는 포인트
- 테스트 작성 경험과 그 효과
- 테스트 작성을 어렵게 만드는 코드 패턴 인식

### 꼬리 질문 대비
- "테스트 코드 작성이 개발 속도를 늦추지 않나요?"
  → 초기에는 시간이 더 걸리지만, 버그 수정 및 수동 테스트 시간을 줄여 전체적으로는 빨라짐

</details>

---

## Q10. 테스트 커버리지란 무엇이며 어느 정도가 적절한가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
테스트 커버리지는 **테스트가 코드의 얼마나 많은 부분을 실행하는지 측정하는 지표**입니다. 100%가 목표가 아니라, **핵심 로직에 대한 의미 있는 테스트**가 중요합니다.

### 커버리지 종류

| 종류 | 설명 | 예시 |
|------|------|------|
| Line Coverage | 실행된 코드 라인 비율 | 10줄 중 8줄 실행 = 80% |
| Branch Coverage | 분기(if/else) 실행 비율 | 4개 분기 중 3개 실행 = 75% |
| Function Coverage | 호출된 함수 비율 | 5개 함수 중 4개 호출 = 80% |
| Statement Coverage | 실행된 문장 비율 | 모든 구문 실행 여부 |

### 커버리지 측정 예시

```java
// 테스트 대상 코드
public int divide(int a, int b) {
    if (b == 0) {           // 분기 1
        throw new IllegalArgumentException();
    }
    return a / b;           // 분기 2
}

// 테스트 코드 (분기 2만 테스트)
@Test
void testDivide() {
    assertEquals(2, divide(4, 2));
}
// Line: 66%, Branch: 50%
```

### 적정 커버리지 수준

```
일반적인 권장: 70-80%
핵심 비즈니스 로직: 90% 이상
유틸리티/인프라 코드: 60-70%

⚠️ 주의: 높은 커버리지 ≠ 좋은 테스트
```

### 커버리지의 한계

```
✗ 테스트 품질을 보장하지 않음
✗ 모든 엣지 케이스 검증 불가
✗ 비즈니스 로직 정확성과 무관할 수 있음

예: 아래 테스트는 100% 커버리지지만 무의미
@Test
void badTest() {
    calculate(1, 2);  // assertion 없음
}
```

### 커버리지보다 중요한 것

```
1. 의미 있는 assertion
2. 경계값 테스트
3. 실패 케이스 테스트
4. 비즈니스 시나리오 커버
5. 버그 발생 시 회귀 테스트 추가
```

### 면접관이 주목하는 포인트
- 커버리지 수치에 집착하지 않는 균형잡힌 시각
- 의미 있는 테스트의 기준 이해

### 꼬리 질문 대비
- "100% 커버리지를 목표로 해야 하나요?"
  → 비용 대비 효과를 고려해야 함. getter/setter, 간단한 위임 코드까지 테스트하는 것은 비효율적

</details>

---

## Q11. 클린 코드(Clean Code)의 원칙과 리팩토링의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
**클린 코드**는 처음부터 읽기 쉽고 유지보수하기 쉽게 코드를 작성하는 것이고, **리팩토링**은 이미 작성된 코드의 동작을 바꾸지 않고 내부 구조를 개선하는 것입니다.

### 클린 코드 핵심 원칙

#### 1. 의미 있는 이름 (Meaningful Names)
```java
// ❌ 나쁜 예
int d;  // 경과 일수
List<int[]> list1;

// ✅ 좋은 예
int elapsedTimeInDays;
List<int[]> gameBoard;
```

#### 2. 함수는 한 가지만 (Single Responsibility)
```java
// ❌ 나쁜 예: 여러 역할
void emailAndUpdateDB(User user) {
    sendEmail(user.email, "Welcome!");
    updateUserStatus(user, "ACTIVE");
    logActivity(user.id);
}

// ✅ 좋은 예: 각각 분리
void sendWelcomeEmail(User user) { ... }
void activateUser(User user) { ... }
void logUserActivity(User user) { ... }
```

#### 3. 주석은 코드가 설명 못하는 WHY만
```java
// ❌ 나쁜 주석: 코드를 반복
// 나이를 1 증가시킴
age++;

// ✅ 좋은 주석: 이유(WHY) 설명
// 생일 당일 자정에 나이가 바뀌도록 +1
if (today.equals(birthday)) age++;
```

#### 4. 오류 처리 (Error Handling)
```java
// ❌ 예외 무시
try { doSomething(); } catch (Exception e) {}

// ✅ 의미 있는 예외 처리
try {
    doSomething();
} catch (IOException e) {
    log.error("파일 처리 실패: {}", e.getMessage());
    throw new FileProcessException("처리 중 오류 발생", e);
}
```

#### 5. 중복 제거 (DRY - Don't Repeat Yourself)
```java
// ❌ 중복 코드
void validateUser(User user) {
    if (user.name == null || user.name.isEmpty()) throw new ...;
}
void validateAdmin(Admin admin) {
    if (admin.name == null || admin.name.isEmpty()) throw new ...;
}

// ✅ 추출로 중복 제거
void validateName(String name) {
    if (name == null || name.isEmpty())
        throw new IllegalArgumentException("이름 필수");
}
```

### 클린 코드 vs 리팩토링

| 구분 | 클린 코드 | 리팩토링 |
|------|---------|---------|
| 시점 | 처음부터 | 이미 있는 코드를 나중에 |
| 목표 | 읽기 쉬운 코드 작성 | 기존 코드 구조 개선 |
| 동작 변경 | - | 절대 변경하지 않음 |
| 전제 조건 | - | 테스트 코드 있어야 안전 |

### 리팩토링 대상 코드 냄새 (Code Smell)

```
- 중복 코드 (Duplicated Code)
- 긴 메서드 (Long Method): 20줄 이상 → 분리 고려
- 큰 클래스 (Large Class): 너무 많은 책임
- 긴 파라미터 목록 (Long Parameter List): 4개 이상
- 주석이 많은 코드: 코드 자체가 설명되어야
```

### 면접관이 주목하는 포인트
- 클린 코드가 단순히 스타일 문제가 아님 (가독성 → 유지보수성 → 비용 절감)
- 리팩토링 전 테스트 코드가 필요한 이유

### 꼬리 질문 대비
- "클린 코드와 SOLID의 관계는?" → SOLID 원칙을 따르면 자연스럽게 클린 코드 달성 (단일 책임=함수 분리, 개방폐쇄=확장 가능한 구조)

</details>

---

## Q12. 함수형 프로그래밍(Functional Programming)의 특징은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
함수형 프로그래밍은 **순수 함수(Pure Function)와 불변성(Immutability)을 중심**으로 부수 효과(Side Effect)를 최소화하는 프로그래밍 패러다임입니다.

### 핵심 개념

#### 1. 순수 함수 (Pure Function)
```javascript
// ❌ 순수하지 않은 함수: 외부 상태에 의존
let count = 0;
function addCount() {
    count++;  // 외부 상태 변경 (Side Effect)
    return count;
}

// ✅ 순수 함수: 동일 입력 → 항상 동일 출력, 부수 효과 없음
function add(a, b) {
    return a + b;
}
```

#### 2. 불변성 (Immutability)
```javascript
// ❌ 변경 가능 (Mutable)
const arr = [1, 2, 3];
arr.push(4);  // 원본 수정

// ✅ 불변 (Immutable): 새 배열 반환
const arr = [1, 2, 3];
const newArr = [...arr, 4];  // 원본 유지
```

#### 3. 고차 함수 (Higher-Order Function)
```javascript
// 함수를 인자로 받거나 함수를 반환하는 함수

// map: 각 원소를 변환
[1, 2, 3].map(x => x * 2);  // [2, 4, 6]

// filter: 조건에 맞는 원소만
[1, 2, 3, 4].filter(x => x % 2 === 0);  // [2, 4]

// reduce: 하나의 값으로 축약
[1, 2, 3, 4].reduce((acc, x) => acc + x, 0);  // 10

// 함수를 반환하는 함수 (커링)
const multiply = a => b => a * b;
const double = multiply(2);
double(5);  // 10
```

#### 4. 함수 합성 (Function Composition)
```javascript
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const add1 = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = compose(square, double, add1);
transform(3);  // square(double(add1(3))) = square(double(4)) = square(8) = 64
```

### OOP vs FP 비교

| 구분 | OOP | FP |
|------|-----|-----|
| 핵심 단위 | 객체 (데이터 + 메서드) | 함수 |
| 상태 | 변경 가능 (Mutable) | 불변 (Immutable) |
| 부수 효과 | 허용 | 최소화 |
| 동시성 | Race Condition 가능 | 안전 (공유 상태 없음) |

### 실무 활용 (Java Stream API)
```java
// 함수형 스타일로 데이터 처리
List<String> result = employees.stream()
    .filter(e -> e.getSalary() > 5000)    // 필터
    .map(Employee::getName)                 // 변환
    .sorted()                               // 정렬
    .collect(Collectors.toList());          // 수집
```

### 면접관이 주목하는 포인트
- 순수 함수가 테스트하기 쉬운 이유 (입력만으로 결과 예측 가능)
- 불변성이 멀티스레드 환경에서 안전한 이유

### 꼬리 질문 대비
- "함수형 프로그래밍이 모든 상황에 적합한가?" → 아니다. 복잡한 상태 관리, 엔터프라이즈 도메인 모델링에는 OOP가 적합. 실무는 OOP+FP 혼합 사용

</details>

---

## Q13. MSA(마이크로서비스 아키텍처)란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
MSA는 **하나의 애플리케이션을 독립적으로 배포 가능한 작은 서비스들의 집합**으로 구성하는 아키텍처 패턴입니다. 각 서비스는 특정 비즈니스 기능을 담당하고 API로 통신합니다.

### 모놀리식 vs MSA

| 구분 | 모놀리식 | MSA |
|------|---------|-----|
| 구조 | 단일 배포 단위 | 독립 서비스들의 집합 |
| 배포 | 전체 재배포 | 서비스별 독립 배포 |
| 기술 스택 | 단일 | 서비스별 최적 기술 선택 가능 |
| 확장 | 전체 Scale Out | 필요한 서비스만 Scale Out |
| 장애 격리 | 전체에 영향 | 서비스 단위 격리 |
| 복잡도 | 낮음 | 높음 (분산 시스템) |
| 초기 개발 | 빠름 | 느림 |

### MSA 구성 요소

```
클라이언트
    │
    ▼
API Gateway (단일 진입점, 인증/라우팅)
    │
    ├──→ 사용자 서비스 (User Service)
    │         │
    │         └── User DB
    │
    ├──→ 주문 서비스 (Order Service)
    │         │
    │         └── Order DB
    │
    ├──→ 결제 서비스 (Payment Service)
    │         │
    │         └── Payment DB
    │
    └──→ 알림 서비스 (Notification Service)
              │
              Message Queue (Kafka/RabbitMQ)
```

### 서비스 간 통신

```
동기 통신: REST API, gRPC
  → 즉시 응답 필요한 경우
  → 단점: 서비스 간 강결합, 장애 전파 가능

비동기 통신: Message Queue (Kafka, RabbitMQ)
  → 느슨한 결합, 높은 가용성
  → 단점: 최종 일관성, 디버깅 어려움
```

### MSA 주요 패턴

| 패턴 | 목적 |
|------|------|
| API Gateway | 단일 진입점, 인증/로드밸런싱 |
| Service Discovery | 서비스 위치 동적 등록/조회 (Eureka) |
| Circuit Breaker | 장애 전파 차단 (Resilience4j) |
| Saga | 분산 트랜잭션 관리 |
| CQRS | 읽기/쓰기 모델 분리 |

### 언제 MSA를 선택하는가?

```
MSA 도입 시기:
  ✓ 팀 규모가 크고 독립적 배포가 필요
  ✓ 서비스별 다른 기술 스택이 필요
  ✓ 특정 기능만 집중적으로 확장 필요
  ✓ 장애 격리가 중요한 경우

모놀리식이 적합한 경우:
  ✓ 소규모 팀, 초기 스타트업
  ✓ 도메인이 아직 명확하지 않음
  ✓ 분산 시스템 운영 역량 부족
  → 먼저 모놀리식으로 시작, 성장 후 MSA로 전환 (Strangler Fig 패턴)
```

### 면접관이 주목하는 포인트
- MSA의 장점만이 아니라 단점(분산 트랜잭션, 네트워크 지연, 운영 복잡도)도 알고 있는지
- 트레이드오프 고려: 서비스 크기, 팀 구조, 기술 성숙도

### 꼬리 질문 대비
- "MSA에서 트랜잭션은 어떻게 관리하나요?" → ACID 트랜잭션 불가. Saga 패턴(Choreography/Orchestration)으로 각 서비스가 로컬 트랜잭션 후 이벤트 발행, 실패 시 보상 트랜잭션

</details>

---

## 학습 체크리스트

- [ ] 애자일 원칙과 Scrum 이해
- [ ] TDD 사이클 설명 가능
- [ ] 테스트 피라미드 이해
- [ ] CI/CD 개념과 이점 알기
- [ ] 코드 리뷰 목적 설명 가능
- [ ] KISS 원칙과 관련 원칙들 설명 가능
- [ ] 브룩스의 법칙 이해
- [ ] 시스템 테스트와 인수 테스트 구분 가능
- [ ] 테스트 코드 작성 이유 설명 가능
- [ ] 테스트 커버리지 개념과 적정 수준 이해
- [ ] 클린 코드 핵심 원칙과 리팩토링 차이 설명 가능
- [ ] 함수형 프로그래밍의 순수 함수, 불변성, 고차 함수 개념 이해
- [ ] MSA와 모놀리식 아키텍처 비교 및 트레이드오프 설명 가능
