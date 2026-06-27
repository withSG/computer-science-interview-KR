# DevOps & CI/CD 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. CI/CD란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 설명 | 목적 |
|------|------|------|
| CI (Continuous Integration) | 지속적 통합 | 코드 변경 시 자동 빌드/테스트 |
| CD (Continuous Delivery) | 지속적 제공 | 배포 가능한 상태 유지 |
| CD (Continuous Deployment) | 지속적 배포 | 자동으로 프로덕션 배포 |

### CI/CD 파이프라인 흐름

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Code   │───▶│  Build  │───▶│  Test   │───▶│ Deploy  │───▶│ Monitor │
│  Commit │    │         │    │         │    │ Staging │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                  │
                                                  ▼
                                            ┌─────────┐
                                            │Production│
                                            └─────────┘
```

### CI의 핵심 원칙

```
1. 메인 브랜치에 자주 통합 (하루 1회 이상)
2. 모든 커밋에 자동 빌드/테스트
3. 빌드 실패 시 즉시 수정
4. 테스트 커버리지 유지
```

### Continuous Delivery vs Deployment

```
Continuous Delivery:
- 배포 준비 상태까지 자동화
- 프로덕션 배포는 수동 승인
- "언제든 배포 가능한 상태"

Continuous Deployment:
- 프로덕션 배포까지 완전 자동화
- 테스트 통과 시 자동 배포
- 더 빠른 피드백 루프
```

### 면접 답변 예시

```
"CI/CD를 도입하여 배포 주기를 2주에서 하루로 단축했습니다.
PR 생성 시 자동으로 린트, 테스트, 빌드가 실행되고
main 브랜치 머지 시 스테이징 환경에 자동 배포됩니다.
프로덕션은 승인 후 배포하는 Continuous Delivery를 적용했습니다."
```

</details>

---

## Q2. Blue-Green 배포와 Canary 배포의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 전략 | 방식 | 장점 | 단점 |
|------|------|------|------|
| Blue-Green | 두 환경 전환 | 빠른 롤백 | 리소스 2배 |
| Canary | 점진적 트래픽 이동 | 위험 최소화 | 복잡한 설정 |
| Rolling | 순차적 교체 | 리소스 효율적 | 롤백 느림 |

### Blue-Green 배포

```
단계 1: Blue(현재)에 100% 트래픽
┌─────────────────────────────────┐
│         Load Balancer           │
└────────────┬────────────────────┘
             │ 100%
             ▼
      ┌──────────────┐     ┌──────────────┐
      │    Blue      │     │   Green      │
      │   v1.0       │     │   v2.0       │
      │  (Active)    │     │  (Standby)   │
      └──────────────┘     └──────────────┘

단계 2: 트래픽을 Green으로 전환
             │ 100%
             ▼
      ┌──────────────┐     ┌──────────────┐
      │    Blue      │     │   Green      │
      │   v1.0       │     │   v2.0       │
      │  (Standby)   │     │  (Active)    │
      └──────────────┘     └──────────────┘
```

### Canary 배포

```
단계 1: 5% 트래픽으로 시작
         Load Balancer
         ┌────┴────┐
        95%       5%
         │         │
    ┌────┴────┐ ┌──┴──┐
    │  v1.0   │ │v2.0 │
    │(Stable) │ │Canary│
    └─────────┘ └─────┘

단계 2: 점진적 확대 (25% → 50% → 100%)
         Load Balancer
         ┌────┴────┐
        50%       50%
         │         │
    ┌────┴────┐ ┌──┴──┐
    │  v1.0   │ │v2.0 │
    └─────────┘ └─────┘
```

### Rolling 배포

```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│v1.0 │ │v1.0 │ │v1.0 │ │v1.0 │
└─────┘ └─────┘ └─────┘ └─────┘
   │
   ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│v2.0 │ │v1.0 │ │v1.0 │ │v1.0 │
└─────┘ └─────┘ └─────┘ └─────┘
   │       │
   ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│v2.0 │ │v2.0 │ │v1.0 │ │v1.0 │
└─────┘ └─────┘ └─────┘ └─────┘
```

### 선택 기준

```
Blue-Green:
- 빠른 롤백이 중요할 때
- 다운타임 제로 필수
- 리소스 비용 감당 가능

Canary:
- 신규 기능 위험도 높을 때
- 점진적 검증 필요
- A/B 테스트 병행

Rolling:
- 리소스 제약 있을 때
- 단순한 업데이트
- K8s 기본 전략
```

</details>

---

## Q3. GitHub Actions와 Jenkins의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | GitHub Actions | Jenkins |
|------|---------------|---------|
| 호스팅 | SaaS (GitHub 제공) | Self-hosted |
| 설정 | YAML 파일 | Groovy/UI |
| 확장성 | Marketplace Actions | 플러그인 |
| 비용 | 무료 티어 제공 | 서버 비용 |
| 러닝커브 | 낮음 | 높음 |

### GitHub Actions 예시

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### Jenkins Pipeline 예시

```groovy
// Jenkinsfile
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
}
```

### 선택 기준

```
GitHub Actions 선택:
- GitHub 사용 중
- 빠른 시작 원할 때
- 관리 부담 줄이고 싶을 때

Jenkins 선택:
- 복잡한 파이프라인
- On-premise 환경
- 기존 Jenkins 인프라 있음
- 완전한 커스터마이징 필요
```

</details>

---

## Q4. GitOps란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
GitOps는 **Git을 Single Source of Truth로 사용**하여 인프라와 애플리케이션을 선언적으로 관리하는 방식입니다.

### GitOps 원칙

```
1. 선언적 (Declarative)
   - 원하는 상태를 코드로 정의
   - YAML, HCL 등

2. 버전 관리 (Versioned)
   - 모든 변경사항 Git에 기록
   - 히스토리 추적 가능

3. 자동 적용 (Automated)
   - Git 변경 → 자동 배포
   - Pull/Push 기반

4. 지속적 조정 (Reconciled)
   - 실제 상태와 선언 상태 비교
   - 차이 발생 시 자동 복구
```

### Push vs Pull 기반

```
Push 기반 (전통적):
┌────────┐    ┌────────┐    ┌────────┐
│  Git   │───▶│CI/CD   │───▶│Cluster │
│        │    │Pipeline│    │        │
└────────┘    └────────┘    └────────┘
              (권한 필요)

Pull 기반 (GitOps):
┌────────┐    ┌────────┐    ┌────────┐
│  Git   │◀───│ ArgoCD │───▶│Cluster │
│        │    │ (Pull) │    │        │
└────────┘    └────────┘    └────────┘
              (클러스터 내부)
```

### ArgoCD 예시

```yaml
# application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/k8s-manifests
    targetRevision: main
    path: apps/my-app
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### GitOps 장점

```
- 감사 로그: Git 히스토리 = 배포 히스토리
- 롤백 용이: git revert로 즉시 롤백
- 보안 강화: 클러스터 자격증명 외부 노출 없음
- 일관성: 환경 드리프트 방지
```

</details>

---

## Q5. 파이프라인에서 테스트 전략은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 테스트 피라미드

```
                 ▲
                /│\
               / │ \     E2E Test
              /  │  \    (느림, 비용↑)
             /───┼───\
            /    │    \   Integration Test
           /     │     \  (중간)
          /──────┼──────\
         /       │       \ Unit Test
        /        │        \(빠름, 비용↓)
       ────────────────────
         많음 ←─────→ 적음
```

### 파이프라인 테스트 단계

```yaml
# CI Pipeline 테스트 전략
stages:
  - lint:        # 코드 품질 검사
      - eslint
      - prettier

  - unit-test:   # 단위 테스트 (빠름)
      - jest
      - coverage check (80%+)

  - integration: # 통합 테스트
      - API 테스트
      - DB 연동 테스트

  - e2e:         # E2E 테스트 (느림)
      - Cypress
      - Playwright

  - security:    # 보안 스캔
      - SAST (정적 분석)
      - Dependency check
```

### 테스트 병렬화

```yaml
# GitHub Actions 병렬 테스트
jobs:
  unit-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npm test -- --shard=${{ matrix.shard }}/4
```

### 테스트 최적화 전략

```
1. 캐싱
   - node_modules 캐시
   - Docker 레이어 캐시
   - 테스트 결과 캐시

2. 병렬 실행
   - 매트릭스 빌드
   - 테스트 샤딩

3. 선택적 실행
   - 변경된 파일 기반
   - 라벨/태그 기반

4. 빠른 실패
   - 린트 → 유닛 → 통합 순서
   - 실패 시 즉시 중단
```

</details>

---

## Q6. 롤백 전략은 어떻게 구현하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 롤백 방법 비교

| 방법 | 속도 | 복잡도 | 사용 시점 |
|------|------|--------|----------|
| 이전 버전 재배포 | 느림 | 낮음 | CI/CD 재실행 |
| 이미지 태그 변경 | 빠름 | 낮음 | 컨테이너 환경 |
| 트래픽 전환 | 즉시 | 중간 | Blue-Green |
| Git Revert | 중간 | 낮음 | GitOps |

### Kubernetes 롤백

```bash
# 배포 히스토리 확인
kubectl rollout history deployment/myapp

# 이전 버전으로 롤백
kubectl rollout undo deployment/myapp

# 특정 버전으로 롤백
kubectl rollout undo deployment/myapp --to-revision=2

# 롤백 상태 확인
kubectl rollout status deployment/myapp
```

### 자동 롤백 설정

```yaml
# ArgoCD 자동 롤백
apiVersion: argoproj.io/v1alpha1
kind: Application
spec:
  syncPolicy:
    automated:
      selfHeal: true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### 롤백 트리거 조건

```
자동 롤백 조건:
1. Health Check 실패
   - Readiness Probe 실패
   - Liveness Probe 실패

2. 메트릭 기반
   - 에러율 > 5%
   - 응답시간 > 2초
   - CPU/메모리 급증

3. Canary 분석 실패
   - Prometheus 메트릭 비교
   - 자동 롤백 실행
```

### 면접 답변 예시

```
"배포 후 5분간 에러율을 모니터링하고
5% 초과 시 자동 롤백되도록 구성했습니다.
ArgoCD의 자동 동기화와 Prometheus 알림을 연동해
문제 발생 시 Slack 알림과 함께 이전 버전으로
자동 복구됩니다."
```

</details>

---

## Q7. Infrastructure as Code(IaC)란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
IaC는 **인프라를 코드로 정의하고 관리**하는 방식입니다.

### IaC 도구 비교

| 도구 | 방식 | 언어 | 특징 |
|------|------|------|------|
| Terraform | 선언적 | HCL | 멀티 클라우드 |
| CloudFormation | 선언적 | YAML/JSON | AWS 전용 |
| Ansible | 절차적 | YAML | 구성 관리 |
| Pulumi | 선언적 | 범용 언어 | TypeScript/Python |

### Terraform 예시

```hcl
# main.tf
provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "production-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-northeast-2a"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "web-server"
  }
}
```

### IaC 워크플로우

```
┌─────────────┐
│   Write     │  인프라 코드 작성
└──────┬──────┘
       │
┌──────▼──────┐
│   Plan      │  변경사항 미리보기
└──────┬──────┘
       │
┌──────▼──────┐
│   Review    │  코드 리뷰 (PR)
└──────┬──────┘
       │
┌──────▼──────┐
│   Apply     │  인프라 적용
└──────┬──────┘
       │
┌──────▼──────┐
│   State     │  상태 파일 관리
└─────────────┘
```

### IaC 장점

```
- 버전 관리: 인프라 변경 이력 추적
- 재현성: 동일 환경 반복 생성
- 자동화: CI/CD와 통합
- 문서화: 코드 자체가 문서
- 협업: PR 기반 리뷰 가능
```

</details>

---

## 학습 체크리스트

- [ ] CI/CD 개념과 차이점 설명 가능
- [ ] 배포 전략 3가지 비교 가능
- [ ] GitHub Actions/Jenkins 파이프라인 작성 가능
- [ ] GitOps 개념과 ArgoCD 이해
- [ ] 테스트 피라미드와 파이프라인 전략 알기
- [ ] 롤백 전략 설명 가능
- [ ] IaC 개념과 Terraform 기본 이해
