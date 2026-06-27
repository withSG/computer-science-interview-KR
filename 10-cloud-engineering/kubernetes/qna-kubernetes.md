# Kubernetes 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Pod란 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Pod는 **Kubernetes의 최소 배포 단위**로, 하나 이상의 컨테이너를 포함합니다.

### 특징

```
- 같은 Pod 내 컨테이너는 네트워크/스토리지 공유
- localhost로 서로 통신 가능
- 하나의 IP 주소 공유
- 함께 스케줄링됨
```

### Pod 구조

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    image: myapp:1.0
    ports:
    - containerPort: 8080
  - name: sidecar
    image: log-collector:1.0
```

### Sidecar 패턴

```
┌────────────────────────────────┐
│            Pod                  │
│  ┌─────────┐    ┌─────────┐    │
│  │   App   │────│ Sidecar │    │
│  │Container│    │Container│    │
│  └─────────┘    └─────────┘    │
│         공유 네트워크/볼륨       │
└────────────────────────────────┘

예: 앱 컨테이너 + 로그 수집 컨테이너
```

</details>

---

## Q2. Service 타입의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 타입 | 설명 | 접근 범위 |
|------|------|----------|
| ClusterIP | 클러스터 내부 IP | 내부만 |
| NodePort | 노드 포트로 외부 노출 | 외부 |
| LoadBalancer | 클라우드 LB 생성 | 외부 |

### 각 타입 상세

**ClusterIP (기본)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP  # 기본값
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```
- 클러스터 내부에서만 접근
- 다른 Pod에서 `my-service:80`으로 접근

**NodePort**
```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # 30000-32767
```
- 모든 노드의 30080 포트로 접근
- 테스트/개발용

**LoadBalancer**
```yaml
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
```
- 클라우드 LB 자동 생성 (AWS ELB 등)
- 프로덕션 외부 노출

### 면접관이 주목하는 포인트
- 실무에서 어떤 타입을 사용했는지
- Ingress와의 조합

</details>

---

## Q3. Deployment와 StatefulSet의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Deployment | StatefulSet |
|------|------------|-------------|
| Pod 이름 | 랜덤 (app-xyz123) | 순서 (app-0, app-1) |
| 스케일링 | 동시 생성/삭제 | 순차 생성/삭제 |
| 스토리지 | 공유 가능 | 각 Pod 전용 PVC |
| 네트워크 | 임의 IP | 고정 DNS |

### 사용 사례

```
Deployment:
- Stateless 애플리케이션
- 웹 서버, API 서버
- 언제든 교체 가능한 Pod

StatefulSet:
- Stateful 애플리케이션
- 데이터베이스 (MySQL, MongoDB)
- 메시지 큐 (Kafka, RabbitMQ)
- Pod 순서와 고유성 중요
```

### StatefulSet 특징

```
Pod 이름: mysql-0, mysql-1, mysql-2
DNS: mysql-0.mysql-headless.default.svc.cluster.local

스케일 업: mysql-0 → mysql-1 → mysql-2 순차
스케일 다운: mysql-2 → mysql-1 → mysql-0 역순
```

</details>

---

## Q4. ConfigMap과 Secret의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | ConfigMap | Secret |
|------|-----------|--------|
| 용도 | 일반 설정 | 민감 정보 |
| 저장 | 평문 | Base64 인코딩 |
| 예시 | DB 호스트, 포트 | 비밀번호, API 키 |

### ConfigMap 예시

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: "mysql"
  DB_PORT: "3306"
```

### Secret 예시

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=  # base64
```

### Pod에서 사용

```yaml
spec:
  containers:
  - name: app
    env:
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: DB_PASSWORD
```

</details>

---

## Q5. Pod가 CrashLoopBackOff 상태일 때 어떻게 해결하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 진단 순서

```bash
# 1. Pod 상태 확인
kubectl get pods
kubectl describe pod <pod-name>

# 2. 로그 확인
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # 이전 컨테이너 로그

# 3. 이벤트 확인
kubectl get events --sort-by=.lastTimestamp
```

### 주요 원인과 해결

| 원인 | 증상 | 해결 |
|------|------|------|
| 애플리케이션 에러 | 로그에 에러 | 코드 수정 |
| 이미지 없음 | ImagePullBackOff | 이미지 이름/태그 확인 |
| 리소스 부족 | OOMKilled | 메모리 limit 증가 |
| 환경변수 누락 | 앱 시작 실패 | ConfigMap/Secret 확인 |
| Liveness Probe 실패 | 반복 재시작 | Probe 설정 조정 |

### 실전 경험 예시

```
"Pod가 CrashLoopBackOff 상태였습니다.
kubectl logs로 확인하니 DB 연결 실패였습니다.
ConfigMap의 DB_HOST가 잘못 설정되어 있어 수정 후 해결했습니다.
이후 환경변수 검증 스크립트를 추가했습니다."
```

</details>

---

## Q6. Ingress란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Ingress는 **클러스터 외부에서 내부 Service로의 HTTP/HTTPS 라우팅**을 관리합니다.

### Ingress vs LoadBalancer Service

```
LoadBalancer: 서비스당 LB 하나 (비용 증가)
Ingress: 하나의 LB로 여러 서비스 라우팅
```

### Ingress 예시

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
```

### 구조

```
                 Internet
                    │
              ┌─────┴─────┐
              │  Ingress  │
              │Controller │
              └─────┬─────┘
         ┌──────────┼──────────┐
         │          │          │
    /users      /orders    /products
         │          │          │
    ┌────┴────┐ ┌───┴───┐ ┌───┴────┐
    │  User   │ │ Order │ │Product │
    │ Service │ │Service│ │Service │
    └─────────┘ └───────┘ └────────┘
```

</details>

---

## 학습 체크리스트

- [ ] Pod 개념과 Sidecar 패턴 알기
- [ ] Service 타입 3가지 비교 가능
- [ ] Deployment vs StatefulSet 차이 설명 가능
- [ ] ConfigMap/Secret 사용법 알기
- [ ] CrashLoopBackOff 트러블슈팅 경험
- [ ] Ingress 개념과 구성 방법 알기
