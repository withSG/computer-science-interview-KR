# Monitoring & Observability

> 시스템을 눈으로 보고 이해하는 방법

## 학습 목표

- [ ] Observability 3요소를 이해한다
- [ ] Prometheus/Grafana 모니터링을 구축할 수 있다
- [ ] 로그 수집 및 분석 방법을 안다
- [ ] 장애 대응 프로세스를 설명할 수 있다

---

## 개념 설명 파일

| 파일 | 주제 | 난이도 |
|------|------|--------|
| 01-observability-concepts.md | Logs/Metrics/Traces, 카디널리티, USE·RED, SLI/SLO/에러 버짓 | ⭐ |
| 02-prometheus-grafana.md | Pull 수집, 메트릭 타입, PromQL, Exporter, 대시보드 설계 | ⭐⭐ |
| 03-logging-stack.md | 구조화 로깅, ELK vs Loki, 수집 파이프라인, 상관관계 ID | ⭐⭐ |
| 04-distributed-tracing.md | Trace/Span, W3C Trace Context, 샘플링, OpenTelemetry | ⭐⭐ |
| 05-alerting-oncall.md | 알림 계층, 증상 기반 알림, On-call, 포스트모템 | ⭐⭐ |

---

## QnA 파일

- [qna-monitoring.md](./qna-monitoring.md) - Monitoring 면접 질문 모음

---

## 핵심 키워드

`Observability` `Logs` `Metrics` `Traces` `Cardinality` `USE` `RED`
`Prometheus` `PromQL` `Grafana` `Alertmanager` `Exporter` `Histogram`
`ELK` `Loki` `Fluent Bit` `구조화 로깅` `상관관계 ID`
`Jaeger` `Tempo` `OpenTelemetry` `W3C Trace Context` `Sampling`
`SLI` `SLO` `SLA` `Error Budget` `Burn Rate` `On-call` `Postmortem`
