# 알고리즘 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. 시간 복잡도란 무엇이며, Big-O 표기법을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
시간 복잡도는 입력 크기에 따른 알고리즘의 실행 시간 증가율을 나타냅니다. Big-O 표기법은 최악의 경우를 기준으로 상한선을 표현합니다.

### 주요 시간 복잡도

| 복잡도 | 이름 | 예시 |
|--------|------|------|
| O(1) | 상수 | 배열 인덱스 접근 |
| O(log n) | 로그 | 이진 탐색 |
| O(n) | 선형 | 단순 반복문 |
| O(n log n) | 선형로그 | 퀵소트, 머지소트 |
| O(n²) | 이차 | 버블소트, 중첩 반복문 |
| O(2ⁿ) | 지수 | 피보나치 재귀 |

### 성능 비교 (n=1000)
```
O(1)       = 1
O(log n)   ≈ 10
O(n)       = 1,000
O(n log n) ≈ 10,000
O(n²)      = 1,000,000
O(2ⁿ)      = 무한대급
```

### 면접관이 주목하는 포인트
- 최선/평균/최악 케이스 구분
- 공간 복잡도도 함께 분석

</details>

---

## Q2. Quick Sort와 Merge Sort를 비교해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Quick Sort | Merge Sort |
|------|------------|------------|
| 평균 | O(n log n) | O(n log n) |
| 최악 | O(n²) | O(n log n) |
| 공간 | O(log n) | O(n) |
| 안정성 | 불안정 | 안정 |
| 방식 | 분할 정복 (제자리) | 분할 정복 (병합) |

### Quick Sort
```
1. 피벗 선택
2. 피벗보다 작은 값은 왼쪽, 큰 값은 오른쪽
3. 재귀적으로 분할
```

### Merge Sort
```
1. 배열을 반으로 분할
2. 각각 정렬
3. 병합 (추가 공간 필요)
```

### 면접관이 주목하는 포인트
- Quick Sort 최악의 경우와 해결책
- 안정 정렬의 의미와 필요성

### 꼬리 질문 대비
- "Quick Sort 최악의 경우를 피하는 방법?"
  → 랜덤 피벗, 중앙값 피벗 선택
- "Java의 Arrays.sort()는 무엇을 사용하나요?"
  → Dual-Pivot Quick Sort (기본 타입), TimSort (객체)

</details>

---

## Q3. 이진 탐색(Binary Search)의 원리를 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
이진 탐색은 **정렬된 배열**에서 중간값과 비교하여 탐색 범위를 절반씩 줄여나가는 알고리즘입니다. 시간 복잡도는 O(log n)입니다.

### 동작 과정
```
찾는 값: 7
배열: [1, 3, 5, 7, 9, 11, 13]

1단계: mid=5, 7>5 → 오른쪽 탐색
       [7, 9, 11, 13]
2단계: mid=9, 7<9 → 왼쪽 탐색
       [7]
3단계: mid=7, 찾음!
```

### 구현 (Java)
```java
public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

### 면접관이 주목하는 포인트
- 전제 조건: 정렬된 배열
- 오버플로우 방지: `left + (right - left) / 2`

</details>

---

## Q4. DFS와 BFS의 차이점은 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | DFS | BFS |
|------|-----|-----|
| 방식 | 깊이 우선 | 너비 우선 |
| 구현 | 스택/재귀 | 큐 |
| 메모리 | 적음 | 많음 |
| 최단 경로 | 보장 안됨 | 보장 (가중치 없을 때) |
| 사용 | 경로 탐색, 사이클 | 최단 거리, 레벨 탐색 |

### 탐색 순서 예시
```
    1
   / \
  2   3
 / \
4   5

DFS: 1 → 2 → 4 → 5 → 3
BFS: 1 → 2 → 3 → 4 → 5
```

### 면접관이 주목하는 포인트
- 언제 어떤 것을 사용하는지
- 시간/공간 복잡도

### 꼬리 질문 대비
- "미로 최단 경로를 찾으려면?"
  → BFS (최단 경로 보장)
- "모든 경로를 탐색하려면?"
  → DFS (백트래킹)

</details>

---

## Q5. 동적 프로그래밍(DP)이란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
동적 프로그래밍은 큰 문제를 작은 부분 문제로 나누고, 중복 계산을 방지하기 위해 결과를 저장(메모이제이션)하여 효율적으로 해결하는 기법입니다.

### DP 적용 조건
1. **최적 부분 구조**: 큰 문제의 해가 작은 문제의 해로 구성
2. **중복 부분 문제**: 같은 부분 문제가 여러 번 계산됨

### 피보나치 예시
```java
// 재귀 (비효율): O(2^n)
int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}

// DP (효율): O(n)
int fibDP(int n) {
    int[] dp = new int[n+1];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}
```

### 면접관이 주목하는 포인트
- Top-down vs Bottom-up 방식
- 점화식 세우는 능력

</details>

---

## Q6. 정렬 알고리즘 비교표 ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 정렬 알고리즘 비교

| 알고리즘 | 평균 | 최악 | 공간 | 안정성 |
|---------|------|------|------|--------|
| Bubble | O(n²) | O(n²) | O(1) | O |
| Selection | O(n²) | O(n²) | O(1) | X |
| Insertion | O(n²) | O(n²) | O(1) | O |
| Merge | O(n log n) | O(n log n) | O(n) | O |
| Quick | O(n log n) | O(n²) | O(log n) | X |
| Heap | O(n log n) | O(n log n) | O(1) | X |
| Tim | O(n log n) | O(n log n) | O(n) | O |
| Counting | O(n+k) | O(n+k) | O(k) | O |

### 안정 정렬이란?
동일한 값의 상대적 순서가 정렬 후에도 유지되는 것

### 면접관이 주목하는 포인트
- 상황별 최적 알고리즘 선택
- 실무에서 사용되는 정렬 (TimSort)

</details>

---

## Q7. 배열에서 빠진 수 찾기 ⭐⭐

<details>
<summary>답변 보기</summary>

### 문제
[0, n] 범위의 n개의 양의 정수가 담긴 배열에서 빠진 수 하나를 찾으세요.

### 핵심 답변
**XOR 연산** 또는 **수학 공식**을 사용하면 O(n) 시간, O(1) 공간으로 해결할 수 있습니다.

### 방법 1: 수학 공식 (권장)
```java
public int missingNumber(int[] nums) {
    int n = nums.length;
    int expectedSum = n * (n + 1) / 2;
    int actualSum = 0;
    for (int num : nums) {
        actualSum += num;
    }
    return expectedSum - actualSum;
}
```

### 방법 2: XOR 연산
```java
public int missingNumber(int[] nums) {
    int xor = nums.length;
    for (int i = 0; i < nums.length; i++) {
        xor ^= i ^ nums[i];
    }
    return xor;
}
```

### 시간/공간 복잡도
- 시간: O(n)
- 공간: O(1)

### 면접관이 주목하는 포인트
- 정렬 없이 O(n)으로 해결하는 아이디어
- 오버플로우 고려 (큰 n에서 sum 방식은 주의)

</details>

---

## Q8. 배열로 가장 큰 숫자 만들기 ⭐⭐

<details>
<summary>답변 보기</summary>

### 문제
정수 배열이 주어졌을 때, 배열의 숫자들을 이어붙여 만들 수 있는 가장 큰 숫자를 반환하세요.

### 핵심 답변
**커스텀 비교 함수**로 정렬합니다. 두 숫자 a, b를 비교할 때 "ab" vs "ba"를 비교하여 더 큰 조합이 앞에 오도록 합니다.

### 구현 (Java)
```java
public String largestNumber(int[] nums) {
    String[] strs = new String[nums.length];
    for (int i = 0; i < nums.length; i++) {
        strs[i] = String.valueOf(nums[i]);
    }

    Arrays.sort(strs, (a, b) -> (b + a).compareTo(a + b));

    // 모두 0인 경우
    if (strs[0].equals("0")) return "0";

    StringBuilder sb = new StringBuilder();
    for (String s : strs) {
        sb.append(s);
    }
    return sb.toString();
}
```

### 예시
```
입력: [3, 30, 34, 5, 9]
비교: "330" vs "303" → 3이 30보다 앞
정렬: [9, 5, 34, 3, 30]
출력: "9534330"
```

### 시간/공간 복잡도
- 시간: O(n log n) - 정렬
- 공간: O(n) - 문자열 배열

### 면접관이 주목하는 포인트
- 비교 함수의 아이디어
- 엣지 케이스 (모두 0인 경우)

</details>

---

## Q9. 배열에서 중복 원소 찾기 ⭐⭐

<details>
<summary>답변 보기</summary>

### 문제
n+1 크기의 배열에 1~n 범위의 정수가 들어있을 때, 중복되는 숫자를 찾으세요.

### 핵심 답변
**Floyd의 순환 탐지 알고리즘** (토끼와 거북이)을 사용하면 O(n) 시간, O(1) 공간으로 해결 가능합니다.

### 방법 1: HashSet (간단)
```java
public int findDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (!seen.add(num)) {
            return num;
        }
    }
    return -1;
}
// 시간 O(n), 공간 O(n)
```

### 방법 2: Floyd's Cycle Detection (최적)
```java
public int findDuplicate(int[] nums) {
    int slow = nums[0];
    int fast = nums[0];

    // 순환 탐지
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);

    // 순환 시작점 찾기
    slow = nums[0];
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}
// 시간 O(n), 공간 O(1)
```

### 면접관이 주목하는 포인트
- 배열을 수정하지 않고 O(1) 공간으로 해결
- 순환 탐지 알고리즘 이해

</details>

---

## Q10. 유전 알고리즘(Genetic Algorithm)이란? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
유전 알고리즘은 **생물의 진화 과정**을 모방한 최적화 알고리즘입니다. 자연 선택, 교차, 돌연변이를 통해 해를 점진적으로 개선합니다.

### 주요 개념

| 용어 | 설명 |
|------|------|
| 염색체 (Chromosome) | 하나의 해 후보 |
| 유전자 (Gene) | 해를 구성하는 개별 요소 |
| 적합도 (Fitness) | 해의 품질 평가 함수 |
| 선택 (Selection) | 적합도가 높은 개체 선택 |
| 교차 (Crossover) | 두 부모의 유전자를 조합 |
| 돌연변이 (Mutation) | 무작위로 유전자 변경 |

### 동작 과정
```
1. 초기 집단 생성 (랜덤)
2. 적합도 평가
3. 선택 (룰렛 휠, 토너먼트 등)
4. 교차 (부모 조합)
5. 돌연변이 (다양성 유지)
6. 새로운 세대 생성
7. 종료 조건까지 반복
```

### 사용 사례
- 외판원 문제 (TSP)
- 스케줄링
- 신경망 하이퍼파라미터 튜닝
- 게임 AI

### 장단점

| 장점 | 단점 |
|------|------|
| 복잡한 문제에 적용 가능 | 최적해 보장 X |
| 전역 최적해 탐색 | 수렴 느림 |
| 도메인 지식 적게 필요 | 파라미터 튜닝 필요 |

### 면접관이 주목하는 포인트
- 언제 사용하는지 이해
- 다른 최적화 알고리즘과 비교 (시뮬레이티드 어닐링 등)

</details>

---

---

## Q11. 피보나치 수열의 구현 방법들을 비교해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
피보나치 수열은 **재귀, 메모이제이션, 타뷸레이션, 행렬 거듭제곱** 등의 방법으로 구현할 수 있으며, 각각 시간 복잡도가 다릅니다.

### 구현 방법 비교

| 방법 | 시간 복잡도 | 공간 복잡도 | 특징 |
|------|------------|------------|------|
| 단순 재귀 | O(2ⁿ) | O(n) | 가장 비효율 |
| 메모이제이션 | O(n) | O(n) | Top-down DP |
| 타뷸레이션 | O(n) | O(n) 또는 O(1) | Bottom-up DP |
| 행렬 거듭제곱 | O(log n) | O(1) | 가장 효율적 |

### 1. 단순 재귀 (비효율)

```java
// O(2^n) - 중복 계산 많음
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// fib(5) 호출 트리
//              fib(5)
//            /       \
//       fib(4)       fib(3)
//       /    \       /    \
//   fib(3) fib(2) fib(2) fib(1)
//   ...   중복 계산 많음!
```

### 2. 메모이제이션 (Top-down)

```java
// O(n), O(n)
int[] memo;

int fib(int n) {
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}
```

### 3. 타뷸레이션 (Bottom-up)

```java
// O(n), O(n)
int fib(int n) {
    if (n <= 1) return n;
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 공간 최적화: O(1)
int fib(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### 4. 행렬 거듭제곱 (가장 효율적)

```java
// O(log n) - 분할 정복
// [F(n+1), F(n)]   = [1 1]^n  * [F(1)]
// [F(n), F(n-1)]     [1 0]      [F(0)]

long[][] multiply(long[][] A, long[][] B) {
    return new long[][] {
        {A[0][0] * B[0][0] + A[0][1] * B[1][0],
         A[0][0] * B[0][1] + A[0][1] * B[1][1]},
        {A[1][0] * B[0][0] + A[1][1] * B[1][0],
         A[1][0] * B[0][1] + A[1][1] * B[1][1]}
    };
}

long fib(int n) {
    if (n <= 1) return n;
    long[][] result = {{1, 0}, {0, 1}};  // 단위 행렬
    long[][] base = {{1, 1}, {1, 0}};

    while (n > 0) {
        if (n % 2 == 1) result = multiply(result, base);
        base = multiply(base, base);
        n /= 2;
    }
    return result[0][1];
}
```

### 면접관이 주목하는 포인트
- 각 방법의 시간/공간 복잡도 비교
- 메모이제이션 vs 타뷸레이션 차이

### 꼬리 질문 대비
- "n이 매우 클 때(10⁹) 어떻게 구하나요?"
  → 행렬 거듭제곱 O(log n) + 모듈러 연산

</details>

---

## 학습 체크리스트

- [ ] Big-O 표기법 이해 및 주요 복잡도 암기
- [ ] Quick Sort vs Merge Sort 비교 설명 가능
- [ ] 이진 탐색 구현 가능
- [ ] DFS vs BFS 차이 및 사용 사례 이해
- [ ] DP 개념 및 간단한 문제 풀이 가능
- [ ] 정렬 알고리즘 복잡도 비교표 암기
- [ ] 배열 관련 코딩 문제 패턴 이해
- [ ] 유전 알고리즘 개념 이해
- [ ] 피보나치 수열 구현 방법들 비교 가능
