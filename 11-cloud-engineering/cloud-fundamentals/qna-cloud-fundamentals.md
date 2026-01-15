# 클라우드 기초 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. IaaS, PaaS, SaaS의 차이점은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 제공 범위 | 사용자 관리 | 예시 |
|------|----------|------------|------|
| **IaaS** | 인프라 (서버, 스토리지, 네트워크) | OS, 런타임, 앱 | AWS EC2, Azure VM |
| **PaaS** | 인프라 + 플랫폼 (OS, 런타임) | 앱, 데이터 | Heroku, AWS Elastic Beanstalk |
| **SaaS** | 모든 것 (완성된 서비스) | 사용만 | Gmail, Slack, Salesforce |

### 책임 분담 시각화

```
              On-Prem   IaaS    PaaS    SaaS
Applications    You      You     You    Vendor
Data            You      You     You    Vendor
Runtime         You      You    Vendor  Vendor
Middleware      You      You    Vendor  Vendor
O/S             You      You    Vendor  Vendor
Virtualization  You     Vendor  Vendor  Vendor
Servers         You     Vendor  Vendor  Vendor
Storage         You     Vendor  Vendor  Vendor
Networking      You     Vendor  Vendor  Vendor
```

### 선택 기준

```
IaaS: 인프라 완전 제어 필요, 레거시 마이그레이션
PaaS: 개발에 집중, 인프라 관리 최소화
SaaS: 즉시 사용, 커스터마이징 제한적
```

### 면접관이 주목하는 포인트
- 각 모델의 책임 범위 이해
- 실제 사용 경험

</details>

---

## Q2. Type 1과 Type 2 Hypervisor의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Type 1 (Bare-metal) | Type 2 (Hosted) |
|------|---------------------|-----------------|
| 설치 위치 | 하드웨어 직접 | 호스트 OS 위 |
| 성능 | 높음 | 중간 (OS 오버헤드) |
| 용도 | 프로덕션, 데이터센터 | 개발, 테스트 |
| 예시 | VMware ESXi, KVM, Hyper-V | VirtualBox, VMware Workstation |

### 구조 비교

```
Type 1:                          Type 2:
┌─────────┐ ┌─────────┐         ┌─────────┐ ┌─────────┐
│   VM    │ │   VM    │         │   VM    │ │   VM    │
└────┬────┘ └────┬────┘         └────┬────┘ └────┬────┘
┌────┴───────────┴────┐         ┌────┴───────────┴────┐
│    Hypervisor       │         │    Hypervisor       │
└──────────┬──────────┘         └──────────┬──────────┘
┌──────────┴──────────┐         ┌──────────┴──────────┐
│      Hardware       │         │      Host OS        │
└─────────────────────┘         └──────────┬──────────┘
                                ┌──────────┴──────────┐
                                │      Hardware       │
                                └─────────────────────┘
```

### 클라우드에서의 사용

```
AWS EC2: Nitro (KVM 기반) - Type 1
Azure: Hyper-V - Type 1
GCP: KVM - Type 1

개발 환경: VirtualBox, VMware Workstation - Type 2
```

### 면접관이 주목하는 포인트
- 구조적 차이 이해
- 각각의 적합한 사용 사례

</details>

---

## Q3. 가상화(VM)와 컨테이너의 차이점은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | VM | Container |
|------|-----|-----------|
| 격리 수준 | 완전 격리 (OS 레벨) | 프로세스 격리 |
| OS | 각 VM마다 Guest OS | Host OS 커널 공유 |
| 부팅 시간 | 분 단위 | 초 단위 |
| 이미지 크기 | GB 단위 | MB 단위 |
| 리소스 효율 | 낮음 (OS 오버헤드) | 높음 |
| 이식성 | 제한적 | 매우 높음 |

### 구조 비교

```
VM:                              Container:
┌─────────┐ ┌─────────┐         ┌─────────┐ ┌─────────┐
│  App A  │ │  App B  │         │  App A  │ │  App B  │
├─────────┤ ├─────────┤         └────┬────┘ └────┬────┘
│ Bins/Libs│ │Bins/Libs│         ┌────┴───────────┴────┐
├─────────┤ ├─────────┤         │   Container Engine  │
│ Guest OS│ │ Guest OS│         └──────────┬──────────┘
└────┬────┘ └────┬────┘         ┌──────────┴──────────┐
┌────┴───────────┴────┐         │       Host OS       │
│     Hypervisor      │         └──────────┬──────────┘
└──────────┬──────────┘         ┌──────────┴──────────┐
│      Hardware       │         │       Hardware      │
└─────────────────────┘         └─────────────────────┘
```

### 언제 무엇을 사용하나?

```
VM 사용:
- 다른 OS 실행 필요 (Linux에서 Windows)
- 강력한 격리 필요 (보안)
- 레거시 시스템

Container 사용:
- 마이크로서비스 아키텍처
- 빠른 배포/스케일링
- DevOps/CI/CD
- 리소스 효율 중요
```

### 면접관이 주목하는 포인트
- 기술적 차이 명확히 설명
- 적절한 사용 시나리오 제시

### 꼬리 질문 대비
- "컨테이너가 VM보다 보안이 약한 이유?"
  → 커널을 공유하므로 커널 취약점이 모든 컨테이너에 영향

</details>

---

## Q4. 전가상화와 반가상화의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 전가상화 (Full) | 반가상화 (Para) |
|------|----------------|-----------------|
| Guest OS 수정 | 불필요 | 필요 |
| 성능 | 상대적 낮음 | 높음 |
| 하드웨어 지원 | VT-x/AMD-V 활용 | Hypercall 사용 |
| 예시 | VMware, VirtualBox | Xen (PV 모드) |

### 동작 방식

**전가상화:**
```
Guest OS → 특권 명령 → Hypervisor가 에뮬레이션
→ Guest OS는 가상 환경임을 모름
```

**반가상화:**
```
Guest OS → Hypercall → Hypervisor 직접 호출
→ Guest OS가 가상 환경임을 알고 최적화
```

### 현대 가상화

```
하드웨어 지원 가상화 (Intel VT-x, AMD-V)로
전가상화 성능이 크게 향상

대부분의 현대 하이퍼바이저는
하드웨어 지원 전가상화 사용
```

</details>

---

## Q5. Public, Private, Hybrid Cloud의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Public Cloud | Private Cloud | Hybrid Cloud |
|------|-------------|---------------|--------------|
| 소유 | 클라우드 벤더 | 조직 자체 | 혼합 |
| 비용 | 종량제 | 초기 투자 큼 | 혼합 |
| 확장성 | 무제한 | 제한적 | 유연 |
| 보안/규정 | 벤더 정책 | 완전 제어 | 선택적 |
| 예시 | AWS, Azure, GCP | OpenStack, VMware | AWS Outposts |

### 선택 기준

```
Public:
- 빠른 시작, 유연한 확장
- 비용 최적화 (종량제)
- 스타트업, 변동 트래픽

Private:
- 규제 준수 (금융, 의료)
- 데이터 주권
- 레거시 통합

Hybrid:
- 민감 데이터는 Private
- 일반 워크로드는 Public
- 클라우드 버스팅
```

</details>

---

## Q6. Scale-up과 Scale-out의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Scale-up (수직 확장) | Scale-out (수평 확장) |
|------|---------------------|----------------------|
| 방식 | 서버 스펙 향상 | 서버 대수 추가 |
| 한계 | 하드웨어 한계 | 이론상 무제한 |
| 비용 | 고사양 = 비쌈 | 저사양 여러 대 |
| 복잡성 | 단순 | 로드밸런싱, 분산 처리 필요 |

### 예시

```
Scale-up: EC2 t2.micro → m5.xlarge
Scale-out: EC2 1대 → EC2 10대 + ALB
```

### 클라우드 활용

```
AWS Auto Scaling: Scale-out 자동화
- CPU 70% 초과 시 인스턴스 추가
- 트래픽 감소 시 인스턴스 제거
```

</details>

---

## Q7. 고가용성(High Availability)을 어떻게 달성하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### HA 구성 요소

```
1. 다중화 (Redundancy)
   - 여러 인스턴스 운영
   - 다중 AZ (Availability Zone) 배포

2. 로드 밸런싱
   - 트래픽 분산
   - 장애 인스턴스 제외

3. 헬스 체크
   - 주기적 상태 확인
   - 자동 복구

4. 데이터 복제
   - DB 복제 (Primary-Replica)
   - 다중 리전 백업
```

### AWS 3-tier HA 아키텍처

```
           Internet
               │
         ┌─────┴─────┐
         │    ALB    │  ← Load Balancer
         └─────┬─────┘
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐ ┌───┴───┐ ┌───┴───┐
│ EC2-1 │ │ EC2-2 │ │ EC2-3 │  ← 다중 인스턴스
│ (AZ-a)│ │ (AZ-b)│ │ (AZ-c)│  ← 다중 AZ
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └─────────┼─────────┘
              │
    ┌─────────┴─────────┐
    │   RDS (Multi-AZ)  │  ← DB 이중화
    └───────────────────┘
```

### 가용성 계산

```
99.9% (Three 9s) = 연간 8.76시간 다운타임
99.99% (Four 9s) = 연간 52.6분 다운타임
99.999% (Five 9s) = 연간 5.26분 다운타임
```

</details>

---

## 학습 체크리스트

- [ ] IaaS, PaaS, SaaS 차이 설명 가능
- [ ] Type 1/Type 2 Hypervisor 비교 가능
- [ ] VM vs Container 차이 설명 가능
- [ ] 전가상화/반가상화 개념 이해
- [ ] Public/Private/Hybrid Cloud 비교 가능
- [ ] Scale-up/Scale-out 차이 알기
- [ ] 고가용성 구성 방법 설명 가능
