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

## 학습 체크리스트

- [ ] Array vs LinkedList 차이 설명 가능
- [ ] Stack vs Queue 차이 설명 가능
- [ ] HashMap 동작 원리 및 충돌 해결 방법 이해
- [ ] 이진 탐색 트리 특징 이해
- [ ] Heap의 활용 사례 알기
- [ ] 주요 자료구조의 시간 복잡도 암기
