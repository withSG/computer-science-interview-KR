# Docker 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Docker 이미지와 컨테이너의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | 이미지 | 컨테이너 |
|------|--------|---------|
| 상태 | 불변 (Immutable) | 가변 (런타임) |
| 비유 | 클래스 | 인스턴스 |
| 저장 | 레이어 구조 | 쓰기 가능 레이어 추가 |
| 생성 | `docker build` | `docker run` |

### 관계

```
Image (읽기 전용)
   │
   ├── Container 1 (실행 중)
   │      └── Writable Layer
   │
   ├── Container 2 (실행 중)
   │      └── Writable Layer
   │
   └── Container 3 (정지됨)
          └── Writable Layer
```

### 이미지 레이어 구조

```dockerfile
FROM ubuntu:20.04      # Layer 1
RUN apt-get update     # Layer 2
COPY app.py /app/      # Layer 3
CMD ["python", "app.py"]
```

```
┌─────────────────────┐
│ Layer 3: COPY app.py│
├─────────────────────┤
│ Layer 2: apt-get    │
├─────────────────────┤
│ Layer 1: ubuntu     │
└─────────────────────┘
```

### 면접관이 주목하는 포인트
- 레이어 개념 이해
- 이미지 캐싱 원리

</details>

---

## Q2. Dockerfile 최적화 방법은? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 1. 레이어 캐싱 활용

```dockerfile
# 나쁜 예: 코드 변경 시 의존성도 다시 설치
COPY . /app
RUN pip install -r requirements.txt

# 좋은 예: 의존성 캐시 활용
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY . /app
```

### 2. 멀티 스테이지 빌드

```dockerfile
# 빌드 스테이지
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 최종 이미지에는 node_modules 없음!
```

### 3. 베이스 이미지 선택

```dockerfile
# 나쁜 예: 불필요하게 큼
FROM ubuntu:20.04  # ~70MB

# 좋은 예: 경량 이미지
FROM alpine:3.14   # ~5MB
FROM node:16-alpine
FROM python:3.9-slim
```

### 4. 불필요한 파일 제외

```
# .dockerignore
node_modules
.git
*.md
__pycache__
```

### 면접관이 주목하는 포인트
- 실제 최적화 경험
- 이미지 크기 줄이는 방법

</details>

---

## Q3. Docker 네트워크 종류는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 네트워크 | 설명 | 사용 사례 |
|---------|------|----------|
| bridge | 기본, 같은 호스트 내 통신 | 단일 호스트 |
| host | 호스트 네트워크 직접 사용 | 성능 중요 |
| none | 네트워크 없음 | 격리 필요 |
| overlay | 멀티 호스트 통신 | Docker Swarm |

### Bridge 네트워크

```bash
# 사용자 정의 네트워크 생성
docker network create my-network

# 컨테이너를 네트워크에 연결
docker run --network my-network --name web nginx
docker run --network my-network --name api node

# 컨테이너 이름으로 통신 가능
# api 컨테이너에서: curl http://web:80
```

### 포트 매핑

```bash
# 호스트 8080 → 컨테이너 80
docker run -p 8080:80 nginx
```

</details>

---

## Q4. Docker Volume을 사용하는 이유는? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
컨테이너는 삭제되면 데이터도 사라짐 → **Volume으로 데이터 영속화**

### Volume 종류

| 종류 | 명령어 | 용도 |
|------|--------|------|
| Named Volume | `-v mydata:/data` | 데이터 영속화 |
| Bind Mount | `-v /host/path:/container/path` | 개발 환경 |
| tmpfs | `--tmpfs /tmp` | 임시 데이터 |

### 사용 예시

```bash
# Named Volume
docker volume create db-data
docker run -v db-data:/var/lib/mysql mysql

# Bind Mount (개발용)
docker run -v $(pwd):/app node npm start
```

### Docker Compose에서

```yaml
services:
  db:
    image: mysql
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

</details>

---

## Q5. Docker Compose란? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변
Docker Compose는 **멀티 컨테이너 애플리케이션을 정의하고 실행**하는 도구입니다.

### docker-compose.yml 예시

```yaml
version: '3.8'

services:
  web:
    build: ./web
    ports:
      - "3000:3000"
    depends_on:
      - api
      - db

  api:
    build: ./api
    environment:
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  db-data:
```

### 주요 명령어

```bash
docker-compose up -d      # 시작
docker-compose down       # 중지 + 삭제
docker-compose logs -f    # 로그
docker-compose ps         # 상태 확인
docker-compose build      # 재빌드
```

</details>

---

## Q6. 컨테이너와 VM의 차이는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

| 구분 | Container | VM |
|------|-----------|-----|
| 격리 수준 | 프로세스 | OS |
| OS | 커널 공유 | 각각 Guest OS |
| 크기 | MB 단위 | GB 단위 |
| 부팅 | 초 단위 | 분 단위 |
| 성능 | 거의 Native | 오버헤드 존재 |

### 내가 사용한 경험

```
"개발 환경은 Docker로 통일했습니다.
팀원 모두 동일한 환경에서 개발할 수 있어
'내 PC에서는 되는데' 문제가 사라졌습니다.

CI/CD에서도 동일한 이미지를 사용해
개발-테스트-프로덕션 환경 일관성을 유지했습니다."
```

</details>

---

## 학습 체크리스트

- [ ] 이미지와 컨테이너 차이 설명 가능
- [ ] Dockerfile 최적화 4가지 이상 알기
- [ ] Docker 네트워크 종류 알기
- [ ] Volume 사용 이유와 종류 알기
- [ ] Docker Compose 작성 가능
- [ ] 컨테이너 vs VM 비교 가능
