# policies 서비스 명세

> `apps/api/src/services/policies/` 기준

---

## 파일 구조

```
services/policies/
├── policies.service.ts   # 유스케이스 export 함수만 포함
├── policies.mapper.ts    # DB row → contract 변환, 외부 API raw → upsert 데이터 변환
├── policies.utils.ts     # 날짜/태그 순수 유틸 함수
├── policies.documents.ts # 제출서류 키워드 → 발급기관 링크 매핑 (신규)
└── specs/
    └── policies.spec.md
```

---

## policies.utils.ts — 날짜 및 태그 유틸

### 타입

| 이름       | 설명                                            |
| ---------- | ----------------------------------------------- |
| `TagValue` | `'popular' \| 'many_scraps' \| 'deadline_soon'` |

### 함수

#### `parseDate(s: string | undefined): Date | null`

- 8자리 숫자 문자열(`YYYYMMDD`) 또는 일반 날짜 문자열을 `Date`로 변환
- 8자리 숫자일 경우 **로컬 시간** 기준으로 생성 (`new Date(year, month-1, day)`)
  - UTC 기준 `new Date("YYYY-MM-DDT00:00:00.000Z")` 사용 시 로컬 자정 기준 하루 차이 발생 가능
- 변환 실패 시 `null` 반환

#### `calcDaysLeft(applyEndDate: Date | null): number | null`

- 오늘 자정 기준으로 마감일까지 남은 일수 계산
- `null` 입력 시 `null` 반환
- 당일은 0, 이미 지난 날짜는 음수 반환

#### `calcAge(birthday: Date): number`

- 오늘 기준 만 나이 계산
- 생일이 아직 안 지난 경우 1을 빼서 보정

#### `calcTags(viewCount, scrapCount, daysLeft): TagValue[]`

| 조건                             | 태그            |
| -------------------------------- | --------------- |
| `daysLeft >= 0 && daysLeft <= 7` | `deadline_soon` |
| `viewCount >= 10000`             | `popular`       |
| `scrapCount >= 10`               | `many_scraps`   |

---

## policies.mapper.ts — 데이터 변환

### 타입

#### `PolicyRow`

Prisma `policy.findMany` 결과 행 타입. `_count.scraps`와 `scraps` 배열 포함.

### 함수

#### `toPolicy(row: PolicyRow): Policy`

- DB row → `@repo/contract` `Policy` 타입 변환
- `calcDaysLeft`, `calcTags` 호출하여 `daysLeft`, `tags` 계산
- `policySchema.parse()`로 최종 검증

#### `buildRegionFilter(sigunguId: string | null | undefined)`

- `sigunguId`가 없으면 빈 객체 반환 (필터 없음)
- `noZipLimit: true` 또는 `zipCd: null` 또는 `zipCd contains sigunguId` 중 하나 충족 시 포함

#### `buildScrapsInclude(memberId: string | null)`

- 로그인 사용자 → `{ where: { userId: memberId } }` (본인 스크랩만 조회)
- 비로그인 → `{ where: { id: BigInt(-1) } }` (존재하지 않는 id로 빈 배열 반환, UUID 컬럼 비교 회피)

#### `rawToUpsertData(raw: YouthPolicyRaw)`

- 청년정책 API raw 응답 → Prisma `upsert` 데이터 변환
- `bizPrdBgngYmd` 없으면 `aplyYmd` 앞 8자리로 대체 (startDate)
- `bizPrdEndYmd` 없으면 `aplyYmd` 뒤 8자리로 대체 (endDate)
- `zipCd` 항목이 100개 이상이면 `noZipLimit: true`, `zipCd: null` 처리
  - 전국 대상 정책의 경우 1500자 이상의 zipCd 문자열이 들어올 수 있어 저장 불가 → noZipLimit 플래그로 대체

---

## policies.service.ts — 유스케이스

### `syncPolicies(): Promise<{ synced: number; total: number }>`

- 청년정책 API 전체 페이지 순회 (PAGE_SIZE=100)
- 각 정책을 `plcyNo` 기준으로 upsert
- 완료 후 동기화된 건수 반환

### `getPolicyBanner(memberId): Promise<PolicyBanner | null>`

배너 조건 우선순위:

1. **조건 A (스크랩)**: 로그인 사용자의 스크랩 정책 중 30일 내 마감
2. **조건 B (추천)**: 나이/거주지 맞춤 정책 중 30일 내 마감
3. 해당 없으면 `null`

### `getRecommendedPolicies(memberId): Promise<Policy[]>`

- 나이 필터: `noAgeLimit: true` 또는 `ageMin <= userAge <= ageMax` 또는 나이 제한 없음
- 지역 필터: `buildRegionFilter(sigunguId)` 적용
- 마감 지난 정책 제외 (`applyEndDate >= today` 또는 `null`)
- 마감일 오름차순 → 조회수 내림차순, 최대 10건

### `getPolicies(query, memberId): Promise<{ items, total, page, limit }>`

- `policyListQuerySchema`로 쿼리 파라미터 파싱/검증
- 필터: `keyword`(name/description/keywords), `largeCategory`, `zipCd`, `applyPeriodType`, `deadlineOnly`(7일 내)
- 페이지네이션: `page`, `limit`

### `getScrappedPolicies(memberId, query): Promise<{ items, total, page, limit }>`

- 비로그인 시 `errors.unauthorized()` throw
- `policyScrapListQuerySchema`로 쿼리 파라미터 파싱/검증 (`sortBy` 기본 `deadline`, `limit` 기본 15)
- `PolicyScrap.findMany({ where: { userId: memberId } })` 기준 조회, `sortBy`에 따라 `orderBy` 분기 (`recent`→`createdAt desc`, `deadline`→`policy.applyEndDate asc`)
- 각 row의 `policy`를 `toPolicy()`로 매핑 (응답 형태는 `getPolicies`와 동일)

### `scrapPolicy(memberId, policyId): Promise<void>`

- 비로그인 시 `errors.unauthorized()` throw
- 정책 미존재 시 `errors.notFound()` throw
- 중복 스크랩 방지 (이미 존재하면 skip)

### `unscrapPolicy(memberId, policyId): Promise<void>`

- 비로그인 시 `errors.unauthorized()` throw
- `deleteMany` 사용 (없어도 에러 없이 통과)

### `getPolicyDetail(plcyNo, memberId): Promise<PolicyDetail>` (신규)

> spec: `apps/mobile/src/screens/policies/specs/policy-detail.spec.md`

- `Policy` 테이블을 조회하지 않는다. 매 요청마다 `fetchYouthPolicyDetail(plcyNo)`로 온통청년 API를 실시간 호출한다 (`next: { revalidate: 1800 }` 캐시 적용)
- 조회 결과가 없으면 `errors.notFound()` throw
- `isScrapped`는 `PolicyScrap.findFirst({ where: { policyId: plcyNo, userId: memberId } })`로 DB에서 별도 조회해 합성 (캐시 대상 아님, 항상 최신)
- `region`은 `zipCd`를 기존 `buildSigunguNameMap`/`buildRegionLabel`로 DB 조회해 보강
- `requiredDocuments`는 `sbmsnDcmntCn`을 줄바꿈 기준으로 분리한 뒤 `policies.documents.ts`의 키워드 매핑 테이블로 기관 링크를 매칭, 매칭 안 되면 텍스트만 반환
- 응답은 `policyDetailSchema`(`@repo/contract`)로 검증 — 목록용 `policySchema`와는 별도 타입

---

## youth-policy.client.ts — 외부 API 클라이언트 (신규 함수)

### `fetchYouthPolicyDetail(plcyNo): Promise<YouthPolicyDetailRaw | null>`

- `fetchYouthPolicies`와 같은 엔드포인트를 `plcyNo` 쿼리 파라미터로 단건 필터링해 호출 (`pageSize: 1`)
- `YouthPolicyDetailRaw`는 목록 동기화용 `YouthPolicyRaw`보다 필드가 많음 (`plcySprtCn`, `plcyAplyMthdCn`, `srngMthdCn`, `sbmsnDcmntCn`, `etcMttrCn`, `addAplyQlfcCndCn`, `ptcpPrpTrgtCn`, `sprvsnInstCdNm`, `operInstCdNm`, `refUrlAddr1/2`, `earnCndSeCd/earnMinAmt/earnMaxAmt/earnEtcCn`, `sprtSclCnt` 등)
- 결과 없으면 `null` 반환

---

## policies.documents.ts — 제출서류 기관 링크 매핑 (신규)

- 서류명 키워드 → `{ agencyName, agencyUrl }` 고정 매핑 테이블
- 청년 정책에서 반복적으로 등장하는 서류 종류만 큐레이션 (주민등록등본/초본, 가족관계증명서, 건강보험자격득실확인서, 소득금액증명, 등기부등본, 재학/졸업증명서)
- 매칭되는 키워드가 없으면 링크 없이 텍스트만 반환

---

## 에러 처리

| 상황                      | 처리                                                 |
| ------------------------- | ---------------------------------------------------- |
| 비로그인 스크랩/해제 요청 | `errors.unauthorized()`                              |
| 존재하지 않는 정책 스크랩 | `errors.notFound('정책을 찾을 수 없습니다.')`        |
| 청년정책 API 실패         | 예외 전파 → route handler의 `withHandler`가 500 반환 |
| 상세 조회 시 정책 없음    | `errors.notFound()` → 404 응답                       |
