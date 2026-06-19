# 청년 정책 메인 화면 명세

## 목적

사용자가 자신에게 필요한 청년 정책을 빠르게 발견하고 신청까지 이어질 수 있도록 구성한 메인 화면이다.
마감 임박 배너, 검색·빠른 탐색, 맞춤 추천의 세 영역으로 구성한다.

참고 디자인: `local/design/policy-main.png`

---

## 데이터 아키텍처 (A안)

| 화면                         | 데이터 출처                 |
| ---------------------------- | --------------------------- |
| 메인 화면 (배너, 목록, 추천) | 우리 DB (`policies` 테이블) |
| 상세 화면                    | 온통청년 API 실시간 조회    |

- 온통청년 API는 cron 동기화에서만 호출한다. 메인 화면은 DB만 조회한다.
- 온통청년 API 키는 BFF 환경변수로만 관리한다. 클라이언트 노출 금지.

### Policy 테이블 (신규)

목록/메인 화면에 필요한 필드만 저장한다. 상세 전용 필드는 저장하지 않는다.

| 테이블 컬럼     | API 필드           | 타입      | 설명                                        |
| --------------- | ------------------ | --------- | ------------------------------------------- |
| id              | `plcyNo`           | String    | 정책 고유번호 (PK)                          |
| name            | `plcyNm`           | String    | 정책명                                      |
| description     | `plcyExplnCn`      | String?   | 한 줄 설명 (카드용)                         |
| keywords        | `plcyKywdNm`       | String?   | 키워드 (보조금, 바우처 등) 카드 태그 표시   |
| largeCategory   | `lclsfNm`          | String?   | 대분류 (일자리 / 금융 / 주거 등)            |
| mediumCategory  | `mclsfNm`          | String?   | 중분류 (취업, 창업 등)                      |
| ageMin          | `sprtTrgtMinAge`   | Int?      | 지원 최소 나이                              |
| ageMax          | `sprtTrgtMaxAge`   | Int?      | 지원 최대 나이                              |
| hasAgeLimit     | `sprtTrgtAgeLmtYn` | Boolean   | Y면 나이 무관 → 전체 사용자 노출            |
| applyStartDate  | `bizPrdBgngYmd`    | DateTime? | 사업 시작일                                 |
| applyEndDate    | `bizPrdEndYmd`     | DateTime? | 사업 종료일 (daysLeft 계산 기준)            |
| applyPeriodType | `aplyPrdSeCd`      | String?   | 신청 기간 구분 (0057001=기간, 0057002=상시) |
| applyPeriodText | `aplyYmd`          | String?   | "20260622 ~ 20261231" 표시용 원문           |
| applicationUrl  | `aplyUrlAddr`      | String?   | 신청 URL (배너 바로가기용)                  |
| zipCd           | `zipCd`            | String?   | 지원 가능 지역 코드 (지역 필터용)           |
| viewCount       | `inqCnt`           | Int       | 조회수 (인기 정책 기준)                     |
| approvalStatus  | `plcyAprvSttsCd`   | String?   | 승인 상태 (비승인 정책 sync 제외용)         |
| syncedAt        | `lastMdfcnDt`      | DateTime  | 마지막 동기화 시각                          |

### 상세 화면 전용 필드 (DB 저장 안 함 — 실시간 API 조회)

| API 필드                                                  | 설명                   |
| --------------------------------------------------------- | ---------------------- |
| `sprvsnInstCdNm` / `operInstCdNm`                         | 주관·운영 기관         |
| `earnCndSeCd` / `earnMinAmt` / `earnMaxAmt` / `earnEtcCn` | 소득 조건              |
| `mrgSttsCd` / `jobCd` / `schoolCd`                        | 혼인·직업·학력 조건    |
| `addAplyQlfcCndCn` / `ptcpPrpTrgtCn`                      | 추가 자격, 제외 대상   |
| `plcySprtCn`                                              | 지원 내용 상세         |
| `sprtSclCnt` / `sprtArvlSeqYn`                            | 지원 인원, 선착순 여부 |
| `plcyAplyMthdCn` / `sbmsnDcmntCn`                         | 신청 방법, 제출 서류   |
| `srngMthdCn`                                              | 선정 방법              |
| `refUrlAddr1` / `refUrlAddr2`                             | 참고 URL               |
| `etcMttrCn`                                               | 기타 사항              |

### PolicyScrap 변경

`policyId`가 `Policy.id`를 참조하는 FK로 변경된다.
중복 저장되던 `policyName`, `supportType`, `applyStartDate`, `applyEndDate`는 제거하고 Policy 테이블에서 JOIN으로 조회한다.

### daysLeft 계산 규칙

BFF에서 `applyEndDate` 기준으로 계산해 내려준다. 클라이언트에서 재계산하지 않는다.

| 조건                | 처리                                      |
| ------------------- | ----------------------------------------- |
| applyEndDate > 오늘 | `ceil((applyEndDate - today) / 86400000)` |
| applyEndDate = 오늘 | `0` (D-Day)                               |
| applyEndDate < 오늘 | 만료 처리, 배너 제외                      |
| applyEndDate = null | 상시모집, 배너 제외                       |

### cron 동기화

- 하루 1~2회 온통청년 API (`pageType=1` 목록)를 호출해 `policies` 테이블에 upsert한다.
- 동기화 실패 시 기존 DB 데이터를 유지한다.

---

## 범위

### screens/policies

- 세 영역(마감 임박 배너 / 검색·빠른 탐색 / 맞춤 추천)을 조립한다.
- 도메인 로직은 직접 구현하지 않고 feature/entity로 위임한다.

### features (이 화면에서 사용)

| feature       | 요구사항                   | 진입점                                |
| ------------- | -------------------------- | ------------------------------------- |
| policy-search | 키워드/필터 기반 정책 탐색 | 검색창, 필터 버튼, 빠른 탐색 카테고리 |
| policy-scrap  | 정책 스크랩/해제           | 추천 카드의 스크랩 버튼               |

### entities/policies 표시 데이터

| 필드                           | 용도                               |
| ------------------------------ | ---------------------------------- |
| id                             | 상세 이동, 스크랩 키               |
| name                           | 배너, 카드 정책명                  |
| description                    | 카드 설명                          |
| largeCategory / mediumCategory | 카드 카테고리 라벨, 빠른 탐색 필터 |
| supportType                    | 카드 지원유형 라벨                 |
| applyStartDate / applyEndDate  | 신청 기간 표시                     |
| daysLeft                       | D-Day 배지, 배너 강조 (BFF 계산)   |
| applicationUrl                 | 배너 바로가기 버튼                 |
| viewCount                      | 인기 정책 태그 기준                |

---

## 화면 구성

### 1. 헤더

- 타이틀: `청년 정책`
- 공통 `Header` 컴포넌트를 사용한다.

### 2. 마감 임박 배너

**조건 A — 스크랩 정책 중 마감 임박 정책이 있는 경우**

- `policy_scraps`와 `policies`를 JOIN해 `applyEndDate >= 오늘` 조건으로 가장 임박한 정책 1건을 조회한다.
- 문구: `{nickname}님이 스크랩한 '{name}', 딱 {daysLeft}일 남았어요! 🏃`
- 배너 좌측 상단에 `D-{daysLeft}` 강조 표시.
- 우측 하단 `바로가기` 버튼 → `applicationUrl` 외부 브라우저로 오픈.

**조건 B — 스크랩 정책 없거나 조건 A 해당 없는 경우**

- `policies` 테이블에서 사용자 나이·거주지 조건에 맞고 `applyEndDate >= 오늘` 인 정책 중 마감 가장 임박한 1건을 조회한다.
- 문구: `놓치면 올해 끝! '{name}' 마감이 {daysLeft}일 남았어요.`
- 동일하게 `바로가기` 버튼 제공.

**조건 C — 표시할 정책이 없는 경우**

- 배너 영역을 표시하지 않는다.

> BFF 엔드포인트: `GET /api/policies/banner` (신규)
> 응답: `{ conditionType: 'scrap' | 'recommended', name, daysLeft, applicationUrl }`

### 3. 검색 및 빠른 탐색

**검색창**

- `shared/ui`의 공통 `SearchBar` 컴포넌트 (버튼 모드)를 사용한다.
- placeholder: `월세, 통장, 대출 등 키워드를 검색해 보세요`
- 탭 시 검색 화면(`/(stack)/policies/search`)으로 이동하며 키보드가 자동으로 포커스된다.
- 메인 화면에는 필터 버튼(카테고리/지역/지원유형/기간)을 두지 않는다. 필터는 검색 화면에서만 노출한다.

**빠른 탐색 카테고리 (가로 스크롤, 8개)**

| 아이콘 | 라벨     | 필터                   |
| ------ | -------- | ---------------------- |
| 🔥     | 마감임박 | `deadlineOnly=true`    |
| 🏠     | 주거     | `largeCategory=주거`   |
| 💰     | 금융     | `largeCategory=금융`   |
| 💼     | 일자리   | `largeCategory=일자리` |
| 🤝     | 복지     | `largeCategory=복지`   |
| 📚     | 교육     | `largeCategory=교육`   |
| 🎭     | 문화     | `largeCategory=문화`   |
| ✋     | 참여     | `largeCategory=참여`   |

- 탭 시 검색 화면으로 이동하며 해당 필터가 적용된 결과가 즉시 표시된다.
- 이때 키보드는 자동 포커스하지 않는다 (사용자가 타이핑 의도 없이 진입한 경우이므로).

### 4. 맞춤 정책 추천

- 섹션 제목: `{nickname}님 맞춤 추천`
- `policies` 테이블에서 사용자 나이·거주지 기준으로 필터링, `applyEndDate` 임박 순 정렬.
- 카드 형태, 가로 스와이프.

카드 표시 항목:

| 항목            | 규칙                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------- |
| 카테고리 라벨   | largeCategory 또는 mediumCategory                                                           |
| 정책명          | 최대 2줄, 말줄임                                                                            |
| 설명            | 최대 2줄, 말줄임                                                                            |
| 신청 기간       | `applyStartDate ~ applyEndDate` 또는 `상시모집`                                             |
| 스크랩 버튼     | ☆ / ★ 토글 (낙관적 업데이트)                                                                |
| 태그            | 🔥 인기 정책 (viewCount 상위) / ⭐ 스크랩 많음 (scrap count 상위) / ⏰ 마감 임박 (7일 이내) |
| 자세히보기 버튼 | 정책 상세 화면 이동                                                                         |

> BFF 엔드포인트: `GET /api/policies/recommended` (신규)

---

## 데이터 상태

### loading

- 배너: Skeleton 카드
- 맞춤 추천: Skeleton 카드 2~3개
- 검색창·빠른 탐색 카테고리는 정적이므로 즉시 표시

### error

- 배너 실패: 배너 미표시 + 토스트 안내
- 맞춤 추천 실패: 섹션 내 재시도 버튼 + 토스트 안내
- 토스트는 프로젝트 공통 토스트 라이브러리 사용

### empty

| 영역          | 빈 상태                                                               |
| ------------- | --------------------------------------------------------------------- |
| 배너 (조건 C) | 배너 영역 미표시                                                      |
| 맞춤 추천     | "아직 맞춤 정책이 없어요. 프로필을 완성해 보세요!" + 프로필 수정 버튼 |

---

## 상호작용

- 배너 `바로가기` → applicationUrl 외부 브라우저 오픈
- 검색창 탭 → 검색 화면 이동
- 빠른 탐색 카테고리 탭 → 해당 카테고리 목록 화면 이동
- 추천 카드 스크랩 버튼 → 스크랩 토글 (낙관적 업데이트)
- 추천 카드 `자세히보기` → 정책 상세 화면 이동

---

## BFF 엔드포인트 정의 (신규)

| Method | Path                        | 설명                                            |
| ------ | --------------------------- | ----------------------------------------------- |
| GET    | `/api/policies/banner`      | 마감임박 배너 1건 (스크랩 우선 → 맞춤 순)       |
| GET    | `/api/policies/recommended` | 맞춤 추천 목록 (나이/거주지 기반, 마감 임박 순) |

기존 `GET /api/policies`는 검색·필터 목록 조회에 활용한다.

---

## 검증 기준

- 배너는 조건 A → B → C 순서로 판단하며 최대 1건만 노출한다.
- 만료된 정책(`applyEndDate < 오늘`)은 배너에 노출되지 않는다.
- daysLeft는 BFF에서 계산해 내려주며 클라이언트에서 재계산하지 않는다.
- 온통청년 API 키가 클라이언트 번들에 포함되지 않는다.
- 메인 화면의 모든 데이터 조회는 우리 DB를 통해 이루어진다.
- Skeleton UI가 로딩 중 표시되며 레이아웃 점프가 없다.
- 에러 시 토스트가 표시되고 화면 전체가 깨지지 않는다.
- `screens → features → entities → shared` 의존 방향을 지킨다.
- API 타입은 `@repo/contract` Zod 스키마를 통해서만 정의한다.
