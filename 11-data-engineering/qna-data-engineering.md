# 데이터 엔지니어링 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 데이터 파이프라인이란 무엇이며, ETL과 ELT의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
데이터 파이프라인은 **여러 소스의 데이터를 수집·가공·적재해 분석/활용 가능한 형태로 옮기는 일련의 과정**입니다. ETL과 ELT는 변환(Transform)을 적재(Load) 전에 하느냐 후에 하느냐의 차이입니다.

### ETL vs ELT

```
ETL (Extract → Transform → Load)
소스 → 추출 → [변환 서버에서 가공] → DW 적재
- 적재 전에 변환 (정제된 데이터만 저장)

ELT (Extract → Load → Transform)
소스 → 추출 → DW/Lake 적재 → [DW 안에서 변환]
- 일단 원본 적재 후 변환 (대용량/클라우드 DW에 적합)
```

| 구분 | ETL | ELT |
|------|-----|-----|
| 변환 시점 | 적재 전 | 적재 후 |
| 변환 위치 | 별도 처리 엔진 | 데이터 웨어하우스 내부 |
| 적합 | 정형 데이터, 정해진 스키마 | 대용량, 클라우드 DW(BigQuery, Snowflake) |
| 원본 보존 | 변환된 것만 | 원본 유지 가능 |

### 데이터 파이프라인 구성 요소

```
수집(Ingestion) → 저장(Storage) → 처리(Processing) → 적재(Serving)
   Kafka,           S3, HDFS,        Spark,            DW, DB,
   API, CDC         Data Lake        Airflow           BI 도구
```

### 면접관이 주목하는 포인트
- ETL/ELT의 변환 시점 차이와 선택 기준
- 클라우드 DW 시대에 ELT가 부상한 이유

</details>

---

## Q2. Apache Airflow의 DAG와 핵심 개념을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Airflow는 **데이터 파이프라인(워크플로우)을 코드로 정의하고 스케줄링·모니터링하는 오케스트레이션 도구**입니다. 워크플로우를 DAG(방향성 비순환 그래프)로 표현합니다.

### DAG (Directed Acyclic Graph)

```
방향성 있고 순환하지 않는 그래프 = 작업 간 실행 순서/의존성

  extract ──→ transform ──→ load
                 │
                 └──→ notify

- 방향성: 실행 순서 (extract 다음 transform)
- 비순환: 사이클 없음 (무한 루프 방지)
```

### 핵심 개념

| 개념 | 설명 |
|------|------|
| DAG | 전체 워크플로우 (작업들의 의존 그래프) |
| Task | 개별 작업 단위 |
| Operator | Task의 구현체 (PythonOperator, BashOperator 등) |
| Scheduler | 스케줄에 따라 DAG 실행 트리거 |
| Executor | Task를 실제로 실행 (Local, Celery, Kubernetes) |

### DAG 예시

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG(
    "etl_pipeline",
    schedule="0 2 * * *",       # 매일 02시 (cron)
    start_date=datetime(2026, 1, 1),
    catchup=False,
) as dag:
    extract = PythonOperator(task_id="extract", python_callable=do_extract)
    transform = PythonOperator(task_id="transform", python_callable=do_transform)
    load = PythonOperator(task_id="load", python_callable=do_load)

    extract >> transform >> load   # 의존성 정의
```

### 멱등성(Idempotency)과 백필(Backfill)

```
멱등성: 같은 작업을 여러 번 실행해도 결과가 동일해야 함
        (재시도/재실행 시 데이터 중복 방지) → 날짜 파티션 덮어쓰기 등으로 구현

백필(Backfill): 과거 기간에 대해 DAG를 소급 실행
        (start_date~현재의 누락된 실행을 채움)
```

### 면접관이 주목하는 포인트
- DAG가 왜 비순환이어야 하는지
- 멱등성의 중요성 (재실행 안전성)

</details>

---

## Q3. Apache Kafka의 구조와 스트리밍 처리를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Kafka는 **분산 이벤트 스트리밍 플랫폼**으로, 대용량 실시간 데이터를 발행(Producer)하고 구독(Consumer)하는 메시지 큐 기반 시스템입니다. 높은 처리량과 내구성, 확장성을 제공합니다.

### 핵심 구조

| 개념 | 설명 |
|------|------|
| Producer | 메시지를 토픽에 발행 |
| Consumer | 토픽의 메시지를 구독·소비 |
| Topic | 메시지의 논리적 분류(채널) |
| Partition | 토픽을 나눈 단위 (병렬성·확장성의 핵심) |
| Broker | Kafka 서버 (여러 대로 클러스터 구성) |
| Consumer Group | 함께 토픽을 나눠 소비하는 컨슈머 묶음 |
| Offset | 컨슈머가 어디까지 읽었는지 위치 |

### 구조 다이어그램

```
Producer ──→ [ Topic: orders ]
                ├── Partition 0 ──→ Consumer A ┐
                ├── Partition 1 ──→ Consumer B ├ Consumer Group
                └── Partition 2 ──→ Consumer C ┘

- 파티션 수만큼 컨슈머가 병렬 소비 (처리량 확장)
- 같은 파티션 내에서는 순서 보장
```

### 왜 빠르고 확장성이 좋은가

```
1. 파티션으로 수평 확장 (병렬 처리)
2. 디스크 순차 쓰기 + 페이지 캐시 → 높은 처리량
3. 메시지를 디스크에 보관(retention) → 재처리 가능
4. 복제(replication)로 내구성/장애 대응
```

### 메시지 전달 보장(Delivery Semantics)

| 보장 | 의미 |
|------|------|
| At-most-once | 최대 1회 (유실 가능, 중복 없음) |
| At-least-once | 최소 1회 (중복 가능, 유실 없음) — 가장 일반적 |
| Exactly-once | 정확히 1회 (중복·유실 없음, 비용 높음) |

> At-least-once를 쓰면 컨슈머에서 멱등 처리로 중복을 흡수하는 패턴이 흔합니다.

### 면접관이 주목하는 포인트
- 파티션이 병렬성/순서 보장의 핵심임을 이해
- 전달 보장 수준의 트레이드오프

</details>

---

## Q4. Apache Spark는 무엇이며, MapReduce와 어떻게 다른가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Spark는 **대용량 데이터를 분산·병렬로 처리하는 엔진**입니다. 데이터를 메모리(in-memory)에서 처리해 디스크 기반인 하둡 MapReduce보다 훨씬 빠릅니다.

### Spark vs MapReduce

| 구분 | MapReduce | Spark |
|------|-----------|-------|
| 처리 위치 | 단계마다 디스크 | 메모리(in-memory) |
| 속도 | 느림 | 빠름 (최대 수십 배) |
| API | 저수준(Map/Reduce) | 고수준(DataFrame, SQL) |
| 용도 | 배치 | 배치 + 스트리밍 + ML |

### 핵심 개념

| 개념 | 설명 |
|------|------|
| RDD | 분산된 불변 데이터 컬렉션 (Spark의 기본 추상화) |
| DataFrame | 스키마가 있는 분산 테이블 (최적화·사용 편의) |
| Transformation | map, filter 등 (지연 실행) |
| Action | count, collect 등 (실제 실행 트리거) |
| Lazy Evaluation | 변환은 미뤄두고 Action 시점에 최적화해 실행 |

### Lazy Evaluation

```python
df = spark.read.csv("data.csv")
result = df.filter(df.age > 20).select("name")  # 아직 실행 안 됨 (Transformation)
result.show()  # 이때 실제 실행 (Action) → 전체 계획을 최적화해 한 번에 처리
```

- 변환을 즉시 실행하지 않고 **실행 계획(DAG)** 을 만든 뒤, Action 시점에 최적화(불필요한 단계 제거, 파이프라이닝)해 실행합니다.

### 면접관이 주목하는 포인트
- in-memory 처리가 빠른 이유
- Transformation/Action과 지연 실행 개념

</details>

---

## Q5. 배치 처리와 스트리밍 처리의 차이는? (Lambda/Kappa) ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
- **배치 처리**: 일정량의 데이터를 모아 주기적으로 한꺼번에 처리 (정확성·대용량)
- **스트리밍 처리**: 데이터가 발생하는 즉시 실시간 처리 (낮은 지연)

### 비교

| 구분 | 배치 | 스트리밍 |
|------|------|----------|
| 처리 단위 | 모아서 한 번에 | 이벤트 단위/소량 |
| 지연 | 높음(분~시간) | 낮음(초 이하) |
| 예시 | 일별 매출 집계 | 실시간 이상거래 탐지 |
| 도구 | Spark, Airflow | Kafka, Spark Streaming, Flink |

### 람다 아키텍처 (Lambda)

```
            ┌─→ 배치 레이어 (정확, 느림) ─┐
소스 데이터 ─┤                            ├→ 서빙 레이어 → 조회
            └─→ 스피드 레이어 (실시간) ──┘

장점: 정확성 + 실시간 모두
단점: 배치/스트리밍 두 코드베이스 유지 (복잡)
```

### 카파 아키텍처 (Kappa)

```
소스 데이터 → 스트리밍 레이어(단일) → 서빙 → 조회

- 모든 처리를 스트리밍으로 통합 (재처리도 스트림 재생)
- 람다의 이중 코드베이스 문제 해결
```

### 면접관이 주목하는 포인트
- 지연/정확성 트레이드오프
- 람다(이중)와 카파(단일)의 차이

</details>

---

## Q6. 데이터 레이크와 데이터 웨어하우스의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
- **데이터 웨어하우스(DW)**: 정형 데이터를 **스키마에 맞게 정제·구조화**해 저장 (분석/BI 용)
- **데이터 레이크(Data Lake)**: 정형·비정형 **원본을 그대로** 대량 저장 (유연성)

### 비교

| 구분 | 데이터 웨어하우스 | 데이터 레이크 |
|------|------------------|---------------|
| 데이터 | 정형(구조화) | 정형+비정형(원본) |
| 스키마 | Schema-on-Write (저장 시 정의) | Schema-on-Read (읽을 때 적용) |
| 용도 | BI, 정형 분석 | ML, 탐색적 분석, 대량 저장 |
| 예시 | BigQuery, Snowflake, Redshift | S3, HDFS |

### 레이크하우스(Lakehouse)
- 데이터 레이크의 유연성 + DW의 관리/성능을 결합한 최신 아키텍처(예: Delta Lake, Iceberg). 원본을 레이크에 두면서 트랜잭션·스키마 관리를 제공합니다.

### 면접관이 주목하는 포인트
- Schema-on-Write vs Schema-on-Read
- 용도에 따른 선택 (BI vs ML/탐색)

</details>

---

## 학습 체크리스트

- [ ] ETL vs ELT 차이와 선택 기준 설명 가능
- [ ] Airflow DAG/Operator/스케줄링 설명 가능
- [ ] 멱등성과 백필의 의미 이해
- [ ] Kafka의 Topic/Partition/Consumer Group 구조 설명 가능
- [ ] 메시지 전달 보장(at-least-once 등) 구분 가능
- [ ] Spark의 in-memory 처리와 지연 실행 이해
- [ ] 배치 vs 스트리밍, Lambda/Kappa 아키텍처 구분 가능
- [ ] 데이터 레이크 vs 데이터 웨어하우스 차이 이해
