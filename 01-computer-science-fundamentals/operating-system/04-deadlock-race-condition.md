# 교착 상태(Deadlock)와 경쟁 상태(Race Condition)

## 학습 목표

- [ ] 데드락의 4가지 필요 조건을 설명할 수 있다
- [ ] 경쟁 상태와 해결 방법을 안다
- [ ] 동기화 메커니즘을 이해한다

---

## 1. 경쟁 상태 (Race Condition)

### 정의
두 개 이상의 스레드가 공유 자원에 동시에 접근하여 **데이터의 정합성이 깨지는 현상**

### 예시
```java
// 경쟁 상태 발생 예시
public class Counter {
    private int count = 0;

    public void increment() {
        count++;  // 원자적이지 않음: read → modify → write
    }
}

// 두 스레드가 동시에 increment() 호출 시
// 예상: count = 2
// 실제: count = 1 (경쟁 상태로 인한 오류)
```

### 해결 방법

#### 1) synchronized 키워드
```java
public synchronized void increment() {
    count++;
}
```

#### 2) ReentrantLock
```java
private final ReentrantLock lock = new ReentrantLock();

public void increment() {
    lock.lock();
    try {
        count++;
    } finally {
        lock.unlock();
    }
}
```

#### 3) Atomic 클래스 (CAS 연산)
```java
private AtomicInteger count = new AtomicInteger(0);

public void increment() {
    count.incrementAndGet();  // Compare-And-Swap 사용
}
```

---

## 2. 교착 상태 (Deadlock)

### 정의
두 개 이상의 스레드가 서로가 보유한 자원을 기다리며 **무한 대기**하는 상태

### 데드락 발생 조건 (4가지 모두 충족 시)

| 조건 | 설명 |
|------|------|
| **상호 배제** (Mutual Exclusion) | 자원은 한 번에 하나의 스레드만 사용 가능 |
| **점유 대기** (Hold and Wait) | 자원을 보유한 채로 다른 자원을 기다림 |
| **비선점** (No Preemption) | 다른 스레드의 자원을 강제로 빼앗을 수 없음 |
| **순환 대기** (Circular Wait) | 스레드들이 순환 형태로 자원을 기다림 |

### 데드락 예시
```
Thread 1: Lock A 획득 → Lock B 대기
Thread 2: Lock B 획득 → Lock A 대기

┌──────────┐         ┌──────────┐
│ Thread 1 │ ──────► │  Lock B  │
│  (A 보유) │         │ (T2 보유) │
└──────────┘         └──────────┘
     ▲                     │
     │                     │
     │                     ▼
┌──────────┐         ┌──────────┐
│  Lock A  │ ◄────── │ Thread 2 │
│ (T1 보유) │         │  (B 보유) │
└──────────┘         └──────────┘
```

---

## 3. 데드락 해결 전략

### 예방 (Prevention)
4가지 조건 중 하나를 원천 차단

| 조건 제거 | 방법 |
|----------|------|
| 상호 배제 | 공유 가능한 자원으로 설계 |
| 점유 대기 | 필요한 모든 자원을 한 번에 요청 |
| 비선점 | 타임아웃 후 자원 반납 |
| 순환 대기 | 자원에 순서 부여, 순서대로만 획득 |

### 회피 (Avoidance)
- **은행원 알고리즘**: 안전 상태 유지
- 자원 요청 시 데드락 가능성 검사

### 탐지 및 복구 (Detection & Recovery)
- 주기적으로 데드락 탐지
- 발견 시 스레드 종료 또는 자원 선점

### 무시 (Ostrich Algorithm)
- 데드락 발생 확률이 낮으면 무시
- 발생 시 시스템 재시작

---

## 4. 동기화 도구 비교

| 도구 | 특징 | 사용 사례 |
|------|------|----------|
| **synchronized** | 간단, 암묵적 락 | 단순한 동기화 |
| **ReentrantLock** | 명시적, tryLock 가능 | 타임아웃 필요 시 |
| **Semaphore** | 동시 접근 수 제한 | 커넥션 풀 |
| **Atomic** | Lock-free, CAS | 카운터, 플래그 |

---

## 5. 면접 포인트

### 자주 묻는 질문
1. "데드락 4가지 조건을 설명하세요"
2. "프로젝트에서 동시성 이슈를 해결한 경험"
3. "synchronized vs ReentrantLock 차이점"

### 답변 팁
- 이론 + 실무 경험 연결
- 트레이드오프 설명 (성능 vs 안전성)

---

## 연관 개념

- [프로세스와 스레드](./01-process-thread.md)
- [Spring @Transactional 함정](../../02-backend-engineering/spring-framework/06-transactional-pitfalls.md)
