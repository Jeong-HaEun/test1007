# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 광고 성과 보고서 (Ad Performance Report)
그로스 마케팅 포트폴리오용 웹페이지. 매체별 광고 성과 원본 데이터를 입력하고, 지표(CTR·ROAS 등)를 화면에서 계산해 보여준다.

## 사용자와 일하는 규칙
- 개발 초보자. **단계별로, 쉬운 한국어로** 설명하고, 새 용어는 한 줄로 풀어 쓴다.
- ⚠️ **모든 답변과 작업 중 안내 문장은 한국어로만 쓴다.** (영어로 답하지 않는다)
- 단계마다 "무엇을 / 왜 / 어떻게 확인하는지"를 알려준다. 한 번에 파일을 많이 만들지 않는다.
- 사용자가 직접 할 일(가입, 클릭 등)은 번호 매긴 순서로 안내한다.
- ⚠️ **실행 전에 반드시 확인받는다.** 파일 생성·수정, DB 변경, 커밋 모두. 계획을 먼저 설명하고 승인 후 진행.
- **추천할 때는 반드시 이유를 함께 말한다.**

## 기술 스택 / 환경
| 영역 | 기술 | 배포 |
|---|---|---|
| frontend/ | React 19 + Vite (JavaScript), oxlint | Vercel |
| backend/ | Spring Boot 4, Java 21, Gradle, Spring Data JPA | Render |
| DB | MySQL 8 | 로컬: 설치된 MySQL 8.3 / 배포: Aiven 무료 MySQL |

- Docker 안 씀. 코드는 같고 **환경변수 값만 바꿔 DB를 전환**한다.
- 로컬 DB: `localhost:3306/ad_report`, 앱 계정 `test1007` (권한: `ad_report` 만).
- Aiven은 SSL 필수: `jdbc:mysql://<host>:<port>/defaultdb?sslMode=REQUIRED`

## 명령어
```bash
# 백엔드 (backend/ 에서. 로컬 MySQL 이 켜져 있어야 함)
./gradlew bootRun                     # http://localhost:8080
./gradlew test                        # 전체 테스트 (DB 접속 필요)
./gradlew test --tests com.adreport.BackendApplicationTests   # 테스트 하나

# 프론트엔드 (frontend/ 에서)
npm run dev                           # http://localhost:5173
npm run build
npm run lint                          # oxlint
npm test                              # node --test (설치 없이 Node 내장 테스트, *.test.js)
node --test src/utils/metrics.test.js # 파일 하나만
```

## 비밀값 / 환경변수
- 코드에 접속 정보·비밀번호를 쓰지 않는다. `.env` 는 git 제외, `.env.example` 만 커밋.
- 백엔드: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`
  - 로컬은 `backend/.env` 를 `spring.config.import=optional:file:.env[.properties]` 로 읽는다 (작업 디렉터리가 `backend/` 일 때).
  - `backend/.env` 의 `MYSQL_ROOT_PASSWORD` 는 사람 참고용(관리자 비밀번호). 앱은 쓰지 않는다.
- 프론트엔드: `VITE_API_BASE_URL`

## 데이터 모델: `campaign_report` (테이블 1개)
계층: 캠페인 → 광고그룹 → 소재. 컬럼 순서:
`id, report_date, media, campaign_name, ad_group_name, creative_name, cost, impressions, clicks, carts, conversions, revenue`
- `media`: `NAVER` / `META` / `GOOGLE` (DB는 VARCHAR(20), Java는 enum)
- 이름 컬럼 VARCHAR(100) 필수, 숫자 컬럼 BIGINT 0 이상 (음수는 400으로 거부)

### ⚠️ 테이블 구조를 바꿀 때
- 테이블은 `backend/src/main/resources/schema.sql` 이 만든다 (`CREATE TABLE IF NOT EXISTS`, 시작 시 실행).
- JPA는 `ddl-auto=validate` — **엔티티와 테이블이 다르면 서버가 시작되지 않는다.**
- 그래서 컬럼을 바꾸면 `schema.sql` + `CampaignReport.java` 를 **함께** 고치고, 기존 테이블은 직접 ALTER/DROP 해야 한다 (`IF NOT EXISTS` 라 자동 반영 안 됨). DB 변경이므로 사용자 확인 필수.

## 계산 지표 — DB에 저장하지 않는다
| 지표 | 공식 | 표시 |
|---|---|---|
| CTR | 클릭 ÷ 노출 | `2.35%` |
| CPC | 광고비 ÷ 클릭 | `1,234원` |
| CPB | 광고비 ÷ 장바구니수 | `1,234원` |
| CPA | 광고비 ÷ 전환 | `1,234원` |
| ROAS | 매출 ÷ 광고비 | `350%` |

- **분모가 0이면 `-`** (`NaN`/`Infinity` 노출 금지).
- 계산은 `frontend/src/utils/metrics.js` 한 곳에 모은다.
- 합계 지표는 **합계끼리 나눈다** (전체 ROAS = 총 매출 ÷ 총 광고비. 행별 평균 아님). 일별·월별도 같은 규칙.
- 일자별 추이: 데이터의 **최근 날짜 + 이전 13일 (14일)**. 데이터 없는 날은 0이 아니라 빈칸(선 끊김).
- 월 누적: 월별 합계, 최신 월 먼저.
- 필터 범위: **매체 필터 = 화면 전체**, **기간 필터 = 상단(합계 카드·성과 표)만**. "최근 N일"은 오늘이 아니라 데이터의 최근 날짜 기준.

## API: `/api/reports`
| 메서드 | 경로 | 성공 | 실패 |
|---|---|---|---|
| GET | `/api/reports` | 200, 최신 날짜순 | |
| POST | `/api/reports` | 201 + 저장된 행 | 400 검증 실패, 409 중복 |
| POST | `/api/reports/bulk` | 200 + `{created, updated}` | 400 (한 줄이라도 틀리면 전부 저장 안 함) |
| PUT | `/api/reports/{id}` | 200 + 수정된 행 | 400, 404, 409 중복 |
| DELETE | `/api/reports/{id}` | 204 | 404 |

- JSON 필드는 camelCase (`reportDate`, `adGroupName` …), 날짜는 `"2026-10-01"`.
- CORS: `CORS_ALLOWED_ORIGINS`(쉼표 구분)만 허용, 기본값 `http://localhost:5173`.
- **중복 기준: 날짜 + 매체 + 캠페인 + 광고그룹 + 소재.** `/bulk`(CSV)는 덮어쓰고(매일 누적 업로드용), 한 줄 추가·수정(POST/PUT)은 409로 거부한다. DB 유니크 제약은 없고 컨트롤러 `findSameKey()` 로 검사.
- 샘플 데이터: `sample-data/sample_reports_14days.csv` (3개 매체 × 14일, 98줄). 화면의 CSV 업로드로 넣는다 (배포 DB에도 동일).

## CSV 업로드 (`frontend/src/utils/csv.js`)
- 제목 줄(한글, 순서 고정): `날짜,매체,캠페인,광고그룹,소재,광고비,노출,클릭,장바구니,전환,매출`
- 한글 깨짐 방지: UTF-8 로 읽고 실패하면 CP949(엑셀 기본)로 다시 읽는다. 양식 다운로드는 BOM 포함.
- 받아주는 값: `100,000`, `1,000원`, `2026/10/1`, `네이버/메타/구글`. 오류는 엑셀 줄 번호로 알려준다.
- BOM 은 `U+FEFF` 문자를 코드에 직접 쓰지 말고 `BOM` 상수(`String.fromCharCode(0xfeff)`)를 쓴다.

## 구현 패턴
### 백엔드 (`com.adreport`)
- **기능별 패키지**: `report/` (엔티티·리포지토리·컨트롤러), `config/` (설정).
- **Controller → Repository 직접 호출.** 서비스 계층·DTO 없음 — 엔티티를 요청/응답 JSON으로 그대로 쓴다.
- 검증: 엔티티 필드의 `@NotNull`, `@NotBlank`, `@PositiveOrZero` + 컨트롤러 `@Valid`.
- 없는 id: `ResponseStatusException(HttpStatus.NOT_FOUND)`.
- 의존성 주입은 생성자 주입. Lombok 없음 (getter/setter 직접 작성).
- 설정값은 `application.properties` 에 `${ENV_VAR}` 로 연결, 앱 전용 값은 `app.*` 접두사.

### 프론트엔드 (`frontend/src`)
- 구조: `App.jsx`(데이터·필터 상태 보유) → `components/*.jsx`(props 로 받아 그리기만) / `utils/`(순수 함수 + `*.test.js`) / `api/reports.js`.
- 컴포넌트: 함수형, `.jsx`, 파일명 PascalCase, `export default`. 계산은 컴포넌트에 쓰지 않고 `utils/metrics.js` 호출.
- 상태 관리: React `useState` 만. 목록은 `App` 이 한 번 받고, 필터는 화면에서 처리 (서버 재요청 없음).
- API 호출: `api/reports.js` 에만. `request()` 가 실패 시 `Error` 를 던지고, 화면은 `.catch` 로 메시지 표시.
- 라이브러리: PapaParse(CSV), Recharts(선 그래프). 그래프는 지표 1개당 1개 (이중 축 금지).
- 코드 스타일: 들여쓰기 2칸, 작은따옴표, 세미콜론 없음.

### 디자인 (`style.md`)
- 크리스탈 글래스 + 토마토. 색·글꼴 변수는 `index.css` `:root` 에만, 부분별 모양은 `App.css`. 유리 패널은 `.glass` 클래스.
- 글꼴 Pretendard (CDN, `index.html`). 라이트 모드만. 계산 지표 칸은 `.metric`(토마토), 숫자 칸은 `.num`(오른쪽 정렬).
- SVG(그래프)에는 CSS 변수를 못 써서 `DailyTrend.jsx` 의 `COLORS` 에 같은 값을 둔다 → 색 바꿀 때 두 곳 모두.

### 네이밍
| 위치 | 규칙 | 예 |
|---|---|---|
| DB 테이블·컬럼 | snake_case | `ad_group_name` |
| JSON / Java 필드 / JS 변수 | camelCase | `adGroupName` |
| Java 클래스, React 컴포넌트 | PascalCase | `CampaignReportController`, `App.jsx` |
| 매체 값 | 대문자 | `NAVER` |

## 나중에 (시간 남으면)
매체별 ROAS 막대 차트, 소재별 CPB 비교

## 배포 단계 체크리스트
- 사용자가 "배포 단계"를 시작하자고 하면, 먼저 `README.md` 를 **UTF-8로 새로 작성**한다 (현재 UTF-16). 포트폴리오용: 소개, 배포 주소, 화면 캡처, 기술 스택.
