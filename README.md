# FIT (Freelancer In Talent)

## 🖼 팀 로고
<img width="380" height="275" alt="팀 로고 전체" src="https://github.com/user-attachments/assets/f81e15d2-b588-4aaf-bf77-5a1961ac9795" />

---

## 🎯 프로젝트 기획 의도
재능 있는 프리랜서를 찾고 싶은 개인/기업과  
자신의 역량을 뽐낼 곳을 찾는 프리랜서를 매칭해 주기 위해 기획된 서비스입니다.

---

## ⏱ 프로젝트 기간
2025-09-30 ~ 2025-10-17

---

## 👥 팀 구성

| 이름       | 역할                   |
|-----------|----------------------|
| 주권영    | 프리랜서 시스템 담당   |
| 윤주찬    | 매칭 시스템 담당       |
| 임창기    | 회원(인증/인가) 담당   |
| 노현정    | 리뷰 시스템 담당       |
| 박세웅    | 프로젝트 시스템 담당   |

## 📊 ERD
![ERD](https://velog.velcdn.com/images/yjc1116/post/115eb32a-8800-48cd-a765-6a4398fd1c23/image.png)
[🖇️프로젝트 기획서](https://docs.google.com/document/d/1PD3yM3Cr9iM2A3SR_RuV55shsZZV8VNEI8OYdJPGR-g/edit?tab=t.0)
[🗂️요구사항 명세서](https://docs.google.com/spreadsheets/d/1OK-HBNcrST9EQMIjLO1d9hLz0GUtSQX4-IckdACsfG4/edit?gid=0#gid=0)

---

# 메인 화면
<img width="1722" height="923" alt="image" src="https://github.com/user-attachments/assets/de99b45d-e074-4713-b745-c1e570165b36" />

---

# FIT 회원 기능 정리

## 🛠️기술 스택

### 백엔드

- Java 21, Spring Boot 3.5.6
- Spring Security, JWT
- JPA (MySQL), Redis
- 이메일 발송: Spring Boot Mail
- API 문서: Springdoc OpenAPI

### 프론트엔드

- Next.js, React
- Tailwind CSS

### 기타

- Lombok

## 🗂️백엔드 디렉토리 구조

```jsx
🟦 Controller: API 요청/응답 처리
🟩 DTO: 요청/응답 데이터 구조
✉️ Email Service: 이메일 관련 기능
🟪 Entity: DB 테이블 매핑
🟫 Repository: DB 접근
🟨 Service: 비즈니스 로직

backend/src/main/java/com/back/domain/member
├── auth
│   ├── controller
│   │   └── 🟦 AuthController.java           # 인증 관련 API (아이디 찾기, 비밀번호 재설정, 인증 코드 발송, 토큰 재발급)
│   └── dto
│       ├── 🟩 FindIdReq.java                # 아이디 찾기 요청 DTO
│       ├── 🟩 FindIdRes.java                # 아이디 찾기 응답 DTO
│       ├── 🟩 SendUpdatePasswordCodeReq.java# 비밀번호 재설정용 인증 코드 요청 DTO
│       └── 🟩 UpdatePasswordReq.java        # 비밀번호 변경 요청 DTO
│
├── email
│   └── service
│       └── ✉️ EmailService.java             # 인증 코드 생성, Redis 저장, 이메일 발송
│
└── member
    ├── controller
    │   └── 🟦 MemberController.java        # 회원가입, 조회, 정보 수정, 로그아웃 API
    │
    ├── dto
    │   ├── 🟩 LoginRequest.java             # 로그인 요청 DTO
    │   ├── 🟩 MemberDto.java                # 회원 정보 DTO
    │   ├── 🟩 MemberJoinReq.java            # 회원가입 요청 DTO
    │   ├── 🟩 MemberLoginReq.java           # 로그인 요청 DTO
    │   ├── 🟩 MemberLoginRes.java           # 로그인 응답 DTO
    │   └── 🟩 UpdateMemberReq.java          # 회원 정보 수정 요청 DTO
    │
    ├── entity
    │   ├── 🟪 Member.java                    # 회원 엔티티
    │   └── 🟪 Role.java                      # 회원 권한 Enum
    │
    ├── repository
    │   └── 🟫 MemberRepository.java          # 회원 DB 접근
    │
    └── service
        ├── 🟨 AuthTokenService.java          # JWT 생성/검증
        ├── 🟨 JwtBlacklistService.java       # 로그아웃 시 AccessToken 블랙리스트
        ├── 🟨 MemberRoleService.java         # 권한 관련 로직
        └── 🟨 MemberService.java             # 회원 조회, 비밀번호 변경, 토큰 검증 등 핵심 로직
        

```

## 🗂️프론트 디렉토리 구조

```jsx
🟦: 상태 관리/Context  
🟩: 회원 관련 페이지(UI)
src  
├── app  
│   ├── context  
│   │   └── UserContext.tsx ― 🟦 상태 관리/Context  
│   └── members  
│       ├── findid  
│       │   └── page.tsx ― 🟩 아이디 찾기 페이지  
│       ├── login  
│       │   └── page.tsx ― 🟩 로그인 페이지  
│       ├── mypage  
│       │   └── page.tsx ― 🟩 마이페이지  
│       ├── signup  
│       │   └── page.tsx ― 🟩 회원가입 페이지  
│       └── updatePassword  
│           └── page.tsx ― 🟩 비밀번호 변경 페이지  

```

## 주요 기능

### 1. 회원가입 & 로그인

- 이메일, 아이디, 비밀번호, 닉네임 입력
- 비밀번호는 **해시 처리 후 DB 저장**
- 로그인 시 **AccessToken**과 **RefreshToken** 발급
  - **AccessToken**: 짧은 만료시간 (예: 1시간), 인증 필터에서 검증
  - **RefreshToken**: DB에 만료시간과 함께 저장, AccessToken 재발급 시 갱신
- 로그아웃 시 AccessToken을 **Redis 블랙리스트**에 등록하여 재사용 방지

### 회원 등급(Role) 정책

- **GENERAL (일반회원)**
  - 회원가입 시 자동 부여
  - 활동 유도를 위해 기본 권한 제공
    - 프로젝트 등록 가능
    - 포트폴리오 등록 가능
- **PROJECT MANAGER (PM)**
  - 프로젝트를 하나 이상 등록한 경우 자동 부여
- **FREELANCER (프리랜서)**
  - 포트폴리오를 하나 이상 등록한 경우 자동 부여
- **PM + FREELANCER**
  - 프로젝트와 포트폴리오가 모두 있는 경우 자동 부여
- **재부여 규칙**
  - 프로젝트와 포트폴리오가 모두 없는 경우 **GENERAL**로 자동 변경
---

## 2. 아이디 찾기 / 비밀번호 재설정

### 아이디 찾기

- 사용자가 이메일 입력
- 랜덤 인증 코드 생성 후 Redis에 저장 (5분 만료)
- JavaMailSender를 사용해 인증 코드 이메일 발송
- 사용자가 인증 코드 입력 → 검증
- 인증 성공 시 해당 이메일에 연결된 **아이디 반환**

### 비밀번호 재설정

- 사용자가 아이디 + 이메일 입력
- 랜덤 인증 코드 생성 후 Redis에 저장 (5분 만료)
- JavaMailSender를 사용해 인증 코드 이메일 발송
- 사용자가 인증 코드 입력 → 검증
- 인증 성공 시 새로운 비밀번호 입력 → DB 업데이트
- 인증/변경 완료 후 사용자에게 성공 메시지 반환
---

## 3. 마이페이지

- 사용자 정보 표시: **아이디, 닉네임, 이메일**
- 일반회원(GENERAL)인 경우:
  - "내 프로젝트 보기" 버튼 → 프로젝트 생성 페이지로 이동
  - "포트폴리오 보기" 버튼 → 포트폴리오 생성 페이지로 이동
- 프로젝트 매니저(PM) 권한 보유 시:
  - 프로젝트 버튼 클릭 → 프로젝트 관리 페이지로 이동
- 프리랜서(FREELANCER) 권한 보유 시:
  - 포트폴리오 버튼 클릭 → 포트폴리오 관리 마이페이지로 이동
- PM + FREELANCER 모두 보유 시:
  - 각각의 버튼 클릭 시 해당 권한에 맞는 페이지로 매핑
---


# FIT 매칭 시스템 기능 정리

## 🛠️ 기술 스택

**Backend:** Java 17+, Spring Boot, Spring Security, JWT, JPA (MySQL)  
**Frontend:** Next.js 13+, React 18, TypeScript, Tailwind CSS

---

## 🗂️ 시스템 구조

### 백엔드
```
domain/matching
├── matchScore         # 매칭 점수 계산
├── projectSubmission  # 프리랜서 지원
├── proposal           # PM 제안
└── message            # 메시징
```

### 프론트엔드
```
app
├── matching           # 매칭 대시보드
├── submissions        # 지원 관리
├── proposals          # 제안 관리
└── messages           # 메시징
```

---

## 주요 기능

### 1️⃣ 매칭 점수 알고리즘 (100점 만점)

```
총점 = 스킬(50) + 경력(30) + 단가(20)
```

#### 스킬 점수 (50점)

| 숙련도 | 가중치 |
|--------|--------|
| ADVANCED | 1.0 |
| INTERMEDIATE | 0.7 |
| BEGINNER | 0.4 |

```
매칭률 = (Σ 숙련도 가중치) / 요구 기술 수
점수 = 매칭률 × 50
```

**예시:** React(1.0) + Spring(0.7) + MySQL(0.4) = 2.1 / 3 = 35점

#### 경력 점수 (30점)

- **경력 연수**(15점): (연수 / 10) × 15
- **완료 프로젝트**(8점): (개수 / 10) × 8
- **평점**(7점): (평점 / 5) × 7

#### 단가 점수 (20점)

| 조건 | 점수 |
|------|------|
| 범위 내 | 20점 |
| 최대 초과 | 15점 |
| 최소×0.8 이상 | 10점 |
| 최소×0.6 이상 | 5점 |
| 미만 | 0점 |

---

### 2️⃣ 양방향 제안 시스템

#### 프리랜서 지원
```
지원서 작성 → PENDING → PM 검토 → ACCEPTED/REJECTED
```

#### PM 제안
```
제안 전송 → PENDING → 프리랜서 검토 → ACCEPTED/REJECTED/CANCELLED
```

---

## 사용 흐름

### PM 흐름
```
프로젝트 등록 → 매칭 결과 조회 → 제안/지원 받기 → 메시지 → 계약
```

### 프리랜서 흐름
```
프로필 등록 → 매칭 조회 → 지원/제안 받기 → 메시지 → 프로젝트 수행
```

---

## 매칭 점수 계산 프로세스

```
[요청] 매칭 점수 조회
    ↓
[확인] DB에 기존 점수 존재?
    ├─ 있음 → 반환
    └─ 없음 → 자동 계산
        ↓
1. 프로젝트 요구사항 조회
2. 프리랜서 목록 조회
3. 각 프리랜서별 점수 계산
   - 스킬 점수 (50)
   - 경력 점수 (30)
   - 단가 점수 (20)
4. TOP 10 선정 (총점 순)
5. DB 저장
    ↓
[완료] 결과 반환
```

---

## 데이터베이스 설계

```
Member ─ Freelancer ─ FreelancerTech ─ Tech
   │         │
   │         └─ MatchScore
   │
Project ─ MatchScore
   │
   ├─ Submission
   ├─ Proposal ─ Message
```

**핵심 테이블:**
- `match_score`: 총점, 스킬, 경력, 단가 점수, 순위
- `project_submission`: PENDING → ACCEPTED/REJECTED
- `proposal`: PENDING → ACCEPTED/REJECTED/CANCELLED

---

## 주요 문제 해결

### 🐛 Infinite Loading
- **원인:** API 응답 구조 불일치
- **해결:** UserContext의 roles 배열로 통일

### 🐛 TechLevel.EXPERT Enum 오류
- **원인:** 3단계 Enum에 EXPERT(4단계) 데이터 존재
- **해결:** EXPERT → ADVANCED 변경, 가중치 3단계로 통일

### 💡 역할 다중 보유 UX 개선
- **해결:** 역할 선택 모달 + sessionStorage 저장

---


