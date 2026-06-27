# 캐싱 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 캐싱이란 무엇이며, 왜 사용하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
캐싱은 **자주 접근하는 데이터를 빠른 저장소에 임시 저장**하여 응답 속도를 높이고 원본 데이터 소스의 부하를 줄이는 기술입니다.

### 캐싱의 이점

| 이점 | 설명 |
|------|------|
| 응답 속도 향상 | DB 조회 대신 메모리에서 즉시 응답 |
| 서버 부하 감소 | 반복 연산/조회 감소 |
| 비용 절감 | DB 연결, 네트워크 비용 감소 |
| 가용성 향상 | 원본 장애 시에도 캐시 데이터 제공 |

### 캐싱 레이어

```
┌─────────────┐
│   Client    │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Browser Cache │ ← L1 (가장 빠름)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│    CDN      │ ← L2 (정적 리소스)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Application │
│   Cache     │ ← L3 (Redis, Memcached)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Database   │ ← 원본 데이터
└─────────────┘
```

### Cache Hit vs Cache Miss

```
Cache Hit: 캐시에 데이터 있음 → 즉시 반환
Cache Miss: 캐시에 없음 → DB 조회 → 캐시 저장 → 반환
```

### 면접관이 주목하는 포인트
- 캐싱의 적절한 사용 시나리오
- 캐싱으로 인한 문제점 인식

</details>

---

## Q2. 캐싱 전략(Cache Strategy)에 대해 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 읽기 전략

**1. Cache-Aside (Lazy Loading)**
```
애플리케이션이 직접 캐시 관리

1. 캐시 조회
2. Cache Miss → DB 조회
3. 캐시에 저장
4. 응답 반환
```

```python
def get_user(user_id):
    # 1. 캐시 조회
    user = cache.get(f"user:{user_id}")
    if user:
        return user  # Cache Hit

    # 2. Cache Miss → DB 조회
    user = db.query(f"SELECT * FROM users WHERE id = {user_id}")

    # 3. 캐시 저장
    cache.set(f"user:{user_id}", user, ttl=3600)

    return user
```

**장점**: 필요한 데이터만 캐싱, 캐시 장애 시 DB 직접 조회
**단점**: 첫 요청 느림, Cache Miss 시 지연

**2. Read-Through**
```
캐시가 DB를 직접 조회

1. 캐시 조회
2. Cache Miss → 캐시가 자동으로 DB 조회 및 저장
3. 응답 반환
```

**장점**: 애플리케이션 코드 단순화
**단점**: 캐시 라이브러리/서비스 의존

### 쓰기 전략

**1. Write-Through**
```
DB와 캐시에 동시 쓰기

1. 캐시에 쓰기
2. DB에 쓰기 (동기)
3. 완료 응답
```

**장점**: 캐시-DB 일관성 보장
**단점**: 쓰기 지연 (두 번 쓰기)

**2. Write-Back (Write-Behind)**
```
캐시에 먼저 쓰고, 나중에 DB 반영

1. 캐시에 쓰기
2. 즉시 완료 응답
3. 비동기로 DB에 쓰기
```

**장점**: 쓰기 성능 우수, 배치 처리 가능
**단점**: 캐시 장애 시 데이터 손실 위험

**3. Write-Around**
```
DB에만 쓰고, 읽을 때 캐시에 로드

1. DB에 쓰기
2. 완료 응답
3. (읽을 때 Cache-Aside로 캐시 로드)
```

**장점**: 자주 읽지 않는 데이터 캐시 방지
**단점**: 첫 읽기 느림

### 전략 비교

| 전략 | 일관성 | 성능 | 사용 사례 |
|------|:------:|:----:|----------|
| Cache-Aside | 중간 | 높음 | 일반적인 읽기 캐싱 |
| Write-Through | 높음 | 중간 | 일관성 중요 |
| Write-Back | 낮음 | 매우 높음 | 쓰기 많은 워크로드 |
| Write-Around | 중간 | 중간 | 읽기 적은 데이터 |

### 면접관이 주목하는 포인트
- 각 전략의 트레이드오프 이해
- 상황에 맞는 전략 선택

</details>

---

## Q3. 캐시 무효화(Cache Invalidation) 전략은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
캐시 무효화는 **캐시 데이터가 원본과 일치하지 않을 때 캐시를 갱신**하는 것입니다. "컴퓨터 과학에서 가장 어려운 두 가지 중 하나"로 알려져 있습니다.

### 무효화 전략

**1. TTL (Time-To-Live)**
```
일정 시간 후 자동 만료

cache.set("key", value, ttl=3600)  # 1시간 후 만료
```

**장점**: 단순, 자동 갱신
**단점**: TTL 동안 stale 데이터 가능

**2. Event-Driven Invalidation**
```
데이터 변경 시 명시적 삭제

def update_user(user_id, data):
    db.update(user_id, data)
    cache.delete(f"user:{user_id}")  # 캐시 삭제
```

**장점**: 즉시 일관성
**단점**: 삭제 누락 위험, 코드 복잡도

**3. Versioning**
```
키에 버전 포함

user_v1 = cache.get(f"user:{user_id}:v1")
# 스키마 변경 시 v2로 업데이트
```

**4. Tag-based Invalidation**
```
태그로 관련 캐시 일괄 삭제

cache.set("post:1", data, tags=["user:1", "posts"])
cache.invalidate_tag("user:1")  # 관련 캐시 모두 삭제
```

### Cache Stampede 문제

```
많은 요청이 동시에 Cache Miss → DB 과부하

해결책:
1. Lock (Mutex): 하나의 요청만 DB 조회
2. Early Expiration: 만료 전에 미리 갱신
3. Probabilistic Early Expiration: 확률적으로 미리 갱신
```

```python
# Lock 방식
def get_user_with_lock(user_id):
    user = cache.get(f"user:{user_id}")
    if user:
        return user

    lock = cache.acquire_lock(f"lock:user:{user_id}")
    if lock:
        try:
            user = db.query(...)
            cache.set(f"user:{user_id}", user)
        finally:
            lock.release()
    else:
        # 다른 요청이 로딩 중 → 잠시 대기 후 재시도
        time.sleep(0.1)
        return get_user_with_lock(user_id)

    return user
```

### 면접관이 주목하는 포인트
- Cache Stampede 인지 및 해결 방법
- 실무에서의 무효화 경험

</details>

---

## Q4. Redis와 Memcached의 차이점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Redis | Memcached |
|------|-------|-----------|
| 데이터 타입 | String, List, Set, Hash, Sorted Set 등 | String만 |
| 영속성 | RDB, AOF 지원 | 없음 (메모리만) |
| 복제 | Master-Slave | 없음 |
| 클러스터 | 지원 | 클라이언트 샤딩 |
| 메모리 효율 | 상대적으로 낮음 | 높음 |
| 기능 | Pub/Sub, Lua 스크립트, 트랜잭션 | 단순 캐싱 |

### Redis 사용 사례

```
- 세션 스토어
- 실시간 랭킹 (Sorted Set)
- 메시지 큐 (List, Stream)
- 분산 락
- Rate Limiting
```

### Memcached 사용 사례

```
- 단순 키-값 캐싱
- 대용량 객체 캐싱
- 세션 캐싱 (단순)
```

### 선택 기준

```
Redis 선택:
- 다양한 데이터 구조 필요
- 영속성 필요
- 복제/고가용성 필요
- Pub/Sub 등 추가 기능 필요

Memcached 선택:
- 단순 캐싱만 필요
- 메모리 효율 중요
- 이미 Memcached 사용 중
```

### 면접관이 주목하는 포인트
- 각 도구의 특성 이해
- 실제 사용 경험

</details>

---

## Q5. CDN(Content Delivery Network)이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
CDN은 **지리적으로 분산된 서버 네트워크**를 통해 사용자에게 가까운 서버에서 콘텐츠를 제공하는 시스템입니다.

### CDN 동작 원리

```
                    ┌─────────────┐
                    │   Origin    │
                    │   Server    │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Edge 서버│      │ Edge 서버│      │ Edge 서버│
    │ (서울)  │      │ (도쿄)  │      │ (싱가포르)│
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │한국 사용자│      │일본 사용자│      │동남아 사용자│
    └─────────┘      └─────────┘      └─────────┘
```

### CDN 장점

| 장점 | 설명 |
|------|------|
| 지연 시간 감소 | 가까운 서버에서 응답 |
| 대역폭 절감 | Origin 서버 부하 분산 |
| 가용성 향상 | 분산으로 장애 대응 |
| DDoS 방어 | 트래픽 분산으로 완화 |

### CDN 캐싱 제어

```
Cache-Control 헤더로 제어

Cache-Control: public, max-age=31536000  # 1년 캐싱
Cache-Control: no-cache  # 항상 Origin 확인
Cache-Control: no-store  # 캐싱 금지
```

### CDN 무효화

```
- Purge: 특정 URL 캐시 삭제
- Soft Purge: 새 콘텐츠 있으면 갱신
- 버전 쿼리 스트링: /style.css?v=2
```

### 면접관이 주목하는 포인트
- CDN의 동작 원리
- 캐시 무효화 전략

</details>

---

## 학습 체크리스트

- [ ] 캐싱의 이점과 레이어 설명 가능
- [ ] 읽기/쓰기 캐싱 전략 비교 가능
- [ ] 캐시 무효화 전략과 Stampede 해결법 알기
- [ ] Redis vs Memcached 차이 설명 가능
- [ ] CDN 동작 원리 이해
