# RAG 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. RAG(Retrieval-Augmented Generation)란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
RAG는 **외부 지식 베이스에서 관련 정보를 검색하여 LLM의 생성에 활용**하는 기법입니다. LLM의 지식 한계와 환각(Hallucination) 문제를 완화합니다.

### RAG가 필요한 이유

```
LLM의 한계:
1. 학습 데이터 이후 정보 모름 (지식 컷오프)
2. 기업 내부 문서 접근 불가
3. 환각 (그럴듯하지만 틀린 답변)
4. 출처 확인 어려움

RAG로 해결:
1. 최신 정보 검색 가능
2. 사내 문서 활용 가능
3. 검색된 문서 기반으로 답변 → 정확성 향상
4. 출처 제공 가능
```

### RAG 파이프라인

```
┌───────────────────────────────────────────────────────┐
│                    Indexing (색인)                     │
│  Documents → Chunking → Embedding → Vector DB 저장    │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                   Retrieval (검색)                     │
│  Query → Embedding → Vector Search → Top-K 문서       │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                  Generation (생성)                     │
│  [Query + Retrieved Context] → LLM → Answer          │
└───────────────────────────────────────────────────────┘
```

### RAG 프롬프트 예시

```
다음 컨텍스트를 참고하여 질문에 답변하세요.
컨텍스트에 없는 내용은 "알 수 없습니다"라고 답하세요.

컨텍스트:
{retrieved_documents}

질문: {user_query}

답변:
```

### 면접관이 주목하는 포인트
- RAG의 필요성 이해
- Fine-tuning과의 차이

### 꼬리 질문 대비
- "RAG vs Fine-tuning?"
  → Fine-tuning: 모델 가중치 변경, 비용 높음, 지식 내재화
  → RAG: 모델 변경 없음, 유연함, 실시간 업데이트 가능

</details>

---

## Q2. 청킹(Chunking) 전략에 대해 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
청킹은 **긴 문서를 검색 및 LLM 처리에 적합한 작은 단위로 분할**하는 과정입니다.

### 청킹이 필요한 이유

```
1. LLM 컨텍스트 윈도우 제한 (4K~128K 토큰)
2. 긴 문서에서 정확한 부분 검색 어려움
3. 임베딩 품질 저하 (긴 텍스트는 의미 희석)
```

### 청킹 전략 비교

| 전략 | 설명 | 장점 | 단점 |
|------|------|------|------|
| Fixed Size | 고정 토큰/문자 수 | 단순, 예측 가능 | 의미 단위 무시 |
| Sentence | 문장 단위 | 의미 보존 | 문장 길이 불균일 |
| Paragraph | 문단 단위 | 맥락 보존 | 문단 길이 불균일 |
| Semantic | 의미 유사도 기반 | 최적 의미 단위 | 복잡, 비용 |
| Recursive | 계층적 분할 | 유연함 | 설정 복잡 |

### Fixed Size Chunking

```python
def fixed_size_chunk(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap  # 오버랩으로 맥락 유지
    return chunks
```

### Recursive Chunking (LangChain 방식)

```python
# 구분자 우선순위: 문단 → 문장 → 단어
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " ", ""]
)
```

### Semantic Chunking

```python
# 의미 유사도가 임계값 이하로 떨어지면 분할
def semantic_chunk(text, threshold=0.5):
    sentences = split_sentences(text)
    chunks = []
    current_chunk = [sentences[0]]

    for i in range(1, len(sentences)):
        similarity = cosine_similarity(
            embed(sentences[i-1]),
            embed(sentences[i])
        )
        if similarity < threshold:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
        current_chunk.append(sentences[i])

    return chunks
```

### 최적 청크 크기

```
너무 작으면: 맥락 부족, 검색 노이즈 증가
너무 크면: 관련 없는 내용 포함, 정확도 감소

일반적 가이드:
- 일반 문서: 500~1000 토큰
- 코드: 함수/클래스 단위
- Q&A: 질문-답변 쌍 단위
```

### 면접관이 주목하는 포인트
- 청킹 전략 선택 기준
- 오버랩의 역할

</details>

---

## Q3. 임베딩(Embedding)이란 무엇이며, 어떻게 선택하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
임베딩은 **텍스트를 의미를 담은 벡터(숫자 배열)로 변환**하는 것입니다. 유사한 의미의 텍스트는 유사한 벡터를 가집니다.

### 임베딩의 원리

```
"고양이는 귀엽다" → [0.2, 0.8, -0.3, ...]
"강아지는 사랑스럽다" → [0.3, 0.7, -0.2, ...]  (유사)
"오늘 날씨가 좋다" → [-0.5, 0.1, 0.9, ...]  (다름)

유사도 = 코사인 유사도(벡터1, 벡터2)
```

### 임베딩 모델 종류

| 모델 | 차원 | 특징 |
|------|------|------|
| OpenAI text-embedding-3-small | 1536 | 범용, API |
| OpenAI text-embedding-3-large | 3072 | 고성능, 비용 높음 |
| sentence-transformers | 384~768 | 오픈소스, 로컬 |
| Cohere embed | 1024 | 다국어 지원 |
| BGE (BAAI) | 1024 | 오픈소스, 한국어 좋음 |

### 임베딩 모델 선택 기준

```
1. 언어 지원
   - 한국어: BGE, multilingual-e5
   - 영어: OpenAI, Cohere

2. 성능 vs 비용
   - 높은 성능: OpenAI large, Cohere
   - 무료/로컬: sentence-transformers, BGE

3. 벤치마크 (MTEB)
   - 검색 성능 비교 확인

4. 차원 수
   - 높을수록 정보량 많음
   - 저장 공간, 검색 속도 영향
```

### 임베딩 사용 예시

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('BAAI/bge-m3')

# 문서 임베딩
documents = ["문서1 내용", "문서2 내용"]
doc_embeddings = model.encode(documents)

# 쿼리 임베딩
query = "검색 질문"
query_embedding = model.encode(query)

# 유사도 검색
similarities = cosine_similarity([query_embedding], doc_embeddings)
```

### 면접관이 주목하는 포인트
- 임베딩의 원리 이해
- 모델 선택 기준

</details>

---

## Q4. 하이브리드 검색(Hybrid Search)이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
하이브리드 검색은 **Dense Retrieval(벡터 검색)과 Sparse Retrieval(키워드 검색)을 결합**하여 검색 품질을 향상시키는 방법입니다.

### Dense vs Sparse Retrieval

| 구분 | Dense (벡터) | Sparse (키워드) |
|------|-------------|-----------------|
| 방식 | 임베딩 유사도 | TF-IDF, BM25 |
| 장점 | 의미 이해 | 정확한 키워드 매칭 |
| 단점 | 키워드 누락 가능 | 의미 변형 못 잡음 |
| 예시 | "강아지" ≈ "개" | "강아지" ≠ "개" |

### 하이브리드 검색의 필요성

```
Dense만 사용:
쿼리: "iPhone 15 Pro Max 가격"
검색 결과: "스마트폰 가격 비교" (의미적 유사)
→ 정확한 제품명 매칭 실패

Sparse만 사용:
쿼리: "자동차 사고 처리"
검색 결과: "자동차 사고" 포함 문서
→ "교통사고 대응" 문서 누락

하이브리드:
Dense로 의미 유사 문서 + Sparse로 키워드 매칭
→ 두 장점 결합
```

### 하이브리드 검색 구현

```python
# RRF (Reciprocal Rank Fusion)
def hybrid_search(query, k=10, alpha=0.5):
    # Dense 검색
    dense_results = vector_search(query, k=k*2)

    # Sparse 검색 (BM25)
    sparse_results = bm25_search(query, k=k*2)

    # RRF로 점수 결합
    combined = {}
    for rank, doc in enumerate(dense_results):
        combined[doc.id] = combined.get(doc.id, 0) + alpha / (rank + 60)

    for rank, doc in enumerate(sparse_results):
        combined[doc.id] = combined.get(doc.id, 0) + (1-alpha) / (rank + 60)

    # 상위 k개 반환
    return sorted(combined.items(), key=lambda x: x[1], reverse=True)[:k]
```

### Re-ranking

```
초기 검색 → Top-N 후보 → Re-ranker → Top-K 최종

Re-ranker 모델:
- Cross-encoder (더 정확하지만 느림)
- Cohere Rerank
- BGE Reranker
```

### 면접관이 주목하는 포인트
- Dense/Sparse의 장단점
- 하이브리드 결합 방법

</details>

---

## Q5. RAG에서 환각(Hallucination)을 어떻게 줄이나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
환각은 LLM이 **사실이 아닌 내용을 생성**하는 현상입니다. RAG에서는 검색된 컨텍스트를 기반으로 답변하도록 유도하여 완화합니다.

### 환각 완화 전략

**1. 프롬프트 엔지니어링**
```
[효과적인 프롬프트]
- 컨텍스트에 있는 내용만 사용하세요.
- 확실하지 않으면 "알 수 없습니다"라고 답하세요.
- 답변의 근거를 컨텍스트에서 인용하세요.

[비효과적인 프롬프트]
- 질문에 답변하세요. (제약 없음)
```

**2. 검색 품질 향상**
```
- 청킹 전략 최적화
- 임베딩 모델 개선
- 하이브리드 검색
- Re-ranking
```

**3. 컨텍스트 관리**
```
- 관련성 높은 문서만 포함
- 너무 많은 컨텍스트 지양 (노이즈)
- 중복 제거
```

**4. 출처 표시**
```python
prompt = """
컨텍스트:
[1] {doc1}
[2] {doc2}

질문: {query}

답변 시 반드시 [1], [2]와 같이 출처를 표시하세요.
"""
```

**5. Self-consistency / 검증**
```
- 여러 번 생성 후 일관된 답변 선택
- 별도 모델로 사실 검증
- 답변이 컨텍스트에 기반하는지 확인
```

### Grounding

```
답변을 검색된 문서에 "근거(ground)"시키는 것

방법:
1. 문서 내용만 사용하도록 강제
2. 인용 요구
3. Faithfulness 평가
```

### 면접관이 주목하는 포인트
- 환각의 원인 이해
- 실제 완화 경험

</details>

---

## Q6. RAG 평가 지표는 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
RAG 평가는 **검색 성능**과 **생성 품질** 두 측면에서 이루어집니다.

### 검색 평가 지표

| 지표 | 설명 |
|------|------|
| Recall@K | 상위 K개 중 관련 문서 비율 |
| Precision@K | 상위 K개의 정확도 |
| MRR | 첫 번째 관련 문서의 역순위 평균 |
| NDCG | 순위를 고려한 관련성 점수 |

### 생성 평가 지표

| 지표 | 설명 |
|------|------|
| Faithfulness | 답변이 컨텍스트에 충실한지 |
| Relevance | 답변이 질문에 관련 있는지 |
| RAGAS | RAG 전용 평가 프레임워크 |

### RAGAS 평가 프레임워크

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,      # 컨텍스트 충실도
    answer_relevancy,  # 답변 관련성
    context_precision, # 컨텍스트 정확도
    context_recall     # 컨텍스트 재현율
)

result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision]
)
```

### 면접관이 주목하는 포인트
- 검색과 생성 평가의 차이
- 실제 평가 경험

</details>

---

## 학습 체크리스트

- [ ] RAG 파이프라인 3단계 설명 가능
- [ ] 청킹 전략 3가지 이상 비교 가능
- [ ] 임베딩 모델 선택 기준 알기
- [ ] Dense/Sparse/Hybrid 검색 차이 설명 가능
- [ ] 환각 완화 전략 3가지 이상 알기
- [ ] RAG 평가 지표 이해
