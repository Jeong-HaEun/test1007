# 광고 성과 보고서 (Ad Performance Report)

그로스 마케팅 포트폴리오용 웹페이지. 매체별 광고 성과 데이터를 입력하고, 지표를 자동 계산해 보여준다.

## 사용자
- 개발 초보자. 설명은 **단계별로, 쉬운 한국어로**. 용어가 처음 나오면 한 줄로 풀어서 설명한다.
- 한 번에 너무 많은 파일을 만들지 말고, 단계마다 "무엇을 / 왜 / 어떻게 확인하는지"를 알려준다.
- 사용자가 직접 해야 하는 작업(회원가입, 설치, 배포 설정 클릭 등)은 번호 매긴 순서로 안내한다.
- ⚠️ **작업을 실행하기 전에 반드시 사용자 확인을 받는다.** 파일 생성·수정, DB 변경(계정·DB·테이블 생성 등), 커밋 모두 해당.
  - "무엇을 / 왜 할지"를 먼저 설명하고, 사용자가 "응/좋아" 등으로 승인한 뒤에 진행한다.

## 기술 스택
| 영역 | 기술 | 배포 |
|---|---|---|
| 프론트엔드 | React (Vite) | Vercel |
| 백엔드 | Spring Boot 4 (Java 21, Gradle) | Render Web Service |
| DB | MySQL 8 | **Aiven 무료 MySQL** (Render 무료 플랜은 MySQL을 제공하지 않음) |

- **Docker는 쓰지 않는다.**
- 로컬 개발: 컴퓨터에 설치된 **MySQL 8.3** (Windows 서비스 `MySQL83`), DB 이름 `ad_report`
  - 예: `jdbc:mysql://localhost:3306/ad_report`
- 배포(Render): **Aiven** MySQL (`defaultdb`)
- 코드는 같고, 환경변수 값만 바꿔서 DB를 전환한다.
- Aiven은 SSL 접속이 필수 → JDBC URL 끝에 `?sslMode=REQUIRED` 를 붙인다.
  - 예: `jdbc:mysql://<호스트>:<포트>/defaultdb?sslMode=REQUIRED`

## 폴더 구조
```
test1007/
├── frontend/   # React 앱
├── backend/    # Spring Boot API
├── CLAUDE.md
└── .gitignore
```

## 데이터 모델: `campaign_report` (테이블 1개만)
계층 구조: 캠페인 → 광고그룹 → 소재

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK, auto increment | |
| report_date | DATE | 날짜 |
| media | VARCHAR(20) | 매체: `NAVER` / `META` / `GOOGLE` |
| campaign_name | VARCHAR(100) | 캠페인명 |
| ad_group_name | VARCHAR(100) | 광고그룹명 |
| creative_name | VARCHAR(100) | 소재명 |
| cost | BIGINT | 광고비 (원) |
| impressions | BIGINT | 노출수 |
| clicks | BIGINT | 클릭수 |
| carts | BIGINT | 장바구니수 |
| conversions | BIGINT | 전환수 |
| revenue | BIGINT | 매출 (원) |

- 숫자 컬럼은 모두 0 이상. 음수 입력은 백엔드에서 검증해 거부한다.

## 계산 지표 — ⚠️ DB에 저장하지 않는다
원본 숫자만 저장하고, 지표는 화면에 보여줄 때 계산한다. (수정 시 값이 어긋나는 것을 방지)

| 지표 | 공식 | 표시 형식 |
|---|---|---|
| CTR | 클릭 ÷ 노출 | `2.35%` |
| CPC | 광고비 ÷ 클릭 | `1,234원` |
| CPB | 광고비 ÷ 장바구니수 | `1,234원` |
| CPA | 광고비 ÷ 전환 | `1,234원` |
| ROAS | 매출 ÷ 광고비 | `350%` |

- **분모가 0이면 `-` 를 표시한다.** (0으로 나누기 금지, `NaN`/`Infinity` 노출 금지)
- 계산 로직은 프론트엔드의 한 파일(예: `frontend/src/utils/metrics.js`)에 모아 둔다.

## 기능 (최소 버전)
1. 성과 데이터 목록 (표) — 원본 값 + 계산 지표
2. 데이터 추가 / 수정 / 삭제
3. 상단 합계 카드: 총 광고비 / 총 매출 / 전체 ROAS / 전체 CPB
   - 전체 지표는 **합계끼리 나눈다** (예: 전체 ROAS = 총 매출 ÷ 총 광고비). 행별 ROAS의 평균이 아님.

### 나중에 (시간 남으면)
- 매체별 필터, 날짜 범위 필터
- 매체별 ROAS 막대 차트
- 소재별 CPB 비교

## API 규칙
- 경로: `/api/reports`
  - `GET /api/reports` 목록
  - `POST /api/reports` 추가
  - `PUT /api/reports/{id}` 수정
  - `DELETE /api/reports/{id}` 삭제
- JSON 필드명은 camelCase (`reportDate`, `adGroupName` …)
- CORS: 로컬 `http://localhost:5173` 과 Vercel 배포 주소만 허용

## 비밀값 / 환경변수
- DB 비밀번호, 접속 주소 등은 **절대 코드에 직접 쓰지 않는다.** 환경변수로 받는다.
  - 백엔드: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`
  - 프론트엔드: `VITE_API_BASE_URL`
- `.env` 파일은 git에 올리지 않는다. 대신 값이 비어 있는 `.env.example` 을 올린다.

## 로컬 실행 (작성 예정)
- 프론트: `cd frontend && npm install && npm run dev` → http://localhost:5173
- 백엔드: `cd backend && ./gradlew bootRun` → http://localhost:8080
  - 실행 전 `SPRING_DATASOURCE_*` 환경변수에 로컬 MySQL 접속 정보를 넣어야 한다.
