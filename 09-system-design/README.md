# 시스템 설계 (System Design)

> 대규모 시스템의 설계 원칙과 패턴

## 학습 목표

- [ ] 캐싱 전략을 이해하고 적용할 수 있다
- [ ] 확장성 있는 시스템 설계 원칙을 안다
- [ ] 성능 최적화 기법을 설명할 수 있다
- [ ] 시스템 설계 면접에 대응할 수 있다

---

## 하위 주제

| 폴더 | 주제 | 난이도 |
|------|------|--------|
| [caching](./caching/) | 캐싱 전략 | ⭐⭐ |
| [scalability](./scalability/) | 확장성 | ⭐⭐⭐ |
| [performance](./performance/) | 성능 최적화 | ⭐⭐ |

---

## 개념 설명 파일 (인프라 공통)

| 파일 | 주제 | 난이도 |
|------|------|--------|
| [01-load-balancer.md](./01-load-balancer.md) | 로드 밸런서 (L4/L7, 헬스체크, 이중화) | ⭐⭐ |
| [02-zero-downtime-deployment.md](./02-zero-downtime-deployment.md) | 무중단 배포 (롤링/블루-그린/카나리) | ⭐⭐⭐ |
| [03-high-traffic.md](./03-high-traffic.md) | 대용량 트래픽 대응 | ⭐⭐⭐ |

> 하위 폴더의 개념 설명 파일은 각 폴더 README를 참고하세요.

---

## 학습 순서 권장

```
1. 캐싱 전략 (Redis, CDN)
       ↓
2. 확장성 (로드밸런싱, 샤딩)
       ↓
3. 성능 최적화 (병목 분석, 최적화)
```

---

## QnA 파일

- [qna-infrastructure.md](./qna-infrastructure.md) - 로드밸런서(L4/L7), 무중단 배포, 대용량 트래픽 등 인프라 면접 질문 모음

> 캐싱·확장성·성능 QnA는 각 하위 폴더(caching/scalability/performance) 내 qna 파일을 참고하세요.

---

## 핵심 키워드

`Cache` `Redis` `CDN` `Cache Invalidation`
`Horizontal Scaling` `Vertical Scaling` `Load Balancer`
`Sharding` `Partitioning` `Replication`
`Latency` `Throughput` `Bottleneck`

---

## 관련 학습 자료

- [Cloud Engineering - DevOps & CI/CD](../10-cloud-engineering/devops-cicd/) - 무중단 배포 (Rolling, Blue-Green, Canary)
- [Cloud Engineering](../10-cloud-engineering/) - 로드밸런서(L4/L7), 대용량 트래픽 대응 등 인프라 주제
