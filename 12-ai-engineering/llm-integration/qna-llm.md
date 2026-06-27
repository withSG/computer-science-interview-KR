# LLM 통합 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 프롬프트 엔지니어링(Prompt Engineering)이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
프롬프트 엔지니어링은 **LLM에게 원하는 결과를 얻기 위해 입력(프롬프트)을 최적화**하는 기술입니다.

### 주요 기법

**1. Zero-shot Prompting**
```
예시 없이 직접 질문

프롬프트:
"다음 문장의 감정을 분류하세요: '이 제품 정말 좋아요!'
답변: "
```

**2. Few-shot Prompting**
```
몇 가지 예시 제공

프롬프트:
"문장의 감정을 분류하세요.

문장: '너무 실망이에요'
감정: 부정

문장: '완벽해요!'
감정: 긍정

문장: '이 제품 정말 좋아요!'
감정: "
```

**3. Chain-of-Thought (CoT)**
```
단계별 추론 유도

프롬프트:
"문제를 단계별로 풀어보세요.

Q: 사과 5개가 있고 3개를 먹었습니다. 남은 사과는?
A: 단계별로 생각해봅시다.
1. 처음 사과 개수: 5개
2. 먹은 사과 개수: 3개
3. 남은 사과: 5 - 3 = 2개
답: 2개

Q: 연필 10자루 중 4자루를 친구에게 줬습니다. 남은 연필은?
A: "
```

**4. Role Prompting**
```
역할 부여

프롬프트:
"당신은 10년 경력의 시니어 개발자입니다.
다음 코드를 리뷰해주세요..."
```

### 효과적인 프롬프트 구조

```
[역할/컨텍스트]
당신은 ...입니다.

[지시]
다음 작업을 수행하세요:
1. ...
2. ...

[입력]
{user_input}

[출력 형식]
JSON 형식으로 답변하세요:
{"result": "..."}

[제약 조건]
- 확실하지 않으면 "모름"이라고 답하세요
- 200자 이내로 답변하세요
```

### 면접관이 주목하는 포인트
- 다양한 기법 활용 경험
- 프롬프트 최적화 과정

</details>

---

## Q2. Temperature와 Top-p 파라미터는 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Temperature와 Top-p는 **LLM 출력의 무작위성(창의성)을 조절**하는 파라미터입니다.

### Temperature

```
0.0: 결정적 (항상 같은 출력)
0.7: 균형 (일반적 사용)
1.0+: 창의적 (다양한 출력)

원리:
- 다음 토큰 확률 분포를 조절
- 낮은 온도: 확률 높은 토큰에 집중
- 높은 온도: 확률 분포 평탄화
```

### Top-p (Nucleus Sampling)

```
누적 확률이 p가 될 때까지의 토큰만 고려

예: top_p=0.9
- 상위 토큰들의 누적 확률이 90%가 될 때까지만 샘플링
- 극히 낮은 확률 토큰 제외

top_p=1.0: 모든 토큰 고려
top_p=0.1: 매우 제한적
```

### 사용 가이드

| 작업 | Temperature | Top-p |
|------|-------------|-------|
| 코드 생성 | 0.0~0.3 | 0.1~0.3 |
| 사실 기반 Q&A | 0.0~0.3 | 0.1~0.5 |
| 일반 대화 | 0.5~0.7 | 0.7~0.9 |
| 창작 글쓰기 | 0.7~1.0 | 0.9~1.0 |
| 브레인스토밍 | 0.8~1.2 | 0.9~1.0 |

### 면접관이 주목하는 포인트
- 각 파라미터의 역할 이해
- 상황에 맞는 설정

</details>

---

## Q3. 토큰(Token)이란 무엇이며, 비용과 어떤 관계가 있나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
토큰은 **LLM이 텍스트를 처리하는 기본 단위**입니다. API 비용은 토큰 수에 비례합니다.

### 토큰화 예시

```
영어: 1 토큰 ≈ 4글자 또는 0.75단어
"Hello world" → ["Hello", " world"] (2 토큰)

한국어: 1 토큰 ≈ 1~2글자
"안녕하세요" → ["안", "녕", "하세요"] (3 토큰)
```

### 비용 계산

```
GPT-4 예시:
- 입력: $0.03 / 1K 토큰
- 출력: $0.06 / 1K 토큰

계산:
입력 1000 토큰 + 출력 500 토큰
= (1000 × $0.03/1000) + (500 × $0.06/1000)
= $0.03 + $0.03
= $0.06
```

### 컨텍스트 윈도우

```
GPT-4: 8K / 32K / 128K 토큰
Claude: 100K / 200K 토큰
Llama: 4K ~ 32K 토큰

제한:
입력 + 출력 ≤ 컨텍스트 윈도우

긴 문서 처리:
- 청킹으로 분할
- 요약 후 처리
- 슬라이딩 윈도우
```

### 토큰 최적화

```python
# 1. 불필요한 내용 제거
# Before
prompt = """
안녕하세요! 반갑습니다.
다음 질문에 답변해주세요.
질문: {question}
감사합니다!
"""

# After
prompt = "Q: {question}\nA:"

# 2. 출력 제한
response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    max_tokens=500  # 출력 토큰 제한
)
```

### 면접관이 주목하는 포인트
- 토큰과 비용의 관계
- 비용 최적화 경험

</details>

---

## Q4. Fine-tuning vs RAG vs Prompt Engineering의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 방법 | 설명 | 비용 | 유연성 |
|------|------|------|--------|
| Prompt Engineering | 프롬프트 최적화 | 낮음 | 높음 |
| RAG | 외부 지식 검색 + 생성 | 중간 | 높음 |
| Fine-tuning | 모델 가중치 조정 | 높음 | 낮음 |

### 언제 사용하나?

**Prompt Engineering**
```
- 빠른 프로토타이핑
- 일반적인 작업
- 예시로 충분한 경우
```

**RAG**
```
- 최신 정보 필요
- 기업 내부 문서 활용
- 출처 필요
- 빈번한 지식 업데이트
```

**Fine-tuning**
```
- 특정 도메인/스타일 학습
- 일관된 출력 형식
- 대량 작업 (비용 절감)
- 모델 크기 축소 (distillation)
```

### 결합 사용

```
실무에서는 조합해서 사용

예: 고객 서비스 챗봇
1. Fine-tuning: 회사 톤앤매너 학습
2. RAG: 제품/정책 문서 검색
3. Prompt: 답변 형식 지정
```

### 비교표

| 기준 | Prompt | RAG | Fine-tuning |
|------|--------|-----|-------------|
| 구현 난이도 | 쉬움 | 중간 | 어려움 |
| 데이터 필요량 | 없음 | 문서 | 수천+ 예시 |
| 업데이트 | 즉시 | 실시간 | 재학습 필요 |
| 환각 제어 | 어려움 | 좋음 | 중간 |

### 면접관이 주목하는 포인트
- 각 방법의 적합한 상황
- 실제 선택 경험

</details>

---

## Q5. LLM API 통합 시 고려사항은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 1. 에러 처리

```python
import openai
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(min=1, max=10)
)
def call_llm(prompt):
    try:
        response = client.chat.completions.create(...)
        return response
    except openai.RateLimitError:
        # Rate limit 대기 후 재시도
        raise
    except openai.APIError as e:
        # 로깅 및 폴백
        logger.error(f"API Error: {e}")
        raise
```

### 2. 비용 관리

```python
# 토큰 카운팅
import tiktoken

def count_tokens(text, model="gpt-4"):
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 예산 제한
if count_tokens(prompt) > MAX_TOKENS:
    prompt = truncate_prompt(prompt)
```

### 3. 레이턴시 최적화

```python
# 스트리밍 응답
stream = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        yield chunk.choices[0].delta.content

# 캐싱
@cache(ttl=3600)
def get_embedding(text):
    return client.embeddings.create(...)
```

### 4. 보안

```
- API 키 환경 변수 저장
- 사용자 입력 검증 (프롬프트 인젝션 방지)
- PII(개인정보) 필터링
- 출력 검증
```

### 면접관이 주목하는 포인트
- 프로덕션 레벨 구현 경험
- 장애 대응 전략

</details>

---

## Q6. 환각(Hallucination)이란 무엇이며, 어떻게 대응하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
환각은 LLM이 **사실이 아닌 정보를 그럴듯하게 생성**하는 현상입니다.

### 환각의 유형

```
1. 사실 오류: 틀린 정보 생성
2. 출처 날조: 존재하지 않는 인용
3. 논리 오류: 잘못된 추론
4. 허구 생성: 없는 것을 있다고 함
```

### 대응 전략

**1. RAG 사용**
```
외부 문서 기반 답변 → 근거 있는 응답
```

**2. 프롬프트 설계**
```
"확실하지 않으면 '모르겠습니다'라고 답하세요."
"답변의 근거를 제시하세요."
"추측하지 마세요."
```

**3. 검증 레이어**
```python
def verify_response(response, context):
    # 응답이 컨텍스트에 기반하는지 확인
    # 별도 모델로 사실 검증
    # 출처 확인
    pass
```

**4. 사용자 피드백**
```
- 출처 표시
- 신뢰도 점수 제공
- "AI 생성" 명시
```

### 면접관이 주목하는 포인트
- 환각 발생 원인 이해
- 실제 대응 경험

</details>

---

## 학습 체크리스트

- [ ] 프롬프트 엔지니어링 기법 4가지 이상 알기
- [ ] Temperature/Top-p 역할과 설정 기준 이해
- [ ] 토큰과 비용 관계 설명 가능
- [ ] Fine-tuning/RAG/Prompt 차이 비교 가능
- [ ] LLM API 통합 시 고려사항 알기
- [ ] 환각 대응 전략 설명 가능
