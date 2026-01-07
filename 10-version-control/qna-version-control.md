# 버전 관리 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Git의 기본 개념을 설명해주세요. ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Git은 **분산 버전 관리 시스템**으로, 코드 변경 이력을 추적하고 협업을 지원합니다.

### Git 영역

```
Working Directory → Staging Area → Local Repo → Remote Repo
                git add       git commit      git push
```

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| git init | 저장소 초기화 |
| git clone | 원격 저장소 복제 |
| git add | 스테이징 영역에 추가 |
| git commit | 변경사항 커밋 |
| git push | 원격에 업로드 |
| git pull | 원격에서 가져오기 |
| git branch | 브랜치 관리 |
| git checkout | 브랜치 전환 |
| git merge | 브랜치 병합 |

### .git 폴더 구조

```
.git/
├── HEAD          # 현재 브랜치
├── objects/      # 모든 데이터 (blob, tree, commit)
├── refs/         # 브랜치, 태그 포인터
└── config        # 설정
```

</details>

---

## Q2. Merge와 Rebase의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Merge | Rebase |
|------|-------|--------|
| 결과 | 병합 커밋 생성 | 선형 히스토리 |
| 히스토리 | 분기 보존 | 깔끔 |
| 협업 | 안전 | 주의 필요 |

### Merge

```
    A---B---C (feature)
   /         \
  D---E---F---G (main)

병합 커밋 G 생성
```

### Rebase

```
          A'--B'--C' (feature)
         /
  D---E---F (main)

커밋 재적용, 선형 히스토리
```

### 사용 가이드

```
Merge:
- 공유된 브랜치
- 이력 보존 중요

Rebase:
- 로컬 브랜치 정리
- 깔끔한 히스토리 선호
- 공유 브랜치에선 절대 rebase 금지!
```

### 면접관이 주목하는 포인트
- 각각의 장단점
- 실무 경험

</details>

---

## Q3. Git Flow와 GitHub Flow의 차이는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### Git Flow

```
main ────────────────────────────
        ↑                    ↑
release ──────────┐    ┌──────
        ↑         │    │
develop ──────────┴────┴─────────
        ↑    ↑
feature ─────┘
hotfix ─────────────────────────→ main
```

- 복잡하지만 체계적
- 릴리스 주기가 있는 프로젝트

### GitHub Flow

```
main ────────────────────────────
        ↑         ↑
feature ──────────┘
```

- 단순, 지속적 배포
- 웹 서비스에 적합

### Trunk Based Development

```
main ────────────────────────────
      ↑   ↑   ↑
      │   │   │
   (짧은 feature 브랜치)
```

- 빠른 통합
- CI/CD 필수

</details>

---

## Q4. 충돌(Conflict)은 왜 발생하고 어떻게 해결하나요? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
충돌은 **같은 파일의 같은 부분을 서로 다르게 수정**했을 때 발생합니다.

### 충돌 발생 상황

```
main:    line 1: Hello
feature: line 1: Hi

→ 어떤 것을 선택해야 할지 Git이 판단 불가
```

### 충돌 표시

```
<<<<<<< HEAD
Hello (현재 브랜치)
=======
Hi (병합 브랜치)
>>>>>>> feature
```

### 해결 방법

```
1. 충돌 파일 확인
   git status

2. 파일 수정 (원하는 내용으로)
   Hello  # 또는 Hi, 또는 둘 다

3. 스테이징 & 커밋
   git add .
   git commit -m "Resolve conflict"
```

### 충돌 방지

```
- 자주 pull 받기
- 작은 단위로 커밋
- 같은 파일 동시 수정 피하기
```

</details>

---

## Q5. git reset과 git revert의 차이는? ⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 명령어 | 설명 | 사용 시점 |
|--------|------|----------|
| reset | 커밋 삭제 (히스토리 변경) | 로컬 브랜치 |
| revert | 취소 커밋 생성 (히스토리 보존) | 공유 브랜치 |

### reset 옵션

```bash
git reset --soft HEAD~1   # 커밋만 취소
git reset --mixed HEAD~1  # 커밋 + 스테이징 취소 (기본)
git reset --hard HEAD~1   # 모든 변경 삭제
```

### revert

```bash
git revert HEAD  # HEAD 커밋을 취소하는 새 커밋 생성
```

### 선택 기준

```
로컬만: reset (간단)
이미 push: revert (안전)
```

</details>

---

## 학습 체크리스트

- [ ] Git 영역과 기본 명령어 알기
- [ ] Merge vs Rebase 차이 설명 가능
- [ ] 브랜칭 전략 비교 가능
- [ ] 충돌 해결 방법 알기
- [ ] reset vs revert 차이 알기
