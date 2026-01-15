# 자료구조 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Array와 LinkedList의 차이점은 무엇인가요? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Array | LinkedList |
|------|-------|------------|
| 메모리 | 연속적 | 비연속적 |
| 접근 | O(1) - 인덱스 | O(n) - 순차 |
| 삽입/삭제 | O(n) | O(1) - 위치 알 때 |
| 크기 | 고정 (동적 배열 제외) | 가변 |
| 캐시 효율 | 좋음 | 나쁨 |

### 상세 설명
- **Array**: 인덱스로 O(1) 접근, 중간 삽입/삭제 시 요소 이동 필요
- **LinkedList**: 노드가 다음 노드 참조, 삽입/삭제 시 포인터만 변경

### 면접관이 주목하는 포인트
- 캐시 지역성(Cache Locality) 개념
- 실제 사용 시 선택 기준

### 꼬리 질문 대비
- "ArrayList와 LinkedList 중 언제 무엇을 사용하나요?"
  → 조회 많음: ArrayList, 삽입/삭제 많음: LinkedList
- "왜 실무에서는 대부분 ArrayList를 사용하나요?"
  → 캐시 효율성, 실제 삽입/삭제가 끝에서 주로 발생

</details>

---

## Q2. Stack과 Queue의 차이점은 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Stack | Queue |
|------|-------|-------|
| 원리 | LIFO (후입선출) | FIFO (선입선출) |
| 삽입 | push() | enqueue() |
| 삭제 | pop() | dequeue() |
| 사용 사례 | 함수 호출, 실행취소 | 작업 대기열, BFS |

### 활용 사례
- **Stack**: 브라우저 뒤로가기, 함수 콜 스택, 괄호 검사
- **Queue**: 프린터 대기열, BFS, 메시지 큐

### 면접관이 주목하는 포인트
- 자바에서의 구현 방법
- Deque의 활용

### 꼬리 질문 대비
- "Java에서 Stack 대신 무엇을 사용하나요?"
  → Deque (ArrayDeque) - Stack 클래스는 Vector 상속으로 성능 이슈

</details>

---

## Q3. HashMap의 동작 원리를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
HashMap은 키를 해시 함수로 변환하여 버킷(배열)의 인덱스로 사용합니다. 평균 O(1)의 시간 복잡도로 조회, 삽입, 삭제가 가능합니다.

### 동작 과정
```
1. key.hashCode() 계산
2. 해시값 % 버킷 크기 = 인덱스
3. 해당 인덱스에 저장/조회
```

### 해시 충돌 해결
1. **Chaining**: 같은 인덱스에 LinkedList로 연결 (Java 8+: 트리)
2. **Open Addressing**: 다른 빈 버킷 탐색

### Java 8 이후 개선
- 하나의 버킷에 8개 이상 → LinkedList → Red-Black Tree
- 최악의 경우 O(n) → O(log n)

### 면접관이 주목하는 포인트
- hashCode()와 equals()의 관계
- 왜 둘 다 오버라이딩해야 하는지

### 꼬리 질문 대비
- "hashCode()만 오버라이딩하면 안 되나요?"
  → 해시값이 같아도 equals()로 실제 키 비교 필요
- "HashMap vs Hashtable 차이점?"
  → HashMap: 동기화 X, null 허용 / Hashtable: 동기화 O, null 불가

</details>

---

## Q4. 이진 탐색 트리(BST)란 무엇인가요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
이진 탐색 트리는 각 노드의 왼쪽 서브트리에는 작은 값, 오른쪽 서브트리에는 큰 값이 저장되는 이진 트리입니다.

### 시간 복잡도

| 연산 | 평균 | 최악 (편향) |
|------|------|-----------|
| 검색 | O(log n) | O(n) |
| 삽입 | O(log n) | O(n) |
| 삭제 | O(log n) | O(n) |

### BST 특징
```
       8
      / \
     3   10
    / \    \
   1   6    14
```
- 중위 순회 시 정렬된 순서로 출력

### 면접관이 주목하는 포인트
- 균형 트리의 필요성 (AVL, Red-Black Tree)
- 편향 트리 문제

### 꼬리 질문 대비
- "BST가 편향되면 어떻게 해결하나요?"
  → 자가 균형 트리 사용 (AVL Tree, Red-Black Tree)

</details>

---

## Q5. Heap이란 무엇이며 어디에 사용되나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Heap은 완전 이진 트리로, 최대값/최소값을 O(1)에 찾을 수 있는 자료구조입니다. 부모 노드가 자식 노드보다 항상 크거나(Max Heap) 작습니다(Min Heap).

### 시간 복잡도
- 최대/최소값 조회: O(1)
- 삽입: O(log n)
- 삭제: O(log n)

### 사용 사례
1. **우선순위 큐**: 작업 스케줄링
2. **힙 정렬**: O(n log n) 정렬
3. **다익스트라 알고리즘**: 최단 경로

### Java에서의 구현
```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
```

### 면접관이 주목하는 포인트
- 배열로 Heap 구현하는 방법
- 부모/자식 인덱스 관계

</details>

---

## Q6. 트리와 그래프의 차이점은? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 트리 | 그래프 |
|------|------|--------|
| 사이클 | 없음 | 가능 |
| 루트 | 있음 | 없음 |
| 방향 | 부모→자식 | 방향/무방향 |
| 관계 | 계층적 | 네트워크 |

### 트리의 특징
- 노드 N개 → 간선 N-1개
- 임의의 두 노드 사이 경로 유일

### 활용
- **트리**: DOM, 파일 시스템, 조직도
- **그래프**: 소셜 네트워크, 지도, 추천 시스템

</details>

---

## Q7. 시간 복잡도 비교표 ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 자료구조별 시간 복잡도

| 자료구조 | 접근 | 검색 | 삽입 | 삭제 |
|---------|------|------|------|------|
| Array | O(1) | O(n) | O(n) | O(n) |
| LinkedList | O(n) | O(n) | O(1) | O(1) |
| Stack | O(n) | O(n) | O(1) | O(1) |
| Queue | O(n) | O(n) | O(1) | O(1) |
| HashMap | - | O(1) | O(1) | O(1) |
| BST (균형) | - | O(log n) | O(log n) | O(log n) |
| Heap | - | O(n) | O(log n) | O(log n) |

### 면접관이 주목하는 포인트
- 최선/평균/최악 케이스 구분
- 공간 복잡도도 함께 고려

</details>

---

## Q8. Set이란 무엇이며 어떤 종류가 있나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Set은 **중복을 허용하지 않는** 데이터 집합입니다. 순서가 없으며 하나의 null만 허용합니다.

### Set 종류 비교

| 구분 | HashSet | LinkedHashSet | TreeSet |
|------|---------|---------------|---------|
| 순서 | 없음 | 삽입 순서 유지 | 정렬 순서 |
| 내부 구조 | HashMap | LinkedHashMap | Red-Black Tree |
| 성능 | O(1) | O(1) | O(log n) |
| null | 1개 허용 | 1개 허용 | 허용 안됨 |

### 코드 예시
```java
// HashSet - 순서 없음
Set<String> hashSet = new HashSet<>();
hashSet.add("B");
hashSet.add("A");
hashSet.add("C");
// 출력: [A, B, C] 또는 [C, A, B] (순서 보장 X)

// LinkedHashSet - 삽입 순서 유지
Set<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("B");
linkedSet.add("A");
linkedSet.add("C");
// 출력: [B, A, C]

// TreeSet - 정렬됨
Set<String> treeSet = new TreeSet<>();
treeSet.add("B");
treeSet.add("A");
treeSet.add("C");
// 출력: [A, B, C] (알파벳 순)
```

### 사용 사례
- **HashSet**: 빠른 검색, 중복 제거
- **LinkedHashSet**: 순서가 중요한 중복 제거
- **TreeSet**: 정렬된 데이터 필요

### 면접관이 주목하는 포인트
- hashCode()와 equals()의 역할
- TreeSet에서 Comparable/Comparator 필요성

</details>

---

## Q9. HashTable의 동작 원리와 충돌 해결 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
HashTable은 키를 **해시 함수**로 변환하여 버킷(배열)의 인덱스로 사용하는 자료구조입니다.

### 동작 원리
```
1. key.hashCode() 계산 → 해시값
2. 해시값 % 버킷 크기 = 인덱스
3. 해당 인덱스에 저장/조회
```

### 해시 충돌 (Collision)
서로 다른 키가 같은 인덱스로 매핑되는 현상

### 충돌 해결 방법

**1. Separate Chaining (분리 연결법)**
```
버킷[0] → [K1:V1] → [K2:V2] → null
버킷[1] → [K3:V3] → null
버킷[2] → null
```
- 같은 인덱스에 LinkedList로 연결
- Java HashMap은 8개 초과 시 Red-Black Tree로 변환

**2. Open Addressing (개방 주소법)**
```
충돌 발생 시 다른 빈 버킷 탐색
- Linear Probing: 순차적 탐색 (+1, +2, +3...)
- Quadratic Probing: 제곱 탐색 (+1, +4, +9...)
- Double Hashing: 두 번째 해시 함수 사용
```

### 시간 복잡도

| 연산 | 평균 | 최악 |
|------|------|------|
| 검색 | O(1) | O(n) |
| 삽입 | O(1) | O(n) |
| 삭제 | O(1) | O(n) |

### 면접관이 주목하는 포인트
- Load Factor와 리사이징
- Java 8에서 HashMap 개선 (Tree 변환)

</details>

---

---

## Q10. AVL 트리란 무엇인가요? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
AVL 트리는 **자가 균형 이진 탐색 트리**로, 모든 노드에서 왼쪽과 오른쪽 서브트리의 높이 차이(Balance Factor)가 최대 1입니다.

### BST의 문제점

```
// 정렬된 순서로 삽입 시 편향
1 → 2 → 3 → 4 → 5

    1
     \
      2
       \
        3
         \
          4
           \
            5

// 검색: O(n) - 연결 리스트와 동일
```

### AVL 트리의 균형 유지

```
Balance Factor (BF) = 왼쪽 높이 - 오른쪽 높이
허용 범위: -1, 0, 1

      3 (BF=0)
     / \
    2   4 (BF=0)
   /     \
  1       5
```

### 회전 연산

| 상황 | BF | 회전 |
|------|-----|------|
| LL (Left-Left) | +2, +1 | 우회전 |
| RR (Right-Right) | -2, -1 | 좌회전 |
| LR (Left-Right) | +2, -1 | 좌회전 → 우회전 |
| RL (Right-Left) | -2, +1 | 우회전 → 좌회전 |

### 시간 복잡도

| 연산 | BST (최악) | AVL |
|------|-----------|-----|
| 검색 | O(n) | O(log n) |
| 삽입 | O(n) | O(log n) |
| 삭제 | O(n) | O(log n) |

### AVL vs Red-Black Tree

| 구분 | AVL | Red-Black |
|------|-----|-----------|
| 균형 | 더 엄격 | 덜 엄격 |
| 검색 | 빠름 | 약간 느림 |
| 삽입/삭제 | 느림 (회전 많음) | 빠름 |
| 사용처 | 검색 위주 | 삽입/삭제 위주 (Java TreeMap) |

### 면접관이 주목하는 포인트
- 균형 유지 원리 (회전)
- Red-Black Tree와의 비교

</details>

---

## Q11. DFS와 BFS의 차이점과 사용 사례는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | DFS (깊이 우선) | BFS (너비 우선) |
|------|----------------|-----------------|
| 탐색 방식 | 깊이 먼저 | 너비 먼저 |
| 자료구조 | Stack (재귀) | Queue |
| 메모리 | 경로만 저장 | 모든 인접 노드 저장 |
| 최단 경로 | 보장 X | 보장 O (가중치 없을 때) |

### 탐색 순서 비교

```
       1
      /|\
     2 3 4
    /|   |
   5 6   7

DFS: 1 → 2 → 5 → 6 → 3 → 4 → 7 (깊이 먼저)
BFS: 1 → 2 → 3 → 4 → 5 → 6 → 7 (레벨 순서)
```

### 구현 (Java)

```java
// DFS - 재귀
void dfs(int node, boolean[] visited) {
    visited[node] = true;
    System.out.print(node + " ");

    for (int next : graph[node]) {
        if (!visited[next]) {
            dfs(next, visited);
        }
    }
}

// BFS - Queue
void bfs(int start) {
    Queue<Integer> queue = new LinkedList<>();
    boolean[] visited = new boolean[n];

    queue.offer(start);
    visited[start] = true;

    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.print(node + " ");

        for (int next : graph[node]) {
            if (!visited[next]) {
                visited[next] = true;
                queue.offer(next);
            }
        }
    }
}
```

### 사용 사례

| DFS | BFS |
|-----|-----|
| 백트래킹 (N-Queen) | 최단 경로 |
| 미로 탐색 (모든 경로) | 미로 탐색 (최단 경로) |
| 사이클 탐지 | 레벨 순회 |
| 위상 정렬 | 네트워크 방송 |
| 연결 요소 찾기 | 소셜 네트워크 친구 추천 |

### 면접관이 주목하는 포인트
- 시간/공간 복잡도
- 문제에 따른 선택 기준

### 꼬리 질문 대비
- "DFS에서 스택 오버플로우 방지 방법은?"
  → 명시적 스택 사용, 꼬리 재귀 최적화

</details>

---

## 학습 체크리스트

- [ ] Array vs LinkedList 차이 설명 가능
- [ ] Stack vs Queue 차이 설명 가능
- [ ] HashMap 동작 원리 및 충돌 해결 방법 이해
- [ ] 이진 탐색 트리 특징 이해
- [ ] Heap의 활용 사례 알기
- [ ] 주요 자료구조의 시간 복잡도 암기
- [ ] Set 종류와 차이점 설명 가능
- [ ] HashTable 충돌 해결 방법 이해
- [ ] AVL 트리와 균형 유지 원리 이해
- [ ] DFS/BFS 차이와 사용 사례 설명 가능
