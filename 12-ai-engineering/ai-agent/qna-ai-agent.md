# AI Agent / LangGraph 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. AI Agent란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
AI Agent는 **LLM이 스스로 목표 달성을 위해 추론(Reasoning)하고, 도구(Tool)를 사용하며, 그 결과를 보고 다음 행동(Action)을 결정하는 자율적인 시스템**입니다. 단발성 질의응답과 달리 "생각 → 행동 → 관찰"을 반복합니다.

### 단순 LLM 호출 vs Agent

```
단순 LLM 호출:
질문 → LLM → 답변  (1회성, 외부 상호작용 없음)

AI Agent:
질문 → [추론 → 도구 호출 → 결과 관찰] 반복 → 답변
       (목표 달성까지 루프)
```

### ReAct 패턴 (Reasoning + Acting)

대표적인 에이전트 동작 패턴입니다.

```
Thought:  사용자가 서울 날씨를 물어봤다. 날씨 API가 필요하다.
Action:   get_weather(city="Seoul")
Observation: 맑음, 23도
Thought:  정보를 얻었으니 답변할 수 있다.
Answer:   서울은 현재 맑고 23도입니다.
```

### Agent의 핵심 구성요소

| 구성요소 | 역할 |
|---------|------|
| LLM (Brain) | 추론, 계획, 의사결정 |
| Tools | 외부 세계와 상호작용 (검색, API, 코드 실행) |
| Memory | 대화/작업 이력 유지 |
| Planning | 작업을 단계로 분해 |

### 면접관이 주목하는 포인트
- 단순 호출과 에이전트의 차이 이해
- 추론-행동 루프 개념

### 꼬리 질문 대비
- "언제 에이전트를 써야 하나요?"
  → 다단계이고 사전에 모든 절차를 정의하기 어려운 작업, 외부 도구가 필요한 작업. 단순 분류/요약/추출은 단발 호출이 더 적합합니다.

</details>

---

## Q2. LangGraph의 핵심 개념을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
LangGraph는 **에이전트의 흐름을 그래프(Graph)로 표현**하는 프레임워크입니다. 노드(작업)와 엣지(연결)로 워크플로우를 정의하며, 상태(State)를 노드 간에 전달합니다. 순환(cycle)을 표현할 수 있어 에이전트의 반복 루프에 적합합니다.

### 핵심 개념

| 개념 | 설명 |
|------|------|
| **State** | 그래프 전체에서 공유되는 데이터 (노드가 읽고 갱신) |
| **Node** | 실제 작업 단위 (LLM 호출, 도구 실행 등 함수) |
| **Edge** | 노드 간 연결 (다음에 실행할 노드 결정) |
| **StateGraph** | 노드·엣지를 묶는 그래프 객체 |
| **Compile** | 그래프를 실행 가능한 형태로 변환 |

### State 정의

State는 노드 간 전달되는 "공유 메모리"입니다.

```python
from typing import TypedDict, Annotated
from operator import add

class State(TypedDict):
    messages: Annotated[list, add]  # add: 새 메시지를 누적(덮어쓰기 X)
    step_count: int
```

- `Annotated[list, add]`의 `add`는 **리듀서(reducer)** 로, 노드가 반환한 값을 기존 상태에 어떻게 합칠지 정의합니다. 지정하지 않으면 덮어쓰기됩니다.

### 그래프 구성 예시

```python
from langgraph.graph import StateGraph, START, END

def call_model(state: State):
    # LLM(claude-opus-4-8 등) 호출 후 결과를 상태에 추가
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

graph = StateGraph(State)
graph.add_node("model", call_model)
graph.add_edge(START, "model")
graph.add_edge("model", END)

app = graph.compile()
result = app.invoke({"messages": [("user", "안녕")], "step_count": 0})
```

### LangGraph를 쓰는 이유

```
- 순환(loop) 표현 가능 → 에이전트 반복 루프에 적합
- 상태 기반 → 복잡한 워크플로우의 데이터 흐름 명확
- 조건부 분기 → 동적 라우팅
- 체크포인트 → 중단/재개, Human-in-the-Loop 지원
```

### 면접관이 주목하는 포인트
- State/Node/Edge의 역할 구분
- 그래프(순환 가능)와 단순 체인(DAG)의 차이

</details>

---

## Q3. LangGraph에서 조건부 분기(add_conditional_edges)는 어떻게 동작하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
조건부 엣지는 **현재 상태를 보고 다음에 실행할 노드를 동적으로 결정**하는 라우팅입니다. `add_conditional_edges`에 라우팅 함수를 넘기면, 그 함수의 반환값에 따라 다음 노드가 선택됩니다.

### 사용 예시 (에이전트 루프)

```python
def should_continue(state: State):
    last = state["messages"][-1]
    # LLM이 도구 호출을 요청했으면 도구 노드로, 아니면 종료
    if last.tool_calls:
        return "tools"
    return END

graph.add_node("model", call_model)
graph.add_node("tools", call_tools)

graph.add_conditional_edges(
    "model",          # 출발 노드
    should_continue,  # 라우팅 함수 (상태 → 다음 노드 이름)
    {"tools": "tools", END: END}  # 반환값 → 노드 매핑
)
graph.add_edge("tools", "model")  # 도구 실행 후 다시 모델로 (루프 형성)
```

### 동작 흐름

```
model → (도구 필요?) → yes → tools → model → (도구 필요?) → no → END
                                  ↑__________________________|
                                       순환(cycle)
```

이 "model ↔ tools" 순환이 ReAct 에이전트의 핵심 루프입니다.

### 면접관이 주목하는 포인트
- 정적 엣지(add_edge)와 조건부 엣지의 차이
- 라우팅 함수가 상태를 기반으로 분기한다는 점

</details>

---

## Q4. Human-in-the-Loop(HITL)는 무엇이며 LangGraph에서 어떻게 구현하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Human-in-the-Loop는 **에이전트 실행 중 특정 시점에 사람의 검토·승인·수정을 받는** 패턴입니다. LangGraph에서는 그래프 실행을 일시 중단(`interrupt`)하고, 사람의 입력을 받은 뒤 재개합니다.

### 왜 필요한가

```
- 위험한 작업 승인 (DB 삭제, 결제, 메일 전송 등 되돌리기 어려운 행동)
- 잘못된 방향 교정 (에이전트가 엉뚱한 계획을 세웠을 때)
- 품질 검토 (최종 출력 확인)
```

### 구현 방식

LangGraph는 **체크포인터(checkpointer)** 로 상태를 저장하고, 중단 후 재개할 수 있습니다.

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command

def approve_node(state: State):
    # 실행을 멈추고 사람에게 승인 요청
    decision = interrupt({"action": state["pending_action"]})
    return {"approved": decision}

app = graph.compile(checkpointer=MemorySaver())

config = {"configurable": {"thread_id": "1"}}
app.invoke(inputs, config)        # interrupt 지점에서 멈춤
# ... 사람이 검토 ...
app.invoke(Command(resume="승인"), config)  # 사람 입력으로 재개
```

- `interrupt`: 실행을 멈추고 제어권을 호출자에게 반환
- `Command(resume=...)`: 사람의 응답을 넣어 멈춘 지점부터 재개
- `thread_id`: 어떤 실행을 재개할지 식별 (체크포인트 키)

### 면접관이 주목하는 포인트
- 어떤 작업에 HITL이 필요한지 (되돌리기 어려운 행동)
- 중단/재개를 위해 상태 저장(체크포인트)이 필요하다는 점

</details>

---

## Q5. 에이전트의 무한 루프는 어떻게 방지하나요? (recursion_limit) ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
에이전트는 "model ↔ tools" 같은 순환 구조라서, 종료 조건을 충족하지 못하면 무한히 반복할 수 있습니다. LangGraph는 `recursion_limit`으로 **최대 실행(노드 전이) 횟수를 제한**하여 이를 방지합니다.

### 무한 루프가 생기는 상황

```
- LLM이 계속 도구를 호출하고 종료 조건에 도달하지 못함
- 도구가 항상 에러를 반환해 같은 시도를 반복
- 라우팅 함수가 잘못되어 END로 가지 않음
```

### recursion_limit 설정

```python
# 기본값은 25. 초과 시 GraphRecursionError 발생
app.invoke(inputs, {"recursion_limit": 10})
```

```python
from langgraph.errors import GraphRecursionError

try:
    result = app.invoke(inputs, {"recursion_limit": 10})
except GraphRecursionError:
    # 제한 도달 → 안전하게 종료/대체 응답
    result = "작업을 완료하지 못했습니다. 다시 시도해주세요."
```

### 추가 방어 전략

```
1. recursion_limit으로 상한 설정 (하드 리밋)
2. 상태에 step_count를 두고 일정 횟수 초과 시 종료 분기
3. 도구 호출 결과를 검증해 같은 실패 반복 방지
4. 명확한 종료 조건을 프롬프트/라우팅에 명시
```

### 면접관이 주목하는 포인트
- 에이전트 루프의 위험성 인지
- recursion_limit이 비용/안전 측면의 가드레일임을 이해

</details>

---

## Q6. 프롬프트 엔지니어링과 플로우(플로우) 엔지니어링의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
- **프롬프트 엔지니어링**: 하나의 LLM 호출에서 **프롬프트(지시문)를 잘 설계**해 좋은 출력을 얻는 것
- **플로우 엔지니어링**: 여러 단계·도구·검증을 **워크플로우(흐름)로 구성**해 문제를 풀어내는 것

복잡한 작업은 한 번의 프롬프트로 해결하기 어렵기 때문에, 작업을 단계로 나누고 각 단계를 노드로 구성하는 플로우 엔지니어링이 중요해졌습니다.

### 비교

| 구분 | 프롬프트 엔지니어링 | 플로우 엔지니어링 |
|------|--------------------|-------------------|
| 단위 | 단일 호출 | 다단계 워크플로우 |
| 초점 | 지시문 설계 | 단계 분해·라우팅·검증 |
| 예시 | Few-shot, CoT | 계획→실행→검증→재시도 루프 |
| 도구 | 프롬프트 템플릿 | LangGraph 등 오케스트레이션 |

### 플로우 엔지니어링 예시

```
[계획 수립] → [코드 생성] → [테스트 실행]
                                  │
                        실패 ─────┤
                                  ↓
                          [수정] → [재실행]
                                  │
                        성공 ─────→ [완료]
```

단일 프롬프트로 "완벽한 코드를 써줘"라고 하는 대신, 생성-테스트-수정 루프로 신뢰성을 높입니다.

### 면접관이 주목하는 포인트
- 복잡한 작업에서 단계 분해의 가치
- 검증/재시도 루프로 신뢰성을 확보한다는 관점

</details>

---

## Q7. 에이전트와 RAG, 단순 LLM 호출은 어떻게 선택하나요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
작업 복잡도와 비용·신뢰성 요구에 따라 가장 단순한 방식부터 선택합니다.

| 방식 | 적합한 작업 | 특징 |
|------|------------|------|
| 단순 LLM 호출 | 분류, 요약, 추출, Q&A | 1회 호출, 빠르고 저렴 |
| RAG | 외부/최신 지식 기반 답변 | 검색 + 생성, 환각 완화 ([RAG](../rag-pipeline/)) |
| 워크플로우 | 코드로 제어 가능한 다단계 | 흐름을 개발자가 통제 |
| 에이전트 | 사전 정의 어려운 자율 작업 | 모델이 경로를 스스로 결정, 비용·지연 큼 |

### 에이전트 도입 체크리스트

```
1. 복잡성: 다단계이고 사전에 모든 절차 정의가 어려운가?
2. 가치: 비용·지연 증가를 정당화할 만한가?
3. 실현성: 모델이 이 작업을 수행할 역량이 되는가?
4. 오류 비용: 실수를 검출/복구할 수 있는가? (테스트, 검토, 롤백)
```

하나라도 "아니오"라면 더 단순한 방식(단발 호출/워크플로우)을 권장합니다.

### 멀티 에이전트
하나의 거대한 에이전트보다, 역할을 나눈 여러 에이전트(예: 리서처/작성자/검토자)가 협업하도록 구성하면 각 단계의 품질과 디버깅이 쉬워집니다. 다만 조율 비용이 늘어납니다.

### 면접관이 주목하는 포인트
- "가장 단순한 방식부터" 원칙
- 에이전트의 비용/지연 트레이드오프 인식

</details>

---

## Q8. AI 하네스(Agent Harness)란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
AI 하네스는 **LLM(모델)을 실제로 동작하는 에이전트로 만들어주는 주변 소프트웨어 골격**입니다. 모델 자체는 텍스트를 생성할 뿐이고, 하네스가 에이전트 루프·도구 실행·컨텍스트 관리·프롬프트 구성·안전장치를 담당합니다. 흔히 **"모델은 지능을, 하네스는 행위 능력(agency)을 제공한다"** 고 표현합니다.

### 모델 vs 하네스

```
모델(LLM):   주어진 컨텍스트를 보고 다음 토큰/도구 호출을 생성
하네스:      모델 주변의 모든 것 — 무엇을 보여주고, 무엇을 실행하고,
             언제 멈출지를 결정

같은 모델이라도 하네스가 좋으면 성능이 크게 달라진다.
(하네스가 모델이 보는 것·할 수 있는 것을 결정하기 때문)
```

### 하네스의 주요 책임

| 책임 | 설명 |
|------|------|
| 에이전트 루프 | 추론-행동 반복, 종료 시점 결정 |
| 도구 실행 | 도구 정의, 호출 파싱, 실행, 결과 주입 |
| 컨텍스트 관리 | 컨텍스트 윈도우 관리, 압축(compaction), 메모리 |
| 프롬프트 구성 | 시스템 프롬프트, 컨텍스트 조립 |
| 안전/권한 | 위험 작업 승인 게이트 (HITL) |
| 관측성 | 로깅, 추적, 비용 측정 |

### 예시

```
- Claude Code, Cursor : 코딩 에이전트 하네스
- LangGraph           : 하네스를 직접 만드는 프레임워크 (Q2 참고)
- 직접 만든 루프       : while 루프 + 도구 디스패치 + 컨텍스트 관리
```

### 왜 중요한가
모델 성능이 같아도, 하네스가 **무엇을 컨텍스트에 넣고(검색·메모리), 어떤 도구를 주고, 언제 멈추는지**를 잘 설계하면 결과 품질이 크게 향상됩니다. 최근에는 "모델만큼 하네스가 중요하다"는 인식이 자리잡았습니다.

### 면접관이 주목하는 포인트
- 모델과 하네스의 역할 분리
- 컨텍스트 관리가 하네스 품질을 좌우한다는 점

### 꼬리 질문 대비
- "하네스와 LangGraph의 관계는?"
  → LangGraph는 하네스(에이전트 루프·상태·라우팅)를 구조적으로 만들 수 있게 해주는 오케스트레이션 프레임워크입니다.

</details>

---

## Q9. BMAD Method란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
BMAD(Breakthrough Method of Agile AI-Driven Development)는 **애자일 방법론을 AI 에이전트로 구현한 오픈소스 프레임워크**입니다. 분석가·PM·아키텍트·스크럼마스터·개발자·QA 등 **역할별 전문 에이전트**가 협업해 소프트웨어 개발을 진행합니다.

### 두 가지 핵심 아이디어

```
1. 에이전트 기반 계획 (Agentic Planning)
   Analyst / PM / Architect 에이전트가 협업해
   상세한 PRD(요구사항)와 아키텍처 문서를 작성

2. 컨텍스트 엔지니어링 개발 (Context-Engineered Development)
   Scrum Master 에이전트가 계획을 "필요한 모든 컨텍스트가
   담긴" 상세 개발 스토리로 변환 → Dev 에이전트가 추측 없이 구현
```

### 해결하려는 문제

```
- 계획 불일치(planning inconsistency): 산출물이 들쭉날쭉
- 컨텍스트 손실(context loss): AI가 작업 중 맥락을 잃음
  → AI 코딩에서 가장 흔한 실패 원인
```

각 개발 스토리에 충분한 컨텍스트(요구사항·설계·제약)를 미리 담아 전달함으로써, 개발 에이전트가 맥락을 잃지 않게 합니다.

### 역할별 에이전트 (예시)

| 역할 | 담당 |
|------|------|
| Analyst | 시장/요구 분석 |
| PM | PRD(제품 요구사항) 작성 |
| Architect | 아키텍처 설계 |
| Scrum Master | 계획을 상세 개발 스토리로 분해 |
| Dev | 스토리 구현 |
| QA | 검증/리뷰 |

### 워크플로우

```
[계획 단계] 큰 컨텍스트에서 PRD·아키텍처 작성
       ↓
[개발 단계] IDE에서 스토리 단위로 구현·검증 반복
```

> 플로우 엔지니어링(Q6)을 SW 개발 프로세스 전반에 적용한 사례로 볼 수 있습니다. 소프트웨어 외 도메인에도 적용 가능합니다.

### 면접관이 주목하는 포인트
- AI 에이전트를 개발 프로세스(애자일)에 접목하는 방식
- 컨텍스트 엔지니어링이 AI 코딩 품질에 미치는 영향

</details>

---

## 학습 체크리스트

- [ ] AI Agent와 단순 LLM 호출의 차이 설명 가능
- [ ] ReAct(추론-행동) 루프 설명 가능
- [ ] LangGraph의 State/Node/Edge 역할 구분 가능
- [ ] 조건부 분기(add_conditional_edges)로 라우팅 설명 가능
- [ ] Human-in-the-Loop(interrupt)의 필요성과 구현 이해
- [ ] recursion_limit으로 무한 루프를 방지하는 이유 이해
- [ ] 프롬프트 엔지니어링 vs 플로우 엔지니어링 구분 가능
- [ ] AI 하네스(Agent Harness)의 역할과 중요성 이해
- [ ] BMAD Method의 개념(에이전트 기반 계획·컨텍스트 엔지니어링) 이해
