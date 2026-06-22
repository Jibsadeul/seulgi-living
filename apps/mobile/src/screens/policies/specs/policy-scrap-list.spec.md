# 청년 정책 스크랩 조회 화면 명세

## 목적

사용자가 스크랩한 정책을 한 화면에 모아보고, 스크랩을 해제(취소)할 수 있는 화면이다.
홈 화면의 "청년정책 즐겨찾기" 미리보기 위젯(`PoliciesScrapPreview`)의 "더보기"를 통해 진입한다.

---

## 진입 경로

- 홈 화면 `PoliciesScrapPreview`의 `onMorePress` (현재 빈 함수 `() => {}`) → 이 화면으로 연결
- 라우트: `(stack)/policies/scraps.tsx` (탭바 없음, 뒤로가기 가능한 스택 화면)

---

## 데이터 흐름

### BFF 엔드포인트 (신규): `GET /api/policies/scraps`

기존 `/api/policies/:id/scrap` 패턴과 동일선상에서 "정책" 도메인 하위에 둔다.
인증된 사용자만 호출 가능 (`getCurrentMemberId(request)`로 서버가 토큰에서 직접 추출, 클라이언트가 별도로 사용자 식별값을 보내지 않음).

#### 쿼리 파라미터

| 파라미터 | 타입                     | 기본값       | 설명                                                                                            |
| -------- | ------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| `sortBy` | `'deadline' \| 'recent'` | `'deadline'` | `deadline`=마감임박순(`applyEndDate` asc), `recent`=최근 스크랩순(`PolicyScrap.createdAt` desc) |
| `page`   | number                   | 1            |                                                                                                 |
| `limit`  | number                   | 15           |                                                                                                 |

#### 응답

```json
{ "items": Policy[], "total": number, "page": number, "limit": number }
```

기존 `getPolicies` 응답과 동일한 형태를 재사용한다 (`Policy` 타입 신규 정의 없음).

#### 인증

- `memberId`가 없으면(비로그인) `errors.unauthorized()`를 던진다.
- 이 화면은 스크랩 전용이라 정책 목록/추천처럼 비로그인 허용 케이스가 아니다 — 진입 자체가 로그인된 사용자만 가능하다.

#### 서비스 로직 (`policies.service.ts` 신규 함수, 가칭 `getScrappedPolicies`)

```
PolicyScrap.findMany({
  where: { userId: memberId },
  include: { policy: { include: { _count: { select: { scraps: true } }, scraps: buildScrapsInclude(memberId) } } },
  orderBy: sortBy === 'recent' ? { createdAt: 'desc' } : { policy: { applyEndDate: 'asc' } },
  skip: (page - 1) * limit,
  take: limit,
})
```

→ 각 row의 `policy`를 `toPolicy()`로 매핑.

### 모바일

검색 화면의 `useInfinitePolicies` 패턴을 재사용해 `useScrappedPolicies(sortBy)` 무한스크롤 훅을 `entities/policies`에 신규 작성한다.

---

## 화면 구성

### 1. 헤더

- 공통 `Header` 컴포넌트 `back` variant
- 타이틀: `스크랩한 정책`

### 2. 정렬 선택

- 화면 우측 상단에 정렬 토글/드롭다운: `마감임박순` / `최근 스크랩순`
- 정렬 변경 시 첫 페이지부터 다시 조회한다 (무한스크롤 상태 초기화)

### 3. 목록

- 카드형, 세로 스크롤 + 무한스크롤(`limit=15`)
- 각 카드에 스크랩 해제 버튼(★ 토글) — 기존 `usePolicyScrap` mutation 재사용 (낙관적 업데이트)

### 4. 빈 상태

- 스크랩한 정책이 0건이면 "스크랩된 정책이 없습니다" 텍스트만 표시

### 5. 로딩

- 최초 진입 시 Skeleton 카드 3~5개

---

## 에러 처리

| 상황                          | 처리                                      |
| ----------------------------- | ----------------------------------------- |
| 목록 조회 실패 (네트워크/5xx) | 전체 화면 에러 상태 + 재시도 버튼         |
| 스크랩 해제 실패              | 낙관적 업데이트 롤백 + 토스트 안내        |
| 인증 만료(401)                | 로그인 안내 토스트 → 로그인 화면 이동     |
| 다음 페이지 로드 실패         | 기존 목록 유지, 하단에 재시도 버튼만 노출 |

---

## 검증 기준

- 정렬 변경 시 첫 페이지부터 다시 조회하며, 이전 정렬의 캐시와 섞이지 않는다.
- 스크랩 해제 시 이 화면의 캐시뿐 아니라 추천/배너/검색결과 캐시도 함께 갱신한다 (`POLICY-016`의 `setQueriesData` 패턴 재사용).
- 비로그인 상태로는 이 화면 자체에 진입할 수 없다 (마이페이지/홈 진입점에서 이미 인증을 요구한다).
- `screens → features → entities → shared` 의존 방향을 지킨다.
- API 타입은 `@repo/contract` Zod 스키마를 통해서만 정의한다.
