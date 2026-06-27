# Monitoring & Observability 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Observability 3가지 요소는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 요소 | 설명 | 도구 예시 |
|------|------|----------|
| Logs | 이벤트 기록 | ELK, Loki |
| Metrics | 수치 데이터 | Prometheus, DataDog |
| Traces | 요청 흐름 추적 | Jaeger, Zipkin |

### 3가지 요소의 역할

```
┌─────────────────────────────────────────────────────┐
│                  Observability                       │
├─────────────┬─────────────┬─────────────────────────┤
│    Logs     │   Metrics   │        Traces           │
├─────────────┼─────────────┼─────────────────────────┤
│ "무슨 일이  │ "얼마나     │ "어디서 느려졌지?"      │
│  일어났지?" │  심각하지?" │                         │
├─────────────┼─────────────┼─────────────────────────┤
│ 상세한 정보 │ 집계된 수치 │ 분산 요청 추적          │
│ 디버깅      │ 대시보드    │ 병목 구간 파악          │
│ 감사 추적   │ 알림 설정   │ 서비스 의존성           │
└─────────────┴─────────────┴─────────────────────────┘
```

### 실제 장애 대응 예시

```
1. Alert 발생: "API 응답시간 > 2초" (Metrics)
       │
       ▼
2. 대시보드 확인: 어떤 서비스가 느린지 (Metrics)
       │
       ▼
3. Trace 확인: DB 쿼리에서 3초 소요 (Traces)
       │
       ▼
4. 로그 확인: 특정 쿼리 슬로우 로그 (Logs)
       │
       ▼
5. 원인 파악: 인덱스 없는 테이블 풀 스캔
```

### Monitoring vs Observability

```
Monitoring (모니터링):
- "내가 예상한 문제"를 감지
- 미리 정의된 메트릭/알림
- "이 값이 X를 넘으면 알려줘"

Observability (관측가능성):
- "예상하지 못한 문제"도 파악
- 데이터를 조합해 원인 분석
- "왜 이런 일이 발생했는지 추적"
```

</details>

---

## Q2. Prometheus와 Grafana의 역할은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 도구 | 역할 | 특징 |
|------|------|------|
| Prometheus | 메트릭 수집/저장 | Pull 방식, TSDB |
| Grafana | 시각화/대시보드 | 다양한 데이터소스 지원 |
| AlertManager | 알림 관리 | 그룹핑, 라우팅 |

### 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    Grafana                           │
│              (시각화/대시보드)                        │
└───────────────────┬─────────────────────────────────┘
                    │ Query (PromQL)
┌───────────────────▼─────────────────────────────────┐
│                 Prometheus                           │
│              (메트릭 저장소)                          │
├─────────────────────────────────────────────────────┤
│  TSDB (Time Series DB)                               │
└───────────────────┬─────────────────────────────────┘
                    │ Pull (scrape)
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │  App    │ │  App    │ │  Node   │
   │ :8080/  │ │ :8081/  │ │Exporter │
   │ metrics │ │ metrics │ │ :9100   │
   └─────────┘ └─────────┘ └─────────┘
```

### Prometheus 메트릭 타입

```
Counter (카운터):
- 증가만 하는 값
- 예: 요청 수, 에러 수
- http_requests_total{method="GET"} 1234

Gauge (게이지):
- 증감하는 값
- 예: CPU 사용률, 메모리
- node_memory_available_bytes 8589934592

Histogram (히스토그램):
- 분포 측정
- 예: 응답시간 분포
- http_request_duration_seconds_bucket{le="0.5"} 100

Summary (요약):
- 분위수 계산
- 예: p99 응답시간
```

### PromQL 쿼리 예시

```promql
# 5분간 요청 수 증가율
rate(http_requests_total[5m])

# 95 percentile 응답시간
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m]))

# 에러율
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) * 100
```

### AlertManager 설정 예시

```yaml
# alertmanager.yml
route:
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        send_resolved: true

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '<key>'
```

</details>

---

## Q3. 로그 수집 아키텍처를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### ELK Stack

```
┌─────────────────────────────────────────────────────┐
│                    Kibana                            │
│               (시각화/검색 UI)                        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│               Elasticsearch                          │
│            (검색/저장 엔진)                           │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│                 Logstash                             │
│           (수집/변환/전송)                            │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │Filebeat │ │Filebeat │ │Filebeat │
   └─────────┘ └─────────┘ └─────────┘
   (경량 수집기)
```

### Loki + Grafana (경량 대안)

```
┌─────────────────────────────────────────────────────┐
│                   Grafana                            │
│            (로그 검색/시각화)                         │
└───────────────────┬─────────────────────────────────┘
                    │ LogQL
┌───────────────────▼─────────────────────────────────┐
│                    Loki                              │
│          (인덱스: 라벨만, 저장: 압축)                 │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │Promtail │ │Promtail │ │Promtail │
   └─────────┘ └─────────┘ └─────────┘
```

### ELK vs Loki 비교

| 구분 | ELK | Loki |
|------|-----|------|
| 인덱싱 | 전체 텍스트 | 라벨만 |
| 저장 비용 | 높음 | 낮음 |
| 검색 속도 | 매우 빠름 | 라벨 필터 후 빠름 |
| 리소스 | 많이 필요 | 경량 |
| 학습곡선 | 높음 | 낮음 |

### 구조화된 로그 (권장)

```json
// 비구조화 (Bad)
"User john logged in from 192.168.1.1"

// 구조화 (Good)
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "User logged in",
  "user_id": "john",
  "ip": "192.168.1.1",
  "service": "auth-service",
  "trace_id": "abc123"
}
```

</details>

---

## Q4. 분산 추적(Distributed Tracing)이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
분산 추적은 **마이크로서비스 환경에서 요청의 전체 흐름을 추적**하는 기술입니다.

### 핵심 개념

```
Trace: 전체 요청의 여정 (하나의 요청)
  │
  ├─ Span A: API Gateway (10ms)
  │    │
  │    ├─ Span B: User Service (25ms)
  │    │    │
  │    │    └─ Span C: DB Query (15ms)
  │    │
  │    └─ Span D: Order Service (30ms)
  │         │
  │         └─ Span E: Payment API (50ms)
  │
  Total: 130ms
```

### Trace 시각화 예시

```
[API Gateway] ████████░░░░░░░░░░░░░░░░░░░░░░░░  10ms
              │
[User Service]├──████████████████░░░░░░░░░░░░░  25ms
              │  │
[DB Query]    │  └──██████████░░░░░░░░░░░░░░░░  15ms
              │
[Order Service]└──██████████████████████░░░░░░  30ms
                  │
[Payment API]     └──████████████████████████  50ms

총 소요시간: 130ms
병목 구간: Payment API (50ms)
```

### 주요 도구

| 도구 | 특징 |
|------|------|
| Jaeger | CNCF 프로젝트, K8s 친화적 |
| Zipkin | Twitter 개발, 경량 |
| OpenTelemetry | 표준 SDK, 벤더 중립 |
| AWS X-Ray | AWS 네이티브 |

### OpenTelemetry 계측 예시

```javascript
// Node.js 자동 계측
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const provider = new NodeTracerProvider();
provider.addSpanProcessor(
  new SimpleSpanProcessor(new JaegerExporter({
    serviceName: 'user-service',
    endpoint: 'http://jaeger:14268/api/traces'
  }))
);
provider.register();

// 수동 Span 생성
const tracer = provider.getTracer('my-service');
const span = tracer.startSpan('database-query');
// ... 작업 수행
span.end();
```

### Context Propagation

```
서비스 A → 서비스 B → 서비스 C

HTTP Headers로 전파:
traceparent: 00-{trace-id}-{span-id}-01
tracestate: vendor=value

예시:
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

</details>

---

## Q5. SLI, SLO, SLA의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 용어 | 정의 | 예시 |
|------|------|------|
| SLI | 측정 지표 | 가용성 99.5% (측정값) |
| SLO | 목표 수준 | 가용성 99.9% (내부 목표) |
| SLA | 계약 조건 | 가용성 99.5% (고객 약속) |

### 관계도

```
┌─────────────────────────────────────────────────────┐
│                      SLA                             │
│         (고객과의 계약, 위반 시 보상)                 │
│                   99.5%                              │
│  ┌───────────────────────────────────────────────┐  │
│  │                   SLO                          │  │
│  │      (내부 목표, SLA보다 높게 설정)            │  │
│  │                 99.9%                          │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │                SLI                       │  │  │
│  │  │         (실제 측정 지표)                 │  │  │
│  │  │     현재: 99.95% ✓                       │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### SLI 측정 지표 예시

```
가용성 (Availability):
= 성공한 요청 / 전체 요청 × 100%
= (total - errors) / total × 100%

지연시간 (Latency):
= p99 응답시간 < 200ms인 요청 비율

처리량 (Throughput):
= 초당 처리 요청 수

에러율 (Error Rate):
= 실패 요청 / 전체 요청 × 100%
```

### Error Budget (에러 예산)

```
SLO: 99.9% 가용성
= 0.1% 에러 허용

월간 에러 예산 (30일 기준):
30일 × 24시간 × 60분 = 43,200분
43,200 × 0.1% = 43.2분

"이번 달 43분까지는 장애 허용"
```

### 면접 답변 예시

```
"저희 팀은 API 응답시간 SLI를 p99 < 200ms로 정의하고
SLO를 99.9%로 설정했습니다.
SLA는 고객사와 99.5%로 계약되어 있어
내부 목표를 더 높게 잡아 여유를 확보했습니다.
Error Budget이 소진되면 신규 기능 대신
안정화 작업에 집중하는 정책을 운영합니다."
```

</details>

---

## Q6. 알림 피로(Alert Fatigue)를 어떻게 줄이나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### Alert Fatigue 원인

```
1. 너무 많은 알림
2. 낮은 우선순위 알림
3. 중복 알림
4. False Positive (오탐)
5. 조치 불가능한 알림
```

### 좋은 알림의 조건

```
┌─────────────────────────────────────────────────────┐
│              좋은 알림 체크리스트                    │
├─────────────────────────────────────────────────────┤
│ ☑ 즉각적인 조치가 필요한가?                         │
│ ☑ 이 알림으로 뭘 해야 하는지 명확한가?              │
│ ☑ 고객에게 영향이 있는가?                           │
│ ☑ 자동화로 해결할 수 없는가?                        │
│ ☑ 중복 알림이 아닌가?                               │
└─────────────────────────────────────────────────────┘
```

### 알림 계층화

```
┌──────────────────────────────────────┐
│  P1 Critical - 즉시 대응             │
│  고객 영향 있음, PagerDuty 호출      │
│  예: 서비스 다운, 데이터 유실        │
├──────────────────────────────────────┤
│  P2 High - 업무 시간 내 대응         │
│  Slack 알림, 당일 해결               │
│  예: 에러율 증가, 디스크 80%         │
├──────────────────────────────────────┤
│  P3 Medium - 계획된 시간에 대응      │
│  이메일/대시보드                      │
│  예: 비용 증가, 성능 저하 추세       │
├──────────────────────────────────────┤
│  P4 Low - 정보성                     │
│  로그/대시보드에만 기록              │
│  예: 배포 완료, 스케일링 이벤트      │
└──────────────────────────────────────┘
```

### 알림 개선 전략

```yaml
# 1. 그룹핑 (같은 알림 묶기)
group_by: ['alertname', 'cluster', 'service']
group_wait: 30s
group_interval: 5m

# 2. 억제 (관련 알림 숨기기)
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']

# 3. 정적 (조용한 시간)
mute_time_intervals:
  - name: 'maintenance'
    time_intervals:
      - weekdays: ['saturday', 'sunday']
```

### 알림 메시지 템플릿

```
❌ Bad:
"High CPU usage"

✅ Good:
"🔴 [P1] API Server CPU 95%
영향: 응답지연 5초 이상
조치: Pod 수평확장 또는 쿼리 최적화
Runbook: https://wiki/cpu-high
대시보드: https://grafana/d/api-server"
```

</details>

---

## Q7. 장애 대응 프로세스를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 장애 대응 단계

```
┌─────────────────────────────────────────────────────┐
│ 1. 탐지 (Detect)                                    │
│    - 모니터링 알림 수신                              │
│    - 고객 리포트 접수                                │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│ 2. 대응 (Respond)                                   │
│    - On-call 담당자 확인                            │
│    - 장애 채널 오픈                                  │
│    - 역할 분담 (Commander, Communicator)            │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│ 3. 완화 (Mitigate)                                  │
│    - 서비스 복구 우선 (롤백, 스케일링)               │
│    - 근본 원인은 나중에                              │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│ 4. 해결 (Resolve)                                   │
│    - 정상 상태 확인                                  │
│    - 모니터링 지속                                   │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│ 5. 사후 분석 (Postmortem)                           │
│    - 타임라인 정리                                   │
│    - 근본 원인 분석 (5 Whys)                        │
│    - 재발 방지 Action Items                         │
└─────────────────────────────────────────────────────┘
```

### On-call 역할 분담

```
Incident Commander (IC):
- 전체 상황 관리
- 의사결정
- 에스컬레이션

Communications Lead:
- 이해관계자 소통
- 상태 페이지 업데이트
- 경영진 보고

Subject Matter Expert (SME):
- 기술적 문제 해결
- 로그/메트릭 분석
- 수정 작업 수행
```

### Postmortem 템플릿

```markdown
## 장애 보고서

### 개요
- 일시: 2024-01-15 14:30 ~ 15:45 (1시간 15분)
- 영향: 결제 서비스 전체 장애
- 영향 범위: 전체 사용자의 결제 기능

### 타임라인
- 14:30 - 알림 발생 (에러율 50% 초과)
- 14:35 - On-call 담당자 확인
- 14:40 - DB 연결 풀 고갈 확인
- 15:00 - 연결 풀 사이즈 증가 배포
- 15:45 - 정상화 확인

### 근본 원인
슬로우 쿼리로 인한 DB 연결 반환 지연

### Action Items
| 항목 | 담당자 | 기한 |
|------|--------|------|
| 슬로우 쿼리 최적화 | 김개발 | 1/20 |
| 연결 풀 모니터링 추가 | 박운영 | 1/22 |
| DB 타임아웃 설정 리뷰 | 이DBA | 1/25 |
```

</details>

---

## 학습 체크리스트

- [ ] Observability 3요소 (Logs, Metrics, Traces) 설명 가능
- [ ] Prometheus/Grafana 아키텍처 이해
- [ ] PromQL 기본 쿼리 작성 가능
- [ ] 로그 수집 아키텍처 (ELK, Loki) 이해
- [ ] 분산 추적 개념과 도구 알기
- [ ] SLI/SLO/SLA 차이 설명 가능
- [ ] 알림 설계 원칙 알기
- [ ] 장애 대응 프로세스 경험 공유 가능
