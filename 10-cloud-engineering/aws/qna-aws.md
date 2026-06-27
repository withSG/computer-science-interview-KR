# AWS 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. VPC에서 Public Subnet과 Private Subnet의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Public Subnet | Private Subnet |
|------|--------------|----------------|
| 인터넷 접근 | Internet Gateway(IGW) 직접 연결 | NAT Gateway 통해서만 |
| 인바운드 | 외부에서 직접 접근 가능 | 외부 접근 차단 |
| 용도 | 웹 서버, Load Balancer | 앱 서버, DB |

### 아키텍처 예시

```
                 Internet
                    │
              ┌─────┴─────┐
              │    IGW    │
              └─────┬─────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───┴───┐                       ┌───┴───┐
│Public │                       │Public │
│Subnet │                       │Subnet │
│(AZ-a) │                       │(AZ-b) │
│  ALB  │                       │  ALB  │
└───┬───┘                       └───┬───┘
    │                               │
    │         ┌───────┐             │
    │         │  NAT  │             │
    │         │Gateway│             │
    │         └───┬───┘             │
    │             │                 │
┌───┴───┐     ┌───┴───┐         ┌───┴───┐
│Private│     │Private│         │Private│
│Subnet │     │Subnet │         │Subnet │
│(App)  │     │(App)  │         │ (DB)  │
└───────┘     └───────┘         └───────┘
```

### 라우팅 테이블 차이

```
Public Subnet:
0.0.0.0/0 → igw-xxx (인터넷 게이트웨이)

Private Subnet:
0.0.0.0/0 → nat-xxx (NAT 게이트웨이)
```

### 면접관이 주목하는 포인트
- 3-tier 아키텍처 설계 경험
- 보안 관점에서의 네트워크 분리

</details>

---

## Q2. Security Group과 NACL의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Security Group | NACL |
|------|---------------|------|
| 적용 대상 | 인스턴스 | 서브넷 |
| 상태 | Stateful | Stateless |
| 규칙 | 허용만 | 허용 + 거부 |
| 평가 순서 | 모든 규칙 평가 | 번호 순서 |
| 기본 | 아웃바운드 전체 허용 | 모두 허용 |

### Stateful vs Stateless

```
Security Group (Stateful):
요청 허용 → 응답 자동 허용

NACL (Stateless):
인바운드, 아웃바운드 규칙 각각 필요
```

### 사용 예시

```
Security Group:
- 웹 서버: 80, 443 허용
- DB: 3306은 앱 서버 SG에서만 허용

NACL:
- 특정 IP 대역 완전 차단
- 서브넷 레벨 방어
```

</details>

---

## Q3. S3 버킷 정책과 IAM 정책의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | IAM 정책 | 버킷 정책 |
|------|---------|----------|
| 부착 대상 | 사용자/역할 | S3 버킷 |
| 관점 | "누가 무엇을" | "이 버킷에 누가" |
| 크로스 계정 | 제한적 | 쉬움 |

### 언제 무엇을 사용?

```
IAM 정책:
- 같은 AWS 계정 내 권한 관리
- 사용자/역할 기반 접근 제어

버킷 정책:
- 다른 AWS 계정에서 접근
- 익명(Public) 접근 허용
- IP 기반 접근 제어
```

### 버킷 정책 예시

```json
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::123456789:root"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```

</details>

---

## Q4. EC2 Auto Scaling은 어떻게 동작하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 구성 요소

```
1. Launch Template: 인스턴스 설정 (AMI, 타입, 보안그룹)
2. Auto Scaling Group: 최소/최대/원하는 인스턴스 수
3. Scaling Policy: 언제 확장/축소할지
```

### 스케일링 정책

```
1. Target Tracking: CPU 70% 유지
2. Step Scaling: CPU 80% → +2대, 90% → +4대
3. Scheduled: 매일 9시 확장, 18시 축소
```

### CloudWatch 연동

```
CloudWatch Alarm (CPU > 70%)
       │
       ▼
Auto Scaling Group
       │
       ▼
EC2 인스턴스 추가
       │
       ▼
ALB에 자동 등록
```

### 면접 답변 예시

```
"트래픽 급증 대비를 위해 Auto Scaling을 구성했습니다.
평소 2대, 최대 10대로 설정하고
CPU 70% 초과 시 자동 확장되도록 했습니다.
실제로 프로모션 기간에 8대까지 확장되어
장애 없이 대응했습니다."
```

</details>

---

## Q5. Lambda의 장단점은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 장점

```
- 서버 관리 불필요
- 자동 스케일링
- 사용한 만큼만 과금
- 빠른 배포
```

### 단점

```
- Cold Start 지연 (수백 ms ~ 수 초)
- 실행 시간 제한 (15분)
- 메모리 제한 (10GB)
- Stateless (상태 저장 불가)
```

### 사용 사례

```
✅ 적합:
- API 백엔드
- 이벤트 처리 (S3 업로드, SQS)
- 스케줄 작업 (CloudWatch Events)
- 데이터 변환

❌ 부적합:
- 장시간 실행 작업
- 고성능 컴퓨팅
- Stateful 애플리케이션
```

### Cold Start 완화

```
- Provisioned Concurrency (예약 동시성)
- 경량 런타임 사용 (Python, Node.js)
- 패키지 크기 최소화
```

</details>

---

## Q6. EC2 비용 절감 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 옵션 | 할인율 | 조건 |
|------|--------|------|
| On-Demand | 0% | 언제든 사용 |
| Reserved Instance | ~75% | 1-3년 약정 |
| Savings Plans | ~72% | 시간당 사용량 약정 |
| Spot Instance | ~90% | 중단 가능 |

### Spot Instance 활용

```
"배치 처리 작업에 Spot Instance를 사용했습니다.
중단되어도 괜찮은 데이터 처리 작업에 적용해
비용을 70% 절감했습니다.
Spot Fleet으로 다양한 인스턴스 타입을 조합해
가용성도 높였습니다."
```

### 추가 절감 방법

```
- 사용하지 않는 리소스 정리
- 적절한 인스턴스 타입 선택
- Auto Scaling으로 필요시에만 확장
- S3 Lifecycle 정책으로 스토리지 최적화
```

</details>

---

## 학습 체크리스트

- [ ] VPC/Subnet/Security Group 설계 설명 가능
- [ ] Security Group vs NACL 차이 알기
- [ ] S3 버킷 정책 vs IAM 정책 비교 가능
- [ ] Auto Scaling 동작 원리 설명 가능
- [ ] Lambda 장단점과 사용 사례 알기
- [ ] EC2 비용 절감 방법 알기
