# 설정과 스토리지 (ConfigMap, Secret, Volume, PV/PVC)

> 설정을 이미지 밖으로 빼야 하는 이유, Secret이 왜 그것만으로는 보안이 아닌지, 그리고 사라지는 컨테이너에 어떻게 사라지지 않는 디스크를 붙이는지 설명할 수 있게 된다.

## 학습 목표

- [ ] 설정을 이미지에 넣으면 안 되는 이유를 배포 관점에서 설명할 수 있다
- [ ] ConfigMap과 Secret의 주입 방식(환경변수 vs 볼륨) 차이와 갱신 동작을 안다
- [ ] Secret의 base64가 암호화가 아니라는 사실과 실무 대응책을 말할 수 있다
- [ ] emptyDir / hostPath / PVC 등 볼륨 종류를 상황에 맞게 고를 수 있다
- [ ] PV, PVC, StorageClass의 관계와 동적 프로비저닝 흐름을 설명할 수 있다
- [ ] 접근 모드(RWO/ROX/RWX/RWOP)가 무엇을 제약하는지 이해한다

## 선행 지식

- [01-architecture-concepts.md](./01-architecture-concepts.md) - Pod와 kubelet의 역할
- [02-deployment-management.md](./02-deployment-management.md) - StatefulSet의 volumeClaimTemplates

---

## 1. 왜 필요한가: 설정을 이미지에 넣으면 벌어지는 일

애플리케이션에는 환경마다 달라지는 값이 있다. DB 주소, 외부 API 엔드포인트, 로그 레벨, 기능 플래그, 그리고 비밀번호와 토큰.

이걸 이미지에 박아 넣으면 두 가지가 무너진다.

**첫째, 이미지의 의미가 깨진다.** 컨테이너 이미지의 핵심 가치는 "개발에서 테스트한 그 이미지를 그대로 운영에 올린다"는 것이다. 그런데 설정이 안에 들어 있으면 환경마다 다른 이미지를 빌드해야 한다. `myapp:1.0-dev`와 `myapp:1.0-prod`가 생기는 순간, 운영에 올라간 것이 정말 테스트한 그 코드인지 보장할 수 없다.

**둘째, 비밀값이 영구적으로 새어 나간다.** 이미지 레이어는 불변이라 나중에 지운 파일도 이전 레이어에 남는다. 비밀번호가 들어간 이미지를 레지스트리에 한 번 push하면, 그 이미지를 받을 수 있는 모든 사람이 값을 볼 수 있다. Dockerfile을 고쳐 다시 빌드해도 예전 태그는 그대로 남아 있다.

그래서 쿠버네티스는 설정을 **Pod 밖의 별도 오브젝트**로 두고, Pod가 뜰 때 주입한다.

```
이미지: 코드와 런타임만 (환경 중립)
   +
ConfigMap / Secret: 환경별 값
   ↓
Pod 실행 시점에 kubelet이 주입
```

이 원칙은 쿠버네티스만의 발명은 아니다. 십이요소 앱(Twelve-Factor App)의 "설정은 환경에 저장한다"를 그대로 구현한 것이고, Docker Compose에서 `.env` 파일을 쓰던 것과 목적이 같다.

데이터도 같은 문제를 겪는다. 컨테이너의 파일시스템은 컨테이너가 사라지면 함께 사라진다. Pod는 언제든 죽고 다른 노드에서 다시 뜨는 존재라 **그 안에 남긴 데이터는 언제 사라져도 이상하지 않다.** 이 문제를 볼륨과 PV/PVC로 푼다. 문서 후반부의 주제다.

---

## 2. ConfigMap: 민감하지 않은 설정

### 만들기

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  LOG_LEVEL: "INFO"
  application.yaml: |          # 파일 통째로도 넣을 수 있다
    server:
      port: 8080
    logging:
      level:
        root: INFO
```

`data`의 값은 문자열이어야 한다. `DB_PORT: 3306`처럼 따옴표를 빼면 YAML 파서가 숫자로 읽어 오류가 난다. 자주 걸리는 함정이다.

크기 제한도 있다. ConfigMap과 Secret은 etcd에 저장되므로 오브젝트 하나가 대략 1MiB를 넘길 수 없다. 큰 데이터셋이나 모델 파일을 여기에 넣으려 하면 안 된다. 그건 볼륨이나 오브젝트 스토리지의 영역이다.

### 주입하는 세 가지 방법

```yaml
spec:
  containers:
  - name: app
    image: myapp:1.0

    # ① 키 하나를 환경변수로
    env:
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST

    # ② ConfigMap 전체를 환경변수로 (키 이름이 그대로 변수명)
    envFrom:
    - configMapRef:
        name: app-config

    # ③ 파일로 마운트 (키 = 파일명, 값 = 파일 내용)
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

### 환경변수와 볼륨의 결정적 차이

| 항목 | 환경변수 주입 | 볼륨 마운트 |
|---|---|---|
| ConfigMap 수정 시 | **Pod에 반영되지 않음** | kubelet이 주기적으로 파일을 갱신 |
| 반영 방법 | Pod 재시작(롤아웃) 필요 | 앱이 파일 변경을 감지하면 재시작 없이 반영 |
| 다루기 | 간단, 대부분의 앱이 즉시 지원 | 앱이 파일을 다시 읽는 로직을 가져야 실효 |
| 적합한 값 | 짧은 스칼라 값 | 설정 파일, 인증서 등 덩어리 |

**언제 뭘 쓰나**: 값 몇 개면 환경변수, 설정 파일이나 인증서처럼 덩어리면 볼륨. 무중단 설정 변경이 필요하면 볼륨을 쓰되 애플리케이션이 파일을 다시 읽을 수 있는지 먼저 확인한다.

주의할 예외가 있다. `subPath`로 특정 파일 하나만 마운트하면 **그 파일은 갱신되지 않는다.** 볼륨 마운트를 했는데 값이 안 바뀐다면 이걸 먼저 의심한다.

### 설정 변경을 확실히 반영하려면

값을 바꿨는데 Pod가 옛 값을 쓰고 있는 상황은 흔한 사고다. 확실한 방법은 **Pod를 새로 뜨게 만드는 것**이다.

```bash
kubectl rollout restart deployment/web    # 설정 변경 후 롤아웃 재시작
```

더 나은 방법은 ConfigMap 내용의 해시를 Pod 템플릿의 어노테이션에 넣어, 내용이 바뀌면 템플릿이 바뀌고 자동으로 롤아웃이 일어나게 하는 것이다. Helm이나 Kustomize를 쓰면 이 패턴을 지원한다.

자주 바뀌지 않는 설정은 `immutable: true`로 두는 선택지도 있다. 수정이 금지되는 대신 kubelet이 감시하지 않아도 되므로 대규모 클러스터에서 API 서버 부하가 줄어든다. 변경할 때는 새 이름의 ConfigMap을 만들어 참조를 바꾼다.

---

## 3. Secret: base64는 암호화가 아니다

### 무엇이 다른가

Secret은 ConfigMap과 사용법이 거의 같다. `data` 값을 base64로 인코딩해서 넣고, `configMapKeyRef` 대신 `secretKeyRef`를 쓴다.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:                 # 평문으로 적으면 API 서버가 인코딩해 준다
  DB_PASSWORD: "s3cr3t-value"
```

`data`에 직접 넣으려면 base64 인코딩이 필요하지만, `stringData`를 쓰면 그럴 필요가 없다.

타입도 몇 가지 있다. 용도에 맞는 타입을 쓰면 쿠버네티스가 필요한 키가 있는지 검증해 준다.

| 타입 | 용도 |
|---|---|
| `Opaque` | 임의의 키-값. 기본값 |
| `kubernetes.io/dockerconfigjson` | 프라이빗 레지스트리 인증(`imagePullSecrets`) |
| `kubernetes.io/tls` | TLS 인증서와 개인키(`tls.crt`, `tls.key`) |
| `kubernetes.io/basic-auth` | 사용자명/비밀번호 쌍 |

### 핵심 오해를 정면으로

**base64는 암호화가 아니라 인코딩이다.** 키도 없고 비밀도 없다. 누구나 되돌린다.

```bash
echo "czNjcjN0LXZhbHVl" | base64 -d
# s3cr3t-value
```

그럼 왜 base64를 쓸까? 보안 때문이 아니라 **바이너리 안전성** 때문이다. 인증서나 키 파일에는 YAML/JSON에 그대로 넣을 수 없는 바이트가 들어간다. base64는 그걸 텍스트로 안전하게 나르기 위한 포맷 변환일 뿐이다.

그래서 Secret이 실제로 제공하는 것은 이 정도다.

- ConfigMap과 **분리된 리소스 종류**이므로 RBAC으로 접근 권한을 따로 통제할 수 있다
- `kubectl get -o yaml` 같은 조회에서 값이 그대로 보이지 않도록 최소한의 가림막이 된다
- 볼륨으로 마운트하면 디스크가 아니라 메모리 기반 파일시스템에 올라간다
- etcd 저장 시 암호화를 켜면 저장 계층에서 보호된다

### 실무 대응 다섯 가지

**① etcd 저장 시 암호화(Encryption at Rest).** API 서버에 `EncryptionConfiguration`을 설정하면 Secret이 etcd에 암호화되어 저장된다. 키 관리를 직접 하는 대신 클라우드 KMS를 제공자로 지정하면 키 회전과 감사까지 KMS가 맡는다. 관리형 클러스터에서는 클러스터 생성 시 옵션으로 켜는 경우가 많다.

**② RBAC 최소 권한.** 이게 실질적으로 가장 중요하다. Secret을 읽을 수 있는 ServiceAccount와 사용자를 최소한으로 제한한다. 네임스페이스 전체에 `get secrets` 권한을 주면 암호화를 켜 놓아도 의미가 없다.

**③ Git에 커밋하지 않는다.** Secret YAML을 저장소에 올리면 base64 디코딩 한 번으로 노출된다. GitOps를 쓴다면 Sealed Secrets(공개키로 암호화해 커밋하고 클러스터에서만 복호화)나 SOPS로 암호화한 형태만 커밋한다.

**④ 외부 시크릿 매니저로 옮긴다.** AWS Secrets Manager, HashiCorp Vault 같은 전용 저장소에 값을 두고, External Secrets Operator나 Secrets Store CSI Driver로 클러스터에 끌어온다. 값의 수명 주기와 감사 로그를 전문 도구에 맡길 수 있다.

**⑤ 애초에 비밀값을 만들지 않는다.** 가장 좋은 비밀은 존재하지 않는 비밀이다. 클라우드 리소스 접근이라면 장기 액세스 키를 Secret에 넣는 대신, ServiceAccount에 클라우드 IAM 역할을 연결하는 워크로드 아이덴티티(EKS의 IRSA, GKE의 Workload Identity)를 쓴다. 자격 증명이 단기 토큰으로 자동 발급·회전되므로 유출할 값 자체가 없어진다.

```bash
# 값 확인 (운영에서는 신중히)
kubectl get secret app-secret -o jsonpath='{.data.DB_PASSWORD}' | base64 -d

# 누가 Secret을 읽을 수 있는지 점검
kubectl auth can-i get secrets --as=system:serviceaccount:default:my-sa
```

---

## 4. 볼륨: 컨테이너 밖에 데이터를 두는 방법

컨테이너의 쓰기 가능 레이어는 컨테이너와 운명을 같이한다. 재시작만 해도 초기화된다. 볼륨은 이 밖에 저장 공간을 붙여 준다.

```
┌───────────────────── Pod ──────────────────────┐
│                                                │
│  ┌──────────────┐         ┌──────────────┐     │
│  │ 컨테이너 A   │         │ 컨테이너 B   │     │
│  │              │         │              │     │
│  │ /app         │         │ /app         │     │
│  │  (이미지     │         │  (이미지     │     │
│  │   레이어,    │         │   레이어,    │     │
│  │   재시작 시  │         │   각자 별도) │     │
│  │   초기화)    │         │              │     │
│  │              │         │              │     │
│  │ /data ───────┼─────┬───┼────── /data  │     │
│  └──────────────┘     │   └──────────────┘     │
│                  ┌────▼─────┐                  │
│                  │  볼륨    │  Pod 수명 또는   │
│                  │          │  그 이상 유지    │
│                  └──────────┘                  │
└────────────────────────────────────────────────┘
```

| 볼륨 종류 | 수명 | 용도 | 주의 |
|---|---|---|---|
| `emptyDir` | Pod와 함께 사라짐 | 컨테이너 간 파일 공유, 캐시, 임시 작업 공간 | Pod가 옮겨지면 사라진다 |
| `emptyDir` (medium: Memory) | Pod와 함께 사라짐 | 빠른 임시 저장, 디스크에 남기면 안 되는 값 | 노드 메모리를 소비한다 |
| `configMap` / `secret` | Pod와 함께 | 설정 파일, 인증서 주입 | 읽기 전용으로 다룬다 |
| `downwardAPI` | Pod와 함께 | Pod 이름·네임스페이스·라벨을 파일로 노출 | 앱이 자기 정체를 알아야 할 때 |
| `hostPath` | 노드의 디스크 | 노드 로그·소켓 접근이 꼭 필요한 에이전트 | **일반 앱에 쓰면 안 된다** |
| `persistentVolumeClaim` | Pod보다 오래 삶 | DB 데이터, 업로드 파일 등 영속 데이터 | 접근 모드 제약을 확인 |

`hostPath`를 왜 피해야 하는지는 분명히 알아 둘 만하다. 노드의 파일시스템을 그대로 컨테이너에 붙이는 것이라, Pod가 다른 노드로 옮겨 가면 데이터가 없고, 잘못 쓰면 노드의 중요한 경로에 컨테이너가 접근하게 되어 격리가 무너진다. DaemonSet으로 도는 로그 수집기가 `/var/log`를 읽는 것처럼 노드 자체를 다뤄야 하는 경우로 용도를 한정한다.

---

## 5. PV, PVC, StorageClass

### 세 오브젝트가 나뉜 이유

영속 스토리지를 다루려면 두 가지 관심사가 섞인다.

- **"20GB짜리 빠른 디스크가 필요하다"** — 애플리케이션 개발자의 요구
- **"이 클러스터에서는 클라우드 블록 스토리지를 이런 파라미터로 만든다"** — 인프라 담당자의 구현

이 둘을 한 곳에 적으면 개발자가 스토리지 백엔드를 알아야 하고, 클라우드를 옮길 때 모든 매니페스트를 고쳐야 한다. 쿠버네티스는 이를 요청과 실체로 분리했다.

```
개발자가 작성                     클러스터가 처리
┌─────────────────┐
│      PVC        │  "20Gi, ReadWriteOnce, gp3 클래스로 주세요"
│  (요청서)       │
└────────┬────────┘
         │ 매칭 / 생성 요청
         ▼
┌─────────────────┐
│  StorageClass   │  "gp3 요청이 오면 이 프로비저너로 이런 파라미터로 만들어라"
│  (생성 정책)    │
└────────┬────────┘
         │ 동적 프로비저닝
         ▼
┌─────────────────┐
│       PV        │  실제로 만들어진 볼륨 (클라우드 디스크 등)
│  (실체)         │
└────────┬────────┘
         │ 바인딩
         ▼
┌─────────────────┐
│      Pod        │  volumes.persistentVolumeClaim 으로 마운트
└─────────────────┘
```

**PVC(PersistentVolumeClaim)** 는 요청서다. 크기, 접근 모드, StorageClass를 적는다.
**PV(PersistentVolume)** 는 실제 볼륨이다. 클러스터 범위 리소스이며 네임스페이스에 속하지 않는다.
**StorageClass** 는 "이 요청이 오면 어떻게 만들지"를 정의한 템플릿이다.

### 동적 프로비저닝

StorageClass가 있으면 PV를 미리 만들어 둘 필요가 없다. PVC를 만드는 순간 프로비저너가 실제 디스크를 만들고 PV를 생성해 바인딩한다.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-claim
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 20Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: data
      mountPath: /var/lib/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-claim
```

StorageClass에서 눈여겨볼 필드가 셋 있다.

**`reclaimPolicy`** — PVC를 지웠을 때 실제 볼륨을 어떻게 할지. `Delete`면 함께 삭제되고 `Retain`이면 남는다. 동적 프로비저닝의 기본값은 대개 `Delete`다. **운영 DB용 StorageClass는 `Retain`으로 두는 것이 안전하다.** PVC를 실수로 지웠을 때 데이터가 즉시 사라지는 것을 막아 준다.

**`volumeBindingMode`** — `Immediate`는 PVC를 만들자마자 볼륨을 만든다. 문제는 클라우드 블록 스토리지가 특정 가용 영역에 묶인다는 점이다. a존에 디스크를 만들었는데 Pod가 c존 노드에 스케줄되면 붙일 수 없어 Pod가 영영 Pending에 걸린다. `WaitForFirstConsumer`로 두면 Pod가 스케줄될 때까지 기다렸다가 그 노드의 존에 볼륨을 만든다. 멀티 AZ 클러스터에서는 사실상 필수다.

**`allowVolumeExpansion`** — `true`여야 나중에 PVC의 크기 요청을 늘려 확장할 수 있다. 대부분의 스토리지는 축소를 지원하지 않으므로 처음부터 크게 잡기보다 확장 가능하게 두는 편이 낫다.

### 접근 모드

| 모드 | 약어 | 의미 | 대표 백엔드 |
|---|---|---|---|
| ReadWriteOnce | RWO | **하나의 노드**에서 읽기/쓰기 | 클라우드 블록 스토리지(EBS 등) |
| ReadOnlyMany | ROX | 여러 노드에서 읽기 전용 | 공유 파일 스토리지 |
| ReadWriteMany | RWX | 여러 노드에서 읽기/쓰기 | 네트워크 파일 시스템(EFS, NFS 등) |
| ReadWriteOncePod | RWOP | **하나의 Pod**만 읽기/쓰기 | 단독 접근을 강제해야 할 때 |

가장 많이 걸리는 오해가 RWO다. **"하나의 Pod"가 아니라 "하나의 노드"** 를 뜻한다. 같은 노드에 있는 여러 Pod는 같은 RWO 볼륨을 붙일 수 있다. 진짜 단독 접근이 필요하면 RWOP를 쓴다.

실무에서 이 제약이 드러나는 순간은 이렇다. 웹 서버 3개가 사용자 업로드 파일을 공유해야 하는데 블록 스토리지는 RWO뿐이라, Pod들이 서로 다른 노드에 흩어지면 마운트가 실패한다. 이때 선택지는 셋이다. 파일 스토리지(RWX)로 바꾸거나, 오브젝트 스토리지(S3 등)를 쓰도록 애플리케이션을 고치거나, 모든 Pod를 한 노드에 묶는 것. 클라우드 환경에서는 두 번째가 가장 건강한 설계다.

```bash
kubectl get sc                       # StorageClass 목록, (default) 표시 확인
kubectl get pvc
kubectl get pv
kubectl describe pvc data-claim      # Pending이면 Events에 이유가 나온다
```

PVC가 `Pending`이라면 흔한 원인은 이렇다. 요청한 StorageClass가 없거나 기본 StorageClass가 지정되지 않음, 접근 모드를 백엔드가 지원하지 않음, 정적 PV를 쓰는데 조건에 맞는 PV가 없음, 또는 `WaitForFirstConsumer`라서 Pod가 스케줄되기를 기다리는 정상 상태.

### CSI

예전에는 스토리지 드라이버가 쿠버네티스 본체 코드에 들어 있었다. 지금은 **CSI(Container Storage Interface)** 라는 표준 인터페이스로 분리되어, 각 스토리지 벤더가 독립적으로 드라이버를 배포한다. 쿠버네티스 버전과 무관하게 드라이버를 갱신할 수 있고, 스냅샷·복제·확장 같은 기능도 표준 방식으로 제공된다. 실무에서 "EBS CSI 드라이버가 설치되어 있지 않아 PVC가 안 붙는다"는 상황을 자주 만나므로, 클러스터에 어떤 CSI 드라이버가 있는지 확인하는 습관이 필요하다.

---

## 6. 실무에서는

**설정은 계층으로 관리한다.** 공통 값과 환경별 값을 나누고, Kustomize의 오버레이나 Helm의 values로 조합하는 것이 일반적이다. 매니페스트를 환경별로 복사해 두면 반드시 어긋난다.

**Secret은 클러스터 밖에 두는 방향으로 간다.** 규모가 커질수록 "누가 언제 이 값을 읽었나"에 답해야 하는 순간이 오고, 그건 Secret 오브젝트만으로는 불가능하다. External Secrets Operator로 외부 저장소를 진실의 원천으로 삼고 클러스터에는 동기화된 사본만 두는 구성이 흔하다.

**상태가 있는 것은 되도록 클러스터 밖에 둔다.** PV/PVC로 클러스터 안에서 DB를 운영할 수는 있지만, 백업·복구·버전 업그레이드·페일오버까지 직접 책임져야 한다. 관리형 DB나 오브젝트 스토리지를 쓸 수 있다면 그쪽이 대체로 총 비용이 낮다. 이 판단은 IaaS와 PaaS의 트레이드오프와 같은 구조다.

**볼륨 사용량도 모니터링 대상이다.** PVC가 가득 차면 애플리케이션은 쓰기 실패로 죽는다. 노드 디스크가 가득 차면 kubelet이 `DiskPressure` 상태가 되어 Pod를 축출하기 시작한다. 관련 진단은 [05-troubleshooting.md](./05-troubleshooting.md)에서 다룬다.

---

## 7. 면접 포인트

> 면접에서 이 주제가 나오면 이렇게 답한다

**Q. Secret은 안전한가요?**

A. Secret 자체는 암호화가 아닙니다. 값이 base64로 인코딩되어 있을 뿐이고 base64는 키 없이 누구나 되돌릴 수 있습니다. base64를 쓰는 이유도 보안이 아니라 인증서 같은 바이너리를 YAML에 안전하게 담기 위해서입니다. Secret이 실제로 주는 것은 ConfigMap과 분리된 리소스 종류라서 RBAC으로 접근을 따로 통제할 수 있다는 점입니다. 실무에서는 여기에 더해 etcd 저장 시 암호화를 켜고, Secret 읽기 권한을 최소화하고, Git에는 Sealed Secrets나 SOPS로 암호화한 형태만 커밋하고, 가능하면 외부 시크릿 매니저나 워크로드 아이덴티티로 옮깁니다.

- 꼬리 질문: "가장 근본적인 대응은 무엇인가요?" → 장기 자격 증명을 만들지 않는 것. ServiceAccount에 클라우드 IAM 역할을 붙이면 단기 토큰이 자동 발급·회전되어 저장할 비밀 자체가 없어진다.

**Q. ConfigMap을 수정했는데 앱에 반영되지 않습니다.**

A. 주입 방식에 따라 다릅니다. 환경변수로 주입한 값은 컨테이너 시작 시 한 번 설정되므로 ConfigMap을 고쳐도 절대 반영되지 않습니다. Pod를 재시작해야 하고, `kubectl rollout restart`가 일반적인 방법입니다. 볼륨으로 마운트한 경우는 kubelet이 파일을 주기적으로 갱신하지만, 애플리케이션이 파일 변경을 감지해 다시 읽어야 실제로 반영됩니다. 그리고 subPath로 파일 하나만 마운트하면 갱신 자체가 되지 않으니 이 경우도 확인해야 합니다.

- 꼬리 질문: "설정이 바뀌면 자동으로 재배포되게 하려면?" → ConfigMap 내용의 해시를 Pod 템플릿 어노테이션에 넣어 템플릿 변경을 유발한다. Helm이나 Kustomize로 자동화한다.

**Q. PV와 PVC는 왜 분리되어 있나요?**

A. 요청과 실체를 분리하기 위해서입니다. PVC는 "20GB, ReadWriteOnce가 필요하다"는 애플리케이션 관점의 요청이고, PV는 실제로 존재하는 볼륨입니다. 그 사이를 StorageClass가 이어 주면서 "이 요청이 오면 어떤 프로비저너로 어떤 파라미터로 만들지"를 정합니다. 덕분에 개발자는 스토리지 백엔드를 몰라도 되고, 인프라 담당자는 매니페스트를 건드리지 않고 백엔드를 바꿀 수 있습니다.

- 꼬리 질문: "PVC가 Pending이면 무엇을 보나요?" → `kubectl describe pvc`의 Events. StorageClass 부재, 지원하지 않는 접근 모드, 조건에 맞는 PV 없음, 또는 WaitForFirstConsumer로 Pod를 기다리는 정상 상태.

**Q. ReadWriteOnce는 Pod 하나만 붙을 수 있다는 뜻인가요?**

A. 아닙니다. 하나의 **노드**에서만 읽기/쓰기가 가능하다는 뜻입니다. 같은 노드에 스케줄된 여러 Pod는 같은 RWO 볼륨을 함께 마운트할 수 있습니다. 진짜로 Pod 하나만 붙게 강제하려면 ReadWriteOncePod를 씁니다. 실무에서는 이 차이 때문에 웹 서버 복제본이 파일을 공유하려다 실패하는 일이 자주 생기는데, 이때는 ReadWriteMany를 지원하는 파일 스토리지로 바꾸거나 오브젝트 스토리지를 쓰도록 애플리케이션을 고치는 것이 낫습니다.

---

## 자주 하는 실수

| 실수 | 왜 틀렸나 | 올바른 이해 |
|---|---|---|
| Secret을 쓰면 값이 암호화된다고 생각 | base64는 키 없는 인코딩 | RBAC + etcd 암호화 + 외부 시크릿 매니저가 실제 대응 |
| Secret YAML을 Git에 커밋 | 디코딩 한 번이면 평문 노출 | Sealed Secrets, SOPS, 외부 저장소 사용 |
| ConfigMap 수정 후 반영을 기대(환경변수 주입) | 환경변수는 컨테이너 시작 시 고정 | 롤아웃 재시작 또는 볼륨 마운트 |
| `subPath` 마운트 후 자동 갱신을 기대 | subPath는 갱신 대상에서 제외됨 | 디렉터리 단위로 마운트 |
| ConfigMap에 큰 파일 저장 | etcd 오브젝트 크기 한계에 걸림 | 볼륨이나 오브젝트 스토리지 사용 |
| 일반 앱에 `hostPath` 사용 | 노드 이동 시 데이터 없음, 격리 훼손 | 영속 데이터는 PVC, hostPath는 노드 에이전트 한정 |
| 운영 DB StorageClass를 `Delete`로 방치 | PVC 삭제 시 실제 디스크까지 즉시 소멸 | 중요 데이터는 `Retain` |
| 멀티 AZ에서 `Immediate` 바인딩 사용 | 볼륨 존과 Pod 노드 존이 어긋나 Pending | `WaitForFirstConsumer` |
| `DB_PORT: 3306` 처럼 따옴표 생략 | ConfigMap `data` 값은 문자열이어야 함 | `"3306"`으로 감싼다 |

---

## 한 줄 정리

설정과 데이터는 이미지·컨테이너와 수명이 다르므로 ConfigMap/Secret과 볼륨으로 밖에 빼내야 하며, Secret은 base64 인코딩일 뿐이라 RBAC·etcd 암호화·외부 시크릿 매니저가 따로 필요하고, 영속 데이터는 PVC로 요청하고 StorageClass가 실체를 만들어 주는 구조로 다룬다.

---

## 연관 개념

- [01-architecture-concepts.md](./01-architecture-concepts.md) - kubelet이 설정을 주입하고 볼륨을 마운트하는 과정
- [02-deployment-management.md](./02-deployment-management.md) - StatefulSet의 volumeClaimTemplates와 PVC
- [03-networking-service.md](./03-networking-service.md) - TLS 인증서를 담는 `kubernetes.io/tls` Secret
- [05-troubleshooting.md](./05-troubleshooting.md) - PVC Pending, DiskPressure, 설정 누락으로 인한 기동 실패
- [qna-kubernetes.md](./qna-kubernetes.md) - ConfigMap/Secret 면접 질문
- [qna-docker.md](../containerization/docker/qna-docker.md) - 컨테이너 볼륨과 이미지 레이어 기초
- [qna-cicd.md](../devops-cicd/qna-cicd.md) - 파이프라인에서의 시크릿 관리
