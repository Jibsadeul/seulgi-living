# 청년 정책 상세 화면 명세

## 목적

정책 카드/검색결과/스크랩 목록에서 진입해 정책의 전체 정보(지원자격/지원내용/신청방법)를 탭으로 확인하고, 스크랩 토글 및 신청 페이지 이동을 할 수 있는 화면이다.

---

## 진입 경로

- `PolicyCard`, `PolicySearchResultCard`, `PolicyScrapCard` 등에서 정책 id(`plcyNo`)로 진입
- 라우트: `(stack)/policies/[id].tsx` (이미 연결됨, 탭바 없음)

---

## 데이터 흐름

### 핵심 결정: 상세 데이터는 DB가 아니라 온통청년 API를 매 요청마다 실시간 호출

- `Policy` 테이블은 목록/배치 동기화(요약 필드)용으로만 유지하고, 상세 화면은 조회하지 않는다.
- `fetchYouthPolicies()`가 `plcyNo` 쿼리 파라미터로 단건 필터링됨을 실제 호출로 확인했다.
- 신규: `fetchYouthPolicyDetail(plcyNo)` — `youth-policy.client.ts`에 추가, 기존 호출 로직을 재사용해 `plcyNo` 단건 조회 + `pageSize: 1`
- 신규 raw 타입: `YouthPolicyDetailRaw` (목록 동기화용 `YouthPolicyRaw`보다 필드가 많다 — 아래 매핑 표 참고)
- `isScrapped`/스크랩 카운트만 DB(`PolicyScrap`)에서 조회해 합성한다. 지역명(`zipCd` → 시군구명)도 기존 패턴대로 DB `Sigungu` 조회로 보강한다 (정책 콘텐츠 자체가 아니므로 실시간 원칙과 무관).

### BFF 캐시 정책

- 서버(Next.js) `fetch()` 캐시: `next: { revalidate: 1800 }` (30분)
  - 정책 콘텐츠(설명/지원내용/신청방법/제출서류)는 30분 안에 거의 바뀌지 않으며, 외부 API 호출 횟수를 사용자 수와 무관하게 "정책당 30분에 1회"로 줄이기 위함
  - 캐시는 BFF 서버에 공유되며(여러 사용자가 같은 정책을 보면 캐시 재사용), 모바일 앱의 TanStack Query 캐시(기기/세션별)와는 독립된 별도 레이어다
  - `isScrapped`는 이 캐시 대상이 아니다 — 매 요청마다 DB에서 실시간 조회해 합성하므로 사용자별 스크랩 상태는 항상 최신이다
  - 캐시 메모리 영향은 미미함 (정책 1건당 텍스트 응답 2~5KB, 활성 정책 수천 건 기준 총 수십 MB 이하로 추정)

### BFF 엔드포인트 (신규): `GET /api/policies/:id`

- 인증 불필요 (목록처럼 비로그인도 조회 가능, `isScrapped`만 `false`)
- 정책이 없으면 404 (`errors.notFound()`)
- 응답: 신규 `policyDetailSchema` (`packages/contract`) — 기존 `policySchema`(목록/카드용)와 별도 타입

### 필드 매핑

| 응답 필드                                                | 원본 API 필드                                                                                    | 비고                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `name`, `largeCategory`, `mediumCategory`, `description` | `plcyNm`, `lclsfNm`, `mclsfNm`, `plcyExplnCn`                                                    |                                              |
| `ageMin/Max`, `noAgeLimit`                               | `sprtTrgtMinAge/Max`, `sprtTrgtAgeLmtYn`                                                         |                                              |
| `applyStartDate/EndDate`, `applyPeriodType`              | `bizPrdBgngYmd/EndYmd`, `aplyPrdSeCd`                                                            | `daysLeft` 계산에 기존 `calcDaysLeft` 재사용 |
| `applicationUrl`                                         | `aplyUrlAddr`                                                                                    | 하단 고정 CTA                                |
| `region`                                                 | `zipCd` → DB `Sigungu` 조회                                                                      | 기존 `buildRegionLabel` 재사용               |
| `supervisingAgency`, `operatingAgency`                   | `sprvsnInstCdNm`, `operInstCdNm`                                                                 |                                              |
| `referenceUrls`                                          | `refUrlAddr1`, `refUrlAddr2`                                                                     | null 가능                                    |
| 지원내용 탭 `content`                                    | `plcySprtCn`                                                                                     |                                              |
| 지원내용 탭 `notice`                                     | `etcMttrCn`                                                                                      | 빨간 테두리 경고 카드로 표시                 |
| 지원자격 탭 `basicQualification`                         | 연령(`sprtTrgtMinAge/Max`) + 소득조건(`earnCndSeCd/earnMinAmt/earnMaxAmt/earnEtcCn`) 조합 텍스트 |                                              |
| 지원자격 탭 `detailQualification`                        | `addAplyQlfcCndCn`                                                                               |                                              |
| 지원자격 탭 `exclusionTarget`                            | `ptcpPrpTrgtCn`                                                                                  | 빨간 테두리 경고 카드로 표시                 |
| 신청방법 탭 `applyMethod`                                | `plcyAplyMthdCn`                                                                                 |                                              |
| 신청방법 탭 `screeningMethod`                            | `srngMthdCn`                                                                                     |                                              |
| 신청방법 탭 `requiredDocuments`                          | `sbmsnDcmntCn` 파싱                                                                              | 아래 "제출서류 파싱 + 링크 매핑" 참고        |
| `isScrapped`                                             | DB `PolicyScrap`                                                                                 |                                              |

### 제출서류 파싱 + 링크 매핑

- `sbmsnDcmntCn` 원문을 줄바꿈/구분자 기준으로 항목 리스트로 분리한다 (BFF에서 처리, 모바일은 이미 구조화된 배열만 받는다).
- 신규 고정 키워드 매핑 테이블(`policies.documents.ts`)로 서류명에 발급기관 링크를 매칭한다. 전체 자유 형식 텍스트를 파싱해 모든 기관을 알아내는 건 불가능하므로, 청년 정책에서 자주 반복되는 서류 종류만 큐레이션한다.

  | 키워드                     | 기관명       |
  | -------------------------- | ------------ |
  | 주민등록등본, 주민등록초본 | 정부24       |
  | 가족관계증명서             | 정부24       |
  | 건강보험자격득실확인서     | 정부24       |
  | 소득금액증명               | 홈택스       |
  | 등기부등본                 | 인터넷등기소 |
  | 재학증명서, 졸업증명서     | 정부24       |

- 매칭되지 않으면 `agencyName`/`agencyUrl` 없이 텍스트만 노출한다.
- 응답 형태: `requiredDocuments: { name: string; agencyName?: string; agencyUrl?: string }[]`

### 모바일

- `entities/policies`에 `usePolicyDetail(id)` 신규 쿼리 훅 추가 (`policyKeys.detail(id)`)
- 스크랩 토글은 기존 `usePolicyScrap` mutation을 재사용하고, 캐시 갱신 대상에 `detail` 쿼리를 추가한다

---

## 화면 구성 (Figma 기준)

1. **헤더**: 공통 `Header` `detail` variant, blur 배경
2. **Hero**: 카테고리 칩 + D-day/마감 뱃지, 정책명, 요약 설명
3. **Quick Info 2x2**: 지원금액 / 지원대상 / 신청기간 / 주관기관
4. **스티키 탭 3개**: 지원자격 / 지원내용 / 신청방법
   - 지원자격: 기본 자격요건 → 상세조건 → 지원 제외대상 (경고 카드, 빨간 테두리)
   - 지원내용: 상세 내용 → 유의사항 (경고 카드, 빨간 테두리)
   - 신청방법: 신청 방법 → 필수 제출서류 (카드 리스트, 일부 기관 이동 버튼)
5. **하단 고정 CTA**: "지금 바로 신청하기" — `applicationUrl` 있으면 외부 브라우저 이동, 없으면 비활성 또는 숨김

### 스코프 제외 (별도 작업으로 기록)

- 관련 정책 추천 섹션 — 추천 로직 설계가 추가로 필요
- 신청기간 카드의 "캘린더 등록" 버튼

---

## 에러 처리

| 상황                        | 처리                                              |
| --------------------------- | ------------------------------------------------- |
| 외부 API 호출 실패/타임아웃 | 전체 화면 에러 상태 + 재시도 버튼                 |
| 정책 없음(빈 결과)          | 404 → Empty State + 뒤로가기                      |
| 비로그인 스크랩 시도        | 로그인 안내 토스트 (기존 패턴)                    |
| 스크랩 토글 실패            | 낙관적 업데이트 롤백 + 토스트                     |
| 마감된 정책                 | 차단하지 않고 마감 뱃지만 표시, CTA는 그대로 노출 |

---

## 검증 기준

- 상세 화면은 `Policy` 테이블을 조회하지 않는다 (스크랩 여부/지역명 제외).
- API 타입은 신규 `policyDetailSchema`로 검증하며, 기존 `policySchema`와 혼용하지 않는다.
- BFF `fetch()` 호출에 `revalidate: 1800`이 적용되어 있다.
- `screens → features → entities → shared` 의존 방향을 지킨다.
