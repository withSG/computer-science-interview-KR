# Linux & Networking 면접 질문 & 답변

## 사용 방법
1. 질문을 먼저 읽고 스스로 답변해보세요
2. 답변을 확인하고 부족한 부분을 학습하세요
3. ⭐ 표시는 빈출 질문입니다

---

## Q1. Linux 파일 권한을 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 권한 구조

```
-rwxr-xr-- 1 user group 4096 Jan 15 10:30 file.txt
│├─┤├─┤├─┤
│ │  │  └── Others (기타 사용자)
│ │  └───── Group (그룹)
│ └──────── User (소유자)
└────────── 파일 타입 (- 파일, d 디렉토리, l 링크)
```

### 권한 의미

| 권한 | 파일 | 디렉토리 |
|------|------|----------|
| r (4) | 읽기 | 목록 보기 |
| w (2) | 쓰기 | 생성/삭제 |
| x (1) | 실행 | 진입 (cd) |

### chmod 사용법

```bash
# 숫자 방식
chmod 755 file.txt  # rwxr-xr-x
chmod 644 file.txt  # rw-r--r--
chmod 700 file.txt  # rwx------

# 기호 방식
chmod u+x file.txt  # 소유자에 실행 권한 추가
chmod g-w file.txt  # 그룹에서 쓰기 권한 제거
chmod o=r file.txt  # 기타 사용자는 읽기만
chmod a+x file.txt  # 모두에게 실행 권한

# 재귀적 적용
chmod -R 755 directory/
```

### 특수 권한

```
SetUID (4xxx): 실행 시 소유자 권한으로 실행
  예: /usr/bin/passwd (4755)

SetGID (2xxx): 실행 시 그룹 권한으로 실행
  디렉토리: 새 파일이 디렉토리 그룹 상속

Sticky Bit (1xxx): 소유자만 삭제 가능
  예: /tmp (1777)
```

### 실무 예시

```bash
# 웹 서버 설정
chmod 644 /var/www/html/*.html  # 읽기 전용
chmod 755 /var/www/html/cgi-bin/*.sh  # 실행 가능

# 민감한 설정 파일
chmod 600 ~/.ssh/id_rsa  # 소유자만 읽기/쓰기
chmod 700 ~/.ssh  # 소유자만 접근
```

</details>

---

## Q2. 프로세스 관리 명령어를 설명해주세요. ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### ps (프로세스 상태)

```bash
# 현재 터미널의 프로세스
ps

# 모든 프로세스 (BSD 스타일)
ps aux
# a: 다른 사용자 포함
# u: 상세 정보
# x: 터미널 없는 프로세스 포함

# 모든 프로세스 (UNIX 스타일)
ps -ef

# 특정 프로세스 찾기
ps aux | grep nginx

# 프로세스 트리
ps auxf
pstree -p
```

### top / htop (실시간 모니터링)

```
top - 10:30:00 up 5 days, load average: 0.50, 0.45, 0.40
Tasks: 150 total,   1 running, 149 sleeping
%Cpu(s):  5.0 us,  2.0 sy,  0.0 ni, 92.0 id,  1.0 wa
MiB Mem :  8000.0 total,  2000.0 free,  4000.0 used
MiB Swap:  2000.0 total,  2000.0 free,     0.0 used

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM
 1234 www-data  20   0  500000  50000  10000 S   5.0   0.6

# 유용한 단축키
P: CPU 순 정렬
M: 메모리 순 정렬
k: 프로세스 종료
q: 종료
```

### 프로세스 종료

```bash
# PID로 종료
kill 1234       # SIGTERM (정상 종료 요청)
kill -9 1234    # SIGKILL (강제 종료)
kill -15 1234   # SIGTERM (기본값)

# 이름으로 종료
killall nginx
pkill -f "python app.py"

# 시그널 목록
kill -l
```

### 백그라운드 실행

```bash
# 백그라운드 실행
./long_task.sh &

# nohup (터미널 종료 후에도 실행)
nohup ./long_task.sh > output.log 2>&1 &

# 작업 제어
jobs          # 백그라운드 작업 목록
fg %1         # 포그라운드로
bg %1         # 백그라운드로
Ctrl+Z        # 일시 정지
```

</details>

---

## Q3. 네트워크 트러블슈팅 명령어는? ⭐⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 연결 확인 순서

```
1. ping      - 네트워크 연결 확인
2. traceroute - 경로 추적
3. telnet/nc - 포트 연결 확인
4. curl      - HTTP 요청 테스트
5. dig/nslookup - DNS 확인
```

### ping (ICMP 연결)

```bash
# 기본 사용
ping google.com

# 횟수 제한
ping -c 4 google.com

# 패킷 크기 지정
ping -s 1000 google.com
```

### netstat / ss (소켓 상태)

```bash
# 열린 포트 확인 (netstat - 구버전)
netstat -tlnp
# t: TCP
# l: LISTEN 상태
# n: 숫자로 표시
# p: 프로세스 정보

# ss (신버전, 더 빠름)
ss -tlnp

# 모든 연결 상태
ss -ant

# 특정 포트 확인
ss -tlnp | grep :80

# ESTABLISHED 연결 수
ss -ant | grep ESTAB | wc -l
```

### curl (HTTP 테스트)

```bash
# 기본 요청
curl http://example.com

# 헤더만 확인
curl -I http://example.com

# 상세 정보
curl -v http://example.com

# POST 요청
curl -X POST -H "Content-Type: application/json" \
     -d '{"key":"value"}' http://api.example.com

# 응답 시간 측정
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://example.com

# SSL 인증서 무시
curl -k https://self-signed.example.com
```

### tcpdump (패킷 캡처)

```bash
# 특정 인터페이스
tcpdump -i eth0

# 특정 호스트
tcpdump host 192.168.1.1

# 특정 포트
tcpdump port 80

# 파일로 저장
tcpdump -w capture.pcap

# 읽기 쉽게 출력
tcpdump -A port 80
```

### DNS 확인

```bash
# nslookup
nslookup google.com

# dig (더 상세)
dig google.com
dig +short google.com
dig @8.8.8.8 google.com  # 특정 DNS 서버 사용
```

</details>

---

## Q4. 시스템 리소스 모니터링 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### CPU 모니터링

```bash
# CPU 정보
cat /proc/cpuinfo
lscpu

# CPU 사용률
top
htop
mpstat 1  # 1초 간격

# Load Average 해석
uptime
# load average: 1.00, 0.80, 0.60
# 1분, 5분, 15분 평균
# CPU 코어 수와 비교 (4코어면 4.0이 100%)
```

### 메모리 모니터링

```bash
# 메모리 사용량
free -h
# total: 전체
# used: 사용 중
# free: 사용 가능
# buff/cache: 캐시 (필요시 해제 가능)
# available: 실제 사용 가능

# 상세 정보
cat /proc/meminfo

# 프로세스별 메모리
ps aux --sort=-%mem | head
```

### 디스크 모니터링

```bash
# 디스크 사용량
df -h

# 디렉토리별 사용량
du -sh /var/log/*
du -sh * | sort -rh | head

# I/O 모니터링
iostat -x 1
iotop  # 프로세스별 I/O

# inode 사용량
df -i
```

### 네트워크 모니터링

```bash
# 네트워크 통계
netstat -s
ss -s

# 인터페이스 트래픽
ifconfig
ip -s link

# 실시간 트래픽
iftop
nload
```

### 종합 모니터링

```bash
# vmstat (CPU, 메모리, I/O)
vmstat 1
# procs: r(실행대기), b(블록)
# memory: swpd, free, buff, cache
# swap: si(swap in), so(swap out)
# io: bi(block in), bo(block out)
# cpu: us, sy, id, wa

# sar (히스토리)
sar -u 1 5   # CPU (1초 간격, 5회)
sar -r 1 5   # 메모리
sar -b 1 5   # I/O
```

</details>

---

## Q5. 로그 파일 분석 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### 주요 로그 파일 위치

```bash
/var/log/
├── messages      # 시스템 메시지 (CentOS)
├── syslog        # 시스템 메시지 (Ubuntu)
├── auth.log      # 인증 로그
├── secure        # 보안 로그 (CentOS)
├── dmesg         # 커널 부팅 메시지
├── cron          # Cron 작업 로그
├── nginx/        # Nginx 로그
│   ├── access.log
│   └── error.log
└── journal/      # systemd 저널
```

### 로그 읽기 명령어

```bash
# 실시간 모니터링
tail -f /var/log/syslog
tail -f /var/log/nginx/access.log

# 여러 파일 동시에
tail -f /var/log/nginx/*.log

# 마지막 N줄
tail -n 100 /var/log/syslog

# 처음 N줄
head -n 100 /var/log/syslog

# 특정 문자열 검색
grep "error" /var/log/syslog
grep -i "error" /var/log/syslog  # 대소문자 무시
grep -r "error" /var/log/        # 재귀 검색

# 시간 범위 필터링
sed -n '/Jan 15 10:00/,/Jan 15 11:00/p' /var/log/syslog
```

### journalctl (systemd)

```bash
# 전체 로그
journalctl

# 부팅 이후
journalctl -b

# 특정 서비스
journalctl -u nginx
journalctl -u nginx -f  # 실시간

# 시간 범위
journalctl --since "2024-01-15 10:00" --until "2024-01-15 11:00"
journalctl --since "1 hour ago"

# 에러만
journalctl -p err

# JSON 출력
journalctl -o json-pretty
```

### 로그 분석 예시

```bash
# Nginx 접속 TOP 10 IP
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head

# HTTP 상태 코드 분포
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# 분당 요청 수
awk '{print $4}' access.log | cut -d: -f1,2,3 | uniq -c

# 특정 시간대 에러 로그
grep "$(date +%Y/%m/%d)" error.log | grep -i error

# 응답 시간이 긴 요청 (마지막 필드가 응답시간인 경우)
awk '$NF > 1.0' access.log
```

</details>

---

## Q6. SSH 키 기반 인증 설정 방법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### SSH 키 생성

```bash
# RSA 키 생성 (기본)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Ed25519 키 생성 (권장)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 파일 위치
~/.ssh/
├── id_rsa          # 개인키 (절대 공유 금지!)
├── id_rsa.pub      # 공개키 (서버에 등록)
├── known_hosts     # 접속했던 서버 목록
├── authorized_keys # 접속 허용된 공개키 (서버)
└── config          # SSH 설정
```

### 공개키 서버 등록

```bash
# 방법 1: ssh-copy-id (권장)
ssh-copy-id user@server

# 방법 2: 수동 복사
cat ~/.ssh/id_rsa.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 방법 3: 직접 편집
# 서버에서
vi ~/.ssh/authorized_keys
# 공개키 내용 붙여넣기
```

### 권한 설정 (중요!)

```bash
# 클라이언트
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# 서버
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### SSH Config 설정

```bash
# ~/.ssh/config
Host production
    HostName 192.168.1.100
    User deploy
    Port 2222
    IdentityFile ~/.ssh/prod_key

Host staging
    HostName 192.168.1.101
    User deploy
    IdentityFile ~/.ssh/staging_key

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3

# 사용
ssh production  # ssh deploy@192.168.1.100 -p 2222
```

### SSH 보안 설정 (서버)

```bash
# /etc/ssh/sshd_config

# 비밀번호 인증 비활성화
PasswordAuthentication no

# 루트 로그인 금지
PermitRootLogin no

# 특정 사용자만 허용
AllowUsers deploy admin

# 포트 변경
Port 2222

# 설정 적용
systemctl restart sshd
```

</details>

---

## Q7. iptables / firewalld 기본 사용법은? ⭐⭐

<details>
<summary>답변 보기</summary>

### 핵심 답변

### iptables (전통적 방식)

```bash
# 규칙 확인
iptables -L -n -v

# 체인 구조
INPUT   → 들어오는 패킷
OUTPUT  → 나가는 패킷
FORWARD → 포워딩 패킷

# 특정 포트 허용
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 특정 IP 허용
iptables -A INPUT -s 192.168.1.100 -j ACCEPT

# 특정 IP 차단
iptables -A INPUT -s 10.0.0.5 -j DROP

# 기본 정책 (주의!)
iptables -P INPUT DROP     # 기본 차단
iptables -P OUTPUT ACCEPT  # 기본 허용

# 규칙 삭제
iptables -D INPUT 1  # 첫 번째 규칙

# 전체 초기화
iptables -F

# 저장 (CentOS)
service iptables save
```

### firewalld (CentOS 7+, RHEL)

```bash
# 상태 확인
firewall-cmd --state
firewall-cmd --list-all

# 서비스 허용
firewall-cmd --add-service=http --permanent
firewall-cmd --add-service=https --permanent

# 포트 허용
firewall-cmd --add-port=8080/tcp --permanent

# 특정 IP 허용
firewall-cmd --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" accept' --permanent

# 변경사항 적용
firewall-cmd --reload

# Zone 확인
firewall-cmd --get-zones
firewall-cmd --get-default-zone

# Zone별 설정
firewall-cmd --zone=public --list-all
```

### UFW (Ubuntu)

```bash
# 상태 확인
ufw status verbose

# 활성화/비활성화
ufw enable
ufw disable

# 포트 허용
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow ssh

# IP 기반 규칙
ufw allow from 192.168.1.0/24
ufw deny from 10.0.0.5

# 규칙 삭제
ufw delete allow 80/tcp
```

### 실무 기본 설정

```bash
# 기본 정책
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# localhost 허용
iptables -A INPUT -i lo -j ACCEPT

# 기존 연결 허용
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH 허용 (포트 변경 시 해당 포트)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 웹 서버 허용
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

</details>

---

## 학습 체크리스트

- [ ] Linux 파일 권한 (chmod) 이해
- [ ] 프로세스 관리 명령어 (ps, top, kill) 사용 가능
- [ ] 네트워크 트러블슈팅 (ping, netstat, curl, tcpdump)
- [ ] 시스템 리소스 모니터링 (free, df, vmstat)
- [ ] 로그 파일 분석 (tail, grep, journalctl)
- [ ] SSH 키 기반 인증 설정 가능
- [ ] 방화벽 기본 설정 (iptables, firewalld, ufw)
