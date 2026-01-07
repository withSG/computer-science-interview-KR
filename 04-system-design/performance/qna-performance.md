# 성능 최적화 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 주요 성능 지표는 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 지표 | 설명 | 예시 |
|------|------|------|
| Latency | 요청~응답 시간 | 50ms |
| Throughput | 단위 시간당 처리량 | 1000 TPS |
| Response Time | 사용자 체감 응답 시간 | P99: 200ms |
| Availability | 가동 시간 비율 | 99.9% |

### Latency vs Throughput

```
Latency: 한 요청이 처리되는 시간
Throughput: 전체 시스템이 처리하는 양

예: 고속도로
- Latency = 서울→부산 소요 시간 (4시간)
- Throughput = 시간당 통과 차량 수 (1000대/시)
```

### 백분위수 (Percentile)

```
P50 (Median): 50%의 요청이 이 시간 내 완료
P95: 95%의 요청이 이 시간 내 완료
P99: 99%의 요청이 이 시간 내 완료

예:
P50: 50ms  → 절반의 요청은 50ms 이내
P99: 500ms → 1%의 요청은 500ms 초과

평균보다 P99가 더 중요 (느린 요청 파악)
```

### SLA vs SLO vs SLI

```
SLI (Service Level Indicator): 측정 지표
  예: API 응답 시간 P99

SLO (Service Level Objective): 목표치
  예: P99 응답 시간 < 200ms

SLA (Service Level Agreement): 계약
  예: 99.9% 가용성 미달 시 크레딧 제공
```

### 면접관이 주목하는 포인트
- 평균이 아닌 백분위수의 중요성
- 지표 간의 관계 이해

</details>

---

## Q2. 성능 병목(Bottleneck)을 어떻게 찾나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
**측정 → 분석 → 최적화 → 검증** 사이클을 통해 병목을 찾습니다.

### 병목 발생 위치

```
┌─────────────────────────────────────────┐
│ Client → Network → LB → App → DB → Disk │
└─────────────────────────────────────────┘
          모든 구간이 병목 후보
```

### 분석 도구

| 계층 | 도구 |
|------|------|
| 애플리케이션 | APM (Datadog, New Relic), 프로파일러 |
| 데이터베이스 | Slow Query Log, EXPLAIN, 인덱스 분석 |
| 시스템 | top, htop, vmstat, iostat |
| 네트워크 | tcpdump, Wireshark |

### 일반적인 병목 원인

**1. 데이터베이스**
```sql
-- Slow Query 확인
SHOW PROCESSLIST;

-- 실행 계획 분석
EXPLAIN ANALYZE SELECT * FROM users WHERE name = 'test';

-- 인덱스 없는 풀스캔 → 인덱스 추가
CREATE INDEX idx_users_name ON users(name);
```

**2. N+1 쿼리**
```python
# N+1 문제
users = User.query.all()  # 1회
for user in users:
    print(user.posts)  # N회

# 해결: Eager Loading
users = User.query.options(joinedload(User.posts)).all()  # 1회
```

**3. 메모리 부족**
```
GC 빈번 → Stop-the-world → 응답 지연
해결: 힙 사이즈 조정, 메모리 누수 수정
```

**4. 커넥션 부족**
```
DB 커넥션 풀 고갈 → 대기 시간 증가
해결: 풀 사이즈 증가, 커넥션 재사용 최적화
```

### 면접관이 주목하는 포인트
- 체계적인 분석 접근법
- 실제 병목 해결 경험

</details>

---

## Q3. 커넥션 풀(Connection Pool)이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
커넥션 풀은 **미리 생성해둔 DB 연결을 재사용**하여 연결 생성 오버헤드를 줄이는 기법입니다.

### 커넥션 풀 없이

```
요청 1 → 연결 생성 → 쿼리 → 연결 종료
요청 2 → 연결 생성 → 쿼리 → 연결 종료
요청 3 → 연결 생성 → 쿼리 → 연결 종료

문제: 연결 생성/종료 비용 (TCP 핸드셰이크, 인증)
```

### 커넥션 풀 사용

```
초기화: 풀에 N개 연결 생성

요청 1 → 풀에서 연결 획득 → 쿼리 → 풀에 반환
요청 2 → 풀에서 연결 획득 → 쿼리 → 풀에 반환

장점: 연결 재사용으로 오버헤드 감소
```

### 풀 설정 파라미터

```yaml
# HikariCP 예시
spring:
  datasource:
    hikari:
      maximum-pool-size: 10      # 최대 연결 수
      minimum-idle: 5            # 최소 유휴 연결
      connection-timeout: 30000  # 연결 대기 시간 (ms)
      idle-timeout: 600000       # 유휴 연결 유지 시간
      max-lifetime: 1800000      # 연결 최대 수명
```

### 적정 풀 사이즈

```
공식: connections = (core_count * 2) + effective_spindle_count

일반적 가이드:
- CPU 코어 * 2 ~ 4
- 너무 큼: 컨텍스트 스위칭 오버헤드
- 너무 작음: 연결 대기
```

### 면접관이 주목하는 포인트
- 풀 사이즈 결정 기준
- 커넥션 누수 문제

</details>

---

## Q4. 비동기 처리는 언제 사용하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
비동기 처리는 **요청 완료를 기다리지 않고 다음 작업을 진행**할 수 있어, I/O 바운드 작업에 효과적입니다.

### 동기 vs 비동기

```
동기 (Synchronous):
요청1 → 대기 → 응답1 → 요청2 → 대기 → 응답2

비동기 (Asynchronous):
요청1 → 요청2 → 요청3 → 응답1 → 응답2 → 응답3
```

### 비동기 처리 사용 사례

**1. 이메일/알림 발송**
```python
# 동기: 사용자 응답 지연
def register_user(data):
    user = create_user(data)
    send_email(user.email)  # 3초 대기
    return user

# 비동기: 즉시 응답
def register_user(data):
    user = create_user(data)
    send_email_async.delay(user.email)  # 큐에 넣고 즉시 반환
    return user
```

**2. 외부 API 호출**
```python
# 동기: 순차 호출 (9초)
result1 = api1.call()  # 3초
result2 = api2.call()  # 3초
result3 = api3.call()  # 3초

# 비동기: 병렬 호출 (3초)
results = await asyncio.gather(
    api1.call(),
    api2.call(),
    api3.call()
)
```

**3. 대용량 데이터 처리**
```
파일 업로드 → 즉시 응답 ("처리 중")
→ 백그라운드에서 처리
→ 완료 시 알림
```

### 메시지 큐 활용

```
Producer → [Message Queue] → Consumer
           (RabbitMQ, Kafka, SQS)

장점:
- 서비스 간 결합도 감소
- 부하 분산
- 재시도/실패 처리
```

### 면접관이 주목하는 포인트
- 동기/비동기 선택 기준
- 메시지 큐 활용 경험

</details>

---

## Q5. 배치 처리(Batch Processing)란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
배치 처리는 **여러 작업을 모아서 한 번에 처리**하여 오버헤드를 줄이는 기법입니다.

### 배치 처리 예시

**1. DB 삽입**
```python
# 나쁜 예: 개별 삽입 (N회 네트워크/트랜잭션)
for item in items:
    db.insert(item)

# 좋은 예: 배치 삽입 (1회)
db.bulk_insert(items)
```

**2. API 호출**
```python
# 나쁜 예: 개별 API 호출
for user_id in user_ids:
    user = api.get_user(user_id)

# 좋은 예: 배치 API 호출
users = api.get_users(user_ids)  # 한 번에 여러 ID
```

### 배치 크기 결정

```
너무 작음: 오버헤드 감소 효과 미미
너무 큼: 메모리 부족, 트랜잭션 시간 증가

적정 크기: 실험으로 결정 (보통 100~1000)
```

### 면접관이 주목하는 포인트
- 배치 처리 적용 경험
- 적정 배치 크기 결정 기준

</details>

---

## Q6. Lazy Loading vs Eager Loading? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Lazy Loading | Eager Loading |
|------|--------------|---------------|
| 시점 | 실제 사용 시 로드 | 초기에 한번에 로드 |
| 메모리 | 필요한 것만 | 모든 데이터 |
| 쿼리 수 | 많을 수 있음 (N+1) | 적음 (JOIN) |

### Lazy Loading

```python
# 사용하지 않으면 로드 안됨
user = User.query.get(1)
# posts 접근 시점에 쿼리 실행
print(user.posts)  # SELECT * FROM posts WHERE user_id = 1
```

### Eager Loading

```python
# 처음부터 함께 로드
user = User.query.options(joinedload(User.posts)).get(1)
# JOIN으로 한 번에 조회됨
```

### 선택 기준

```
Lazy Loading:
- 연관 데이터를 자주 사용하지 않을 때
- 메모리 제한이 있을 때

Eager Loading:
- 연관 데이터를 항상 사용할 때
- N+1 문제 방지
```

### 면접관이 주목하는 포인트
- N+1 문제 인식
- 적절한 로딩 전략 선택

</details>

---

## 학습 체크리스트

- [ ] 주요 성능 지표 (Latency, Throughput, P99) 설명 가능
- [ ] 병목 분석 방법과 도구 알기
- [ ] 커넥션 풀의 원리와 설정 이해
- [ ] 비동기 처리 사용 시점 판단
- [ ] Lazy/Eager Loading 차이 알기
