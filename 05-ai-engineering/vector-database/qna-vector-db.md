# 벡터 데이터베이스 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 벡터 데이터베이스란 무엇이며, 왜 필요한가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
벡터 데이터베이스는 **고차원 벡터를 저장하고 유사도 기반 검색을 효율적으로 수행**하는 특수 목적 데이터베이스입니다.

### 벡터 DB가 필요한 이유

```
일반 DB의 한계:
SELECT * FROM documents
WHERE embedding = [0.1, 0.2, ..., 0.768]  -- 정확 일치만 가능

벡터 DB:
SELECT * FROM documents
ORDER BY similarity(embedding, query_vector) DESC
LIMIT 10  -- 유사도 기반 검색
```

### 주요 기능

| 기능 | 설명 |
|------|------|
| 벡터 저장 | 고차원 벡터 효율적 저장 |
| 유사도 검색 | 코사인, 유클리드 거리 기반 |
| ANN 검색 | 근사 최근접 이웃 (빠른 검색) |
| 메타데이터 필터링 | 조건 + 유사도 결합 |
| 확장성 | 수백만~수십억 벡터 처리 |

### 사용 사례

```
1. RAG 시스템: 관련 문서 검색
2. 추천 시스템: 유사 상품/콘텐츠
3. 이미지 검색: 유사 이미지 찾기
4. 이상 탐지: 정상 패턴과 비교
5. 중복 감지: 유사 문서 찾기
```

### 면접관이 주목하는 포인트
- 일반 DB와의 차이
- 실제 사용 경험

</details>

---

## Q2. ANN(Approximate Nearest Neighbor) 알고리즘을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
ANN은 **정확한 최근접 이웃 대신 근사값을 빠르게 찾는** 알고리즘입니다. 정확도를 약간 희생하고 속도를 크게 향상시킵니다.

### Brute Force vs ANN

```
Brute Force (정확):
- 모든 벡터와 비교
- O(n × d) 시간 복잡도
- 100만 벡터 × 1000차원 = 10억 연산

ANN (근사):
- 후보군 축소 후 비교
- O(log n) ~ O(√n)
- 99%+ 정확도 유지
```

### HNSW (Hierarchical Navigable Small World)

```
계층적 그래프 구조로 검색

Layer 3:  [A] ───────── [B]        (희소)
           │             │
Layer 2:  [A] ── [C] ── [B]
           │      │      │
Layer 1:  [A]─[D]─[C]─[E]─[B]
           │   │   │   │   │
Layer 0:  [A][D][F][C][E][G][B]    (밀집)

검색: 상위 레이어에서 대략적 위치 → 하위로 정밀 검색
장점: 빠른 검색 (log n), 높은 정확도
단점: 메모리 사용량 많음
```

### IVF (Inverted File Index)

```
벡터를 클러스터로 분류

1. 훈련: K-means로 클러스터 생성
   Cluster 1: [v1, v5, v9, ...]
   Cluster 2: [v2, v3, v7, ...]
   Cluster 3: [v4, v6, v8, ...]

2. 검색: 쿼리와 가까운 클러스터만 검색
   nprobe=2: 상위 2개 클러스터만 검색

장점: 메모리 효율적
단점: 클러스터 경계 문제
```

### PQ (Product Quantization)

```
벡터를 부분 벡터로 분할하여 압축

원본: [1024차원]
분할: [128차원] × 8개 서브벡터
양자화: 각 서브벡터를 256개 코드북으로 압축
결과: 8바이트로 표현 (압축률 128:1)

장점: 메모리 대폭 절감
단점: 정확도 저하
```

### 알고리즘 비교

| 알고리즘 | 속도 | 정확도 | 메모리 | 적합 상황 |
|---------|------|--------|--------|----------|
| Brute Force | 느림 | 100% | 낮음 | 소규모 |
| HNSW | 빠름 | 높음 | 높음 | 정확도 중요 |
| IVF | 중간 | 중간 | 중간 | 균형 |
| IVF-PQ | 빠름 | 낮음 | 낮음 | 대용량 |

### 면접관이 주목하는 포인트
- ANN의 트레이드오프 이해
- HNSW와 IVF의 차이

</details>

---

## Q3. 유사도 측정 방법에는 어떤 것이 있나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 방법 | 공식 | 범위 | 특징 |
|------|------|------|------|
| Cosine Similarity | cos(θ) = A·B / (||A||×||B||) | -1 ~ 1 | 방향만 비교 |
| Euclidean Distance | √Σ(ai-bi)² | 0 ~ ∞ | 절대 거리 |
| Dot Product | Σ(ai×bi) | -∞ ~ ∞ | 크기+방향 |

### Cosine Similarity

```
벡터의 방향(각도)만 비교
크기(magnitude) 무시

사용 사례:
- 텍스트 임베딩 (문서 길이 무관)
- 정규화된 벡터

예:
A = [1, 0]
B = [2, 0]
cosine_sim = 1.0  (같은 방향)
```

### Euclidean Distance (L2)

```
두 점 사이의 직선 거리

사용 사례:
- 이미지 임베딩
- 절대적 거리 중요 시

주의: 고차원에서 "차원의 저주"
```

### Dot Product (Inner Product)

```
크기와 방향 모두 반영

사용 사례:
- Maximum Inner Product Search (MIPS)
- OpenAI 임베딩 (정규화되어 cosine과 동일)
```

### 선택 가이드

```
텍스트 임베딩: Cosine (대부분의 경우)
이미지 임베딩: Euclidean 또는 Cosine
정규화된 벡터: Dot Product (연산 빠름)
```

### 면접관이 주목하는 포인트
- 각 방법의 특성 이해
- 상황에 맞는 선택

</details>

---

## Q4. 주요 벡터 데이터베이스를 비교해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| DB | 유형 | 특징 | 적합 상황 |
|----|------|------|----------|
| Pinecone | 관리형 | 완전 관리형, 사용 쉬움 | 빠른 시작, 운영 부담 X |
| Weaviate | 오픈소스 | GraphQL, 모듈식 | 유연성 필요 |
| Milvus | 오픈소스 | 대규모, 고성능 | 대용량 처리 |
| Qdrant | 오픈소스 | Rust 기반, 필터링 강점 | 복잡한 필터링 |
| Chroma | 오픈소스 | 경량, 개발용 | 프로토타이핑 |
| pgvector | PostgreSQL 확장 | 기존 PG 활용 | 소규모, PG 사용 시 |

### Pinecone

```python
import pinecone

pinecone.init(api_key="...", environment="...")
index = pinecone.Index("my-index")

# Upsert
index.upsert(vectors=[("id1", [0.1, 0.2, ...], {"metadata": "value"})])

# Query
results = index.query(vector=[0.1, 0.2, ...], top_k=10)
```

**장점**: 관리 불필요, 확장 자동
**단점**: 비용, 벤더 종속

### Chroma

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("my-collection")

# Add
collection.add(
    documents=["doc1", "doc2"],
    ids=["id1", "id2"]
)

# Query
results = collection.query(query_texts=["search query"], n_results=10)
```

**장점**: 로컬 개발 쉬움, 임베딩 자동 생성
**단점**: 대규모 프로덕션 부적합

### pgvector

```sql
-- 확장 설치
CREATE EXTENSION vector;

-- 테이블 생성
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536)
);

-- 인덱스 생성
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 검색
SELECT * FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 10;
```

**장점**: 기존 PostgreSQL 활용
**단점**: 대규모 성능 한계

### 면접관이 주목하는 포인트
- 선택 기준 이해
- 실제 사용 경험

</details>

---

## Q5. 벡터 DB에서 메타데이터 필터링이란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
메타데이터 필터링은 **유사도 검색과 조건 필터를 결합**하여 더 정확한 결과를 얻는 기능입니다.

### 사용 예시

```python
# Pinecone 예시
results = index.query(
    vector=query_vector,
    top_k=10,
    filter={
        "category": {"$eq": "technology"},
        "year": {"$gte": 2023},
        "author": {"$in": ["Alice", "Bob"]}
    }
)
```

### 필터링 전략

**Pre-filtering**
```
1. 메타데이터 조건으로 후보 축소
2. 축소된 집합에서 벡터 검색

장점: 정확한 필터링
단점: 후보가 적으면 recall 저하
```

**Post-filtering**
```
1. 벡터 검색으로 Top-K 추출
2. 결과에 메타데이터 필터 적용

장점: recall 유지
단점: 필터 후 결과 부족 가능
```

### 면접관이 주목하는 포인트
- 필터링 전략의 트레이드오프
- 실제 활용 사례

</details>

---

## 학습 체크리스트

- [ ] 벡터 DB의 필요성 설명 가능
- [ ] HNSW, IVF 알고리즘 차이 설명 가능
- [ ] 유사도 측정 방법 3가지 비교 가능
- [ ] 주요 벡터 DB 특징 알기
- [ ] 메타데이터 필터링 이해
