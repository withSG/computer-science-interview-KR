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

## 학습 체크리스트

- [ ] 애자일 원칙과 Scrum 이해
- [ ] TDD 사이클 설명 가능
- [ ] 테스트 피라미드 이해
- [ ] CI/CD 개념과 이점 알기
- [ ] 코드 리뷰 목적 설명 가능
