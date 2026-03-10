# 프론트엔드 아키텍처 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 모놀리식 vs 마이크로서비스 vs BFF 아키텍처의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
**모놀리식**은 모든 기능이 하나의 서비스에 통합된 단순한 구조로, 초기 개발에 빠르지만 규모가 커질수록 확장이 어렵습니다. **마이크로서비스(MSA)**는 도메인별로 서비스를 분리하여 독립 배포가 가능하지만 복잡도가 높습니다. **BFF(Backend For Frontend)**는 프론트엔드를 위한 전용 백엔드 레이어로, 여러 마이크로서비스의 인증과 데이터를 통합하는 역할을 합니다.

### 아키텍처 비교

| 구분 | 모놀리식 | MSA | BFF |
|------|---------|-----|-----|
| 구조 | 단일 서비스 | 독립 서비스 분리 | 클라이언트별 전용 백엔드 |
| 복잡도 | 낮음 | 높음 | 중간 |
| 독립 배포 | 불가 | 가능 | 가능 |
| 확장성 | 어려움 | 쉬움 | 중간 |
| 주요 장점 | 단순, 빠른 개발 | 독립성, 유연성 | 인증 통합, 데이터 집계 |
| 주요 단점 | 확장 어려움 | 운영 복잡도 | SPOF 위험 |

### 면접관이 주목하는 포인트
- 각 아키텍처의 트레이드오프를 이해하는지
- 프로젝트 규모와 상황에 따른 선택 기준을 설명할 수 있는지

### 꼬리 질문 대비
- "모놀리식에서 MSA로 전환하는 기준은?"
  → 팀 규모 확대, 독립 배포 필요성, 도메인 경계가 명확해졌을 때

</details>

---

## Q2. BFF(Backend For Frontend) 패턴이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
BFF는 **프론트엔드를 위한 전용 백엔드 레이어**입니다. 여러 마이크로서비스와 프론트엔드가 직접 통신하면 인증/권한 처리가 분산되고 API 호출이 복잡해지는 문제를 해결합니다. BFF가 인증/권한 처리를 한 곳으로 통합하고, 여러 서비스의 데이터를 집계(aggregation)하여 프론트엔드에 최적화된 형태로 제공합니다.

### BFF 도입 효과

| 구분 | BFF 없음 | BFF 있음 |
|------|---------|---------|
| 인증 처리 | 각 서비스에서 개별 처리 | BFF에서 통합 처리 |
| 데이터 집계 | 프론트에서 여러 API 호출 | BFF에서 집계 후 단일 응답 |
| API 결합도 | 프론트가 내부 구조에 의존 | 프론트는 BFF만 바라봄 |

```
[프론트엔드]
     ↓
  [BFF 레이어]  ← 인증, 집계, 변환
    ↙  ↓  ↘
[서비스A] [서비스B] [서비스C]
```

### BFF 장단점

| 장점 | 단점 |
|------|------|
| 인증/권한 단일화 | SPOF(단일 장애점) 위험 |
| 프론트엔드 최적화된 API | 추가 배포/관리 부담 |
| 마이크로서비스 내부 구조 은닉 | BFF 자체의 복잡도 |

### 면접관이 주목하는 포인트
- BFF가 해결하는 문제(분산 인증, 복잡한 API 호출)를 이해하는지
- SPOF 위험과 해결 방법을 아는지

### 꼬리 질문 대비
- "BFF에서 SPOF 문제를 어떻게 해결하나요?"
  → health check와 graceful shutdown 적용, 로드 밸런서를 통한 다중 인스턴스 운영

</details>

---

## Q3. 프론트엔드 상태를 어떻게 분류하고 관리하나요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
프론트엔드 상태는 **서버 상태, 전역 클라이언트 상태, 로컬 상태** 3가지로 분류하고 각각 다른 도구로 관리하는 것이 효과적입니다. 서버 상태는 React Query로 캐싱과 동기화를 선언적으로 처리하고, 전역 클라이언트 상태(인증, 테마 등)는 Zustand/Redux로 관리하며, UI 관련 로컬 상태는 useState로 충분합니다.

### 상태 분류 및 관리 도구

| 상태 종류 | 예시 | 권장 도구 | 특징 |
|-----------|------|-----------|------|
| 서버 상태 | 목록 데이터, 사용자 정보 | React Query / TanStack Query | 캐싱, 리페칭, 로딩/에러 처리 |
| 전역 클라이언트 상태 | 인증 정보, 테마, 언어 | Zustand / Redux Toolkit | 앱 전체 공유 |
| 로컬 상태 | 모달 열림/닫힘, 입력값 | useState | 컴포넌트 단위 |

```ts
// 서버 상태: React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5분 캐싱
});

// 전역 클라이언트 상태: Zustand
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// 로컬 상태: useState
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 면접관이 주목하는 포인트
- 서버 상태와 클라이언트 상태의 차이를 이해하는지
- 상태 관리 도구를 목적에 따라 선택하는 기준을 아는지

### 꼬리 질문 대비
- "Redux와 Zustand 중 어떤 것을 선택하나요?"
  → 새 프로젝트에서는 보일러플레이트가 적은 Zustand 선호. 기존 Redux 코드베이스가 있으면 점진적 마이그레이션

</details>

---

## Q4. 프론트엔드 폴더 구조는 어떻게 설계하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
폴더 구조는 **feature 기반 구조**를 최상위로, 각 feature 내부는 **layer 기반**으로 구성하는 혼합형 구조를 권장합니다. 최상위를 `/features/auth`, `/features/dashboard` 등 도메인별로 나누고, 내부는 `components/`, `hooks/`, `api/`, `types/`로 구성합니다. 여러 feature에서 공통으로 쓰이는 것들은 `/shared`에 둡니다.

### 권장 폴더 구조

```
src/
├── features/                   # 도메인(기능)별 모듈
│   ├── auth/
│   │   ├── components/         # auth 관련 컴포넌트
│   │   ├── hooks/              # auth 관련 커스텀 훅
│   │   ├── api/                # auth API 호출 함수
│   │   ├── store/              # Zustand/Redux slice
│   │   └── types/              # auth 관련 타입
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   └── ...
├── shared/                     # 공통 모듈
│   ├── components/             # 공통 UI (Button, Modal 등)
│   ├── hooks/                  # 공통 커스텀 훅
│   ├── utils/                  # 유틸 함수
│   └── types/                  # 공통 타입
├── app/                        # 라우팅, 프로바이더 설정
└── styles/                     # 글로벌 스타일, 테마
```

### 면접관이 주목하는 포인트
- feature 기반 구조의 이점과 단점을 설명할 수 있는지
- `/shared`에 무엇을 두어야 할지 판단 기준을 아는지

### 꼬리 질문 대비
- "feature 기반 구조의 단점은?"
  → feature 간 공유 코드가 애매할 때 /shared로 언제 추출할지 판단이 필요. 너무 이르게 추출하면 premature abstraction

</details>

---

## Q5. 공통 컴포넌트 래핑 전략이란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
MUI, Ant Design 같은 외부 UI 라이브러리 컴포넌트를 직접 사용하지 않고, **프로젝트의 디자인 시스템에 맞게 래핑(wrapping)하여 사용하는 전략**입니다. 이렇게 하면 디자인 변경이나 라이브러리 교체 시 래핑 레이어만 수정하면 되고, 사용하는 쪽은 영향을 받지 않습니다. 디자인 시스템의 일관성을 유지하기 위해 필요합니다.

### 래핑 전략 장단점

| 장점 | 단점 |
|------|------|
| 라이브러리 교체 용이 | props 전달이 번거로울 수 있음 |
| 디자인 시스템 일관성 | 래핑 레이어 관리 부담 |
| 내부 구현 은닉 | 일부 기능이 제한될 수 있음 |
| 커스터마이징 용이 | - |

```tsx
// shared/components/Button.tsx
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// 필요한 props만 선택적으로 노출
interface ButtonProps extends Pick<MuiButtonProps, 'onClick' | 'disabled' | 'children'> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 600,
}));

export const Button = ({ variant = 'primary', ...props }: ButtonProps) => {
  const muiVariant = variant === 'danger' ? 'contained' : 'outlined';
  return <StyledButton variant={muiVariant} {...props} />;
};
```

### 면접관이 주목하는 포인트
- 래핑이 왜 필요한지 라이브러리 종속성 관점에서 설명할 수 있는지
- props 설계에서 어떤 것을 노출할지 판단 기준을 아는지

### 꼬리 질문 대비
- "MUI props를 전부 열어두는 것이 좋은가요?"
  → 전부 열면 MUI에 강하게 결합됨. 필요한 props만 명시적으로 노출하면 인터페이스가 안정적이지만 기능 제한 가능. 트레이드오프 고려 필요

</details>

---

## Q6. 비즈니스 로직은 어디에 배치해야 하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
비즈니스 로직의 위치는 **재사용 여부**에 따라 결정합니다. 한 컴포넌트에서만 쓰이는 로직은 컴포넌트 내부에, 여러 컴포넌트에서 공유되는 로직은 커스텀 훅으로 분리합니다. UI와 무관한 순수 비즈니스 로직은 유틸 함수나 서비스 레이어로 분리합니다. **"두 번째 사용처가 생길 때 추상화한다"**는 원칙을 따릅니다.

### 비즈니스 로직 배치 기준

| 로직 유형 | 배치 위치 | 이유 |
|-----------|-----------|------|
| 한 컴포넌트 전용 로직 | 컴포넌트 내부 | 불필요한 추상화 방지 |
| 여러 컴포넌트 공유 로직 | 커스텀 훅 | 재사용성, React 기능 활용 |
| UI 무관 순수 로직 | 유틸 함수 / 서비스 | 테스트 용이, 프레임워크 독립 |

```ts
// 컴포넌트 내부 (한 곳에서만 사용)
function ProductForm() {
  const [price, setPrice] = useState(0);
  const discountedPrice = price * 0.9; // 이 컴포넌트에서만 사용
  // ...
}

// 커스텀 훅 (여러 컴포넌트에서 공유)
function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const addItem = (item: CartItem) => setItems((prev) => [...prev, item]);
  return { items, totalPrice, addItem };
}

// 유틸 함수 (UI 무관 순수 로직)
function calculateDiscount(price: number, rate: number): number {
  return price * (1 - rate);
}
```

### 면접관이 주목하는 포인트
- "두 번째 사용처" 원칙을 이해하고 과도한 추상화를 피하는 판단력
- 커스텀 훅과 유틸 함수의 차이를 설명할 수 있는지

### 꼬리 질문 대비
- "커스텀 훅과 유틸 함수의 차이는?"
  → 커스텀 훅은 React Hook(useState, useEffect 등)을 사용하는 함수. 유틸 함수는 React에 의존하지 않는 순수 함수. 테스트 측면에서 유틸 함수가 더 단순

</details>

---

## Q7. 프론트엔드에서 의존성 방향이란? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
프론트엔드에서 의존성 방향은 **UI Layer → Business Logic Layer → Data Access Layer** 단방향으로 유지해야 합니다. 상위 레이어가 하위 레이어에만 의존하고, 하위 레이어가 상위 레이어를 알면 안 됩니다. 이 원칙을 지키면 API 응답 구조가 바뀌어도 Data Access Layer만 수정하고, UI를 리디자인해도 비즈니스 로직은 그대로 유지됩니다.

### 레이어 구조

```
[UI Layer]              → 컴포넌트, JSX
      ↓ (의존)
[Business Logic Layer]  → 커스텀 훅, 서비스
      ↓ (의존)
[Data Access Layer]     → API 호출 함수, React Query
```

### 단방향 의존성의 장점

| 장점 | 설명 |
|------|------|
| 변경 격리 | API 변경 시 Data Access Layer만 수정 |
| 테스트 용이 | 레이어별 독립 테스트 가능 |
| 재사용성 | 비즈니스 로직을 다른 UI에서도 사용 가능 |
| 타입 안전성 | TypeScript로 레이어 간 계약 명시 |

```ts
// Data Access Layer: API 호출 추상화
async function fetchUserById(id: number): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return transformUser(response.data); // API 응답 → 도메인 모델 변환
}

// Business Logic Layer: 비즈니스 규칙
function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId), // Data Access Layer 사용
  });
}

// UI Layer: 렌더링
function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading } = useUserProfile(userId); // Business Logic Layer 사용
  if (isLoading) return <Spinner />;
  return <div>{user?.name}</div>;
}
```

### 면접관이 주목하는 포인트
- 단방향 의존성의 실질적 이점을 설명할 수 있는지
- API 응답 타입과 도메인 타입을 분리하는 이유를 이해하는지

### 꼬리 질문 대비
- "API 응답 타입과 도메인 타입을 왜 분리하나요?"
  → API 응답은 snake_case나 불필요한 필드가 있을 수 있음. 변환 레이어를 두면 백엔드 변경 영향을 최소화하고 프론트 도메인 모델을 독립적으로 유지

</details>

---

## Q8. 프론트엔드 아키텍처에서 관심사 분리란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
관심사 분리(Separation of Concerns)는 **UI 렌더링, 비즈니스 로직, 데이터 접근을 각각 독립적인 단위로 분리**하는 설계 원칙입니다. React에서는 Presentational/Container 패턴이나 커스텀 훅을 통해 구현합니다. 분리하면 각 부분을 독립적으로 테스트할 수 있고, 변경 시 영향 범위를 최소화할 수 있습니다.

### 관심사 분리 방법

| 패턴 | 설명 |
|------|------|
| Presentational/Container | 렌더링 컴포넌트와 데이터 컴포넌트 분리 |
| 커스텀 훅 분리 | 로직을 훅으로 추출하여 UI와 분리 |
| 레이어 분리 | UI/비즈니스 로직/데이터 접근 레이어 분리 |

```tsx
// 관심사 분리 전: 하나의 컴포넌트에 모든 것이 혼재
function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/users').then(r => r.json()).then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div>로딩 중...</div>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// 관심사 분리 후: 로직과 UI 분리

// 1. 데이터 로직: 커스텀 훅
function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers });
}

// 2. UI: Presentational 컴포넌트
function UserListView({ users }: { users: User[] }) {
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// 3. Container 컴포넌트
function UserListContainer() {
  const { data: users = [], isLoading } = useUsers();
  if (isLoading) return <Spinner />;
  return <UserListView users={users} />;
}
```

### 면접관이 주목하는 포인트
- 관심사 분리의 이점(테스트 용이성, 재사용성)을 설명할 수 있는지
- 실제 코드에서 어떻게 분리하는지 예시를 들 수 있는지

### 꼬리 질문 대비
- "React Hook 이후로 Presentational/Container 패턴이 여전히 유효한가요?"
  → 엄격하게 분리하지 않더라도, "렌더링만 하는 컴포넌트"와 "데이터를 조합하는 컴포넌트"의 구분은 여전히 코드 가독성과 테스트 측면에서 유효

</details>

---

## 학습 체크리스트

- [ ] 모놀리식, MSA, BFF 아키텍처의 차이와 트레이드오프 설명 가능
- [ ] BFF 패턴의 역할과 장단점 설명 가능
- [ ] 서버 상태, 전역 클라이언트 상태, 로컬 상태의 차이와 관리 도구 설명 가능
- [ ] feature 기반 폴더 구조를 설계하고 이유 설명 가능
- [ ] 공통 컴포넌트 래핑의 이유와 방법 설명 가능
- [ ] 비즈니스 로직 배치 기준(재사용 여부, 두 번째 사용처 원칙) 설명 가능
- [ ] UI → Business Logic → Data Access 단방향 의존성 설명 가능
- [ ] 관심사 분리의 개념과 React에서의 구현 방법 설명 가능
