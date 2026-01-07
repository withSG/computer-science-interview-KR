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

## 학습 체크리스트

- [ ] Big-O 표기법 이해 및 주요 복잡도 암기
- [ ] Quick Sort vs Merge Sort 비교 설명 가능
- [ ] 이진 탐색 구현 가능
- [ ] DFS vs BFS 차이 및 사용 사례 이해
- [ ] DP 개념 및 간단한 문제 풀이 가능
- [ ] 정렬 알고리즘 복잡도 비교표 암기
