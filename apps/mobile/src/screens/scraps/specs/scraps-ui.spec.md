# 즐겨찾기(스크랩) 화면 UI 명세

> Figma: `슬기로운 자취 생활` 파일, node `365:1263`("Main")
> 정책 탭의 데이터 흐름/에러 처리는 `apps/mobile/src/screens/policies/specs/policy-scrap-list.spec.md`를 따르고, 이 문서는 화면의 시각적 구조만 다룬다.
> 이 화면은 레시피/청년정책 스크랩을 함께 보여주는 공통 화면이라 `screens/scraps`에 위치한다(`POLICY-022` 참고). 레시피 탭 콘텐츠는 레시피 도메인 작업 범위.

---

## 0. 헤더

Figma는 헤더 영역 없이 탭 토글부터 시작하지만, 데이터 spec의 네비게이션 요구사항(`back` variant)은 유지한다. 타이틀은 "스크랩한 정책" 대신 **"즐겨찾기"** — 레시피/정책 공통 화면이라 도메인 이름을 빼고 더 포괄적인 이름을 쓴다.

## 1. 상단 탭 토글 ("레시피" / "청년정책")

Figma 디자인은 이 화면을 "스크랩" 통합 화면(레시피 탭 + 청년정책 탭)으로 그려뒀다.

- **탭 전환 자체는 실제로 동작**한다(`ScrapsTabToggle`이 `activeTab`/`onChange`를 받는 controlled 컴포넌트). 탭을 누르면 화면 전체가 해당 탭 콘텐츠로 바뀐다.
- **레시피 탭의 실제 데이터 연동은 범위 밖**이다 — 레시피 도메인 담당자의 별도 작업. 이번 구현에서는 "레시피 스크랩은 준비 중입니다" 플레이스홀더만 표시한다.
- 정책 탭 콘텐츠(정렬/카드 목록/로딩/에러)는 기존과 동일하게 동작한다.
- 스타일:
  - 바깥 컨테이너: 배경 `#F8F8F8`(`gray-5`), `border-radius 16`, `padding 6`, 너비 320 / 높이 52
  - 비활성 탭: 텍스트만, `font-weight 500`, `font-size 15`, 색상 `#666666`
  - 활성 탭: 배경 `#FFFFFF`, `border-radius 12`, `box-shadow 0px 1px 2px rgba(0,0,0,0.05)`, 텍스트 `font-weight 700`, `font-size 15`, 색상 `#EF7722`(brand main)

---

## 2. 총 개수 텍스트 (청년정책 탭)

- `총 {N}개의 저장된 청년정책` 형태
- `{N}`(숫자)만 강조 색상 `#EF7722`, 나머지 텍스트는 기본 색상(`#666666`)
- `N`은 API 응답의 `total` 값을 그대로 사용 (스크랩 해제로 줄어들면 함께 갱신)

---

## 3. 정렬 토글 (청년정책 탭, 디자인 미정)

- 데이터 spec의 "마감임박순 / 최근 스크랩순" 정렬 기능은 그대로 유지한다.
- 이 Figma 화면에는 정렬 토글이 그려져 있지 않음 — **디자이너에게 별도 토글 UI 추가를 요청한 상태**이며, 받기 전까지는 직접 만든 드롭다운(버튼 하나 + 누르면 옵션 목록이 펼쳐지는 방식)으로 임시 구현한다.
  - FlatList 헤더 내부에 `position: absolute`로 띄우면 뒤에 그려지는 리스트 아이템에 가려지는 문제가 있어, `Modal`(transparent)로 별도 레이어에 렌더링한다.
  - 트리거는 뱃지/버튼 형태가 아니라 텍스트 + 쉐브론 아이콘만 있는 단순한 형태(`#a5a5a5`, 연한 회색).
- 디자인 전달되면 이 섹션을 교체한다.

---

## 4. 정책 카드 (리스트 아이템, 청년정책 탭)

### 4.1 카드 컨테이너

- `flex-direction: row`, `align-items: center`, `gap: 16`, `padding: 12`
- 배경 `#FFFFFF`, 테두리 1px `#F9FAFB`, `border-radius: 16`
- `box-shadow: 0px 1px 2px rgba(0,0,0,0.05)`

### 4.2 카테고리 아이콘 아바타 (좌측, 50x50, `border-radius: 12`)

Figma에 그려진 4개 카테고리는 디자인에서 직접 추출한 벡터 아이콘(`assets/icons/policy-scrap/`)을 쓴다 — 기존 빠른탐색(`PoliciesQuickCategories.tsx`)의 `assets/icons/policy/` 아이콘과는 스타일이 달라 구분한다. 배경/아이콘 매핑:

| 카테고리(largeCategory 포함 여부로 판단) | 배경색    | 아이콘                                  |
| ---------------------------------------- | --------- | --------------------------------------- |
| 주거                                     | `#E9EFFF` | `assets/icons/policy-scrap/house.svg`   |
| 일자리                                   | `#E1F5EE` | `assets/icons/policy-scrap/job.svg`     |
| 금융                                     | `#FAEEDA` | `assets/icons/policy-scrap/fiance.svg`  |
| 복지                                     | `#FFE2E5` | `assets/icons/policy-scrap/welfare.svg` |

교육/문화/참여는 Figma 원본 mock엔 없었지만 추가로 벡터 아이콘과 색을 확정해 받음(`assets/icons/policy-scrap/`):

| 카테고리         | 배경색    | 아이콘/뱃지 색 | 아이콘                                        |
| ---------------- | --------- | -------------- | --------------------------------------------- |
| 교육             | `#FFF4D9` | `#FFAB00`      | `assets/icons/policy-scrap/edu.svg`           |
| 문화             | `#F3E8FF` | `#7C3AED`      | `assets/icons/policy-scrap/culture.svg`       |
| 참여             | `#E0F7FA` | `#0E7490`      | `assets/icons/policy-scrap/participation.svg` |
| 기타(매칭 안 됨) | `#F0F0F0` | `#757575`      | 기본 아이콘 없음 — 회색 배경만 표시           |

`largeCategory`는 복합 문자열(`POLICY-008`, 예: "금융·복지·문화")이라 아이콘 하나로 전부 표현할 수 없다. **아이콘은 "대표 카테고리 하나"를 보여주는 장식 요소**로 취급해, 위 표의 키워드를 정해진 우선순위(`주거 > 일자리 > 금융 > 복지 > 교육 > 문화 > 참여`) 순서로 `contains` 검사해 첫 매칭되는 카테고리의 아이콘/배경색을 사용한다. 여러 카테고리가 섞여 있어도 아이콘은 하나만 골라서 보여주는 게 의도된 동작이다(정확한 전체 분류는 4.3의 뱃지 텍스트가 담당).

### 4.3 카테고리 뱃지 + D-day 뱃지 (아바타 우측 상단 행)

- 카테고리 뱃지: 외곽선만 있는 칩(`border-radius: 4`, `padding: 2px 6px`), `font-weight 700`, `font-size 10`. **텍스트는 `largeCategory` 원본 문자열을 그대로 보여준다**(기존 `PolicySearchResultCard`와 동일한 방식, 예: "금융·복지·문화"를 그대로 표시) — 화면마다 같은 정책이 다른 정보로 보이지 않도록, 정확한 분류 정보는 항상 뱃지가 담당하고 4.2의 아이콘은 대표 하나만 보여주는 장식으로만 취급한다. 테두리/텍스트 색상은 4.2에서 매칭된 대표 카테고리의 색(아래 표)을 그대로 사용한다.
- D-day 뱃지: 배경이 채워진 칩, 기존 `PolicySearchResultCard`의 `isUrgent` 로직(`daysLeft <= 3`) 그대로 재사용
  - 일반(`daysLeft > 3` 또는 상시): 배경 `#FAEEDA`, 텍스트 `#EF7722`
  - 긴급(`daysLeft <= 3`): 배경 `#FFE2E5`, 텍스트 `#ED3241`
  - 상시(`applyPeriodType === '0057002'`): "상시" 텍스트, 일반 스타일과 동일한 색

| 카테고리 | 텍스트/테두리 색 |
| -------- | ---------------- |
| 주거     | `#3B309E`        |
| 일자리   | `#355E3B`        |
| 금융     | `#9C4400`        |
| 복지     | `#ED3241`        |

### 4.4 정책명 + 보조 텍스트

- 정책명: `font-weight 700`, `font-size 15`, 색상 `#1B1C1A`, 1줄 ellipsis
- 보조 텍스트 한 줄: Figma는 `"국토교통부 · 만 19~34세"`(기관명 · 연령대)로 그려져 있으나, **기관명 데이터가 현재 DB/contract에 없음**(4개 mock 카드 전부 "국토교통부"로 동일 — 디자이너 placeholder로 추정).
  - **기관명 대신 지역(`region`)을 쓴다**: 이미 `Policy` 타입에 있는 필드라 새 데이터 추가 없이 바로 사용 가능. "내가 스크랩한 정책을 다시 볼 때 내 지역 정책인지"가 기관명보다 실질적으로 더 자주 확인하는 정보라 판단.
  - 형태: `"{region} · {연령}"` — `region`이 있으면 둘 다, 없으면 연령만. 연령은 `PolicySearchResultCard`의 `getAgeLabel()` 로직 재사용 (`연령 무관` 또는 `만 {ageMin}~{ageMax}세`)

### 4.5 스크랩 버튼 (우측, 카드 상단에 정렬)

- 기존 `ScrapIcon`/`ScrappedIcon`(`POLICY-014`) 그대로 재사용
- 이 화면은 "내가 스크랩한 것만" 모아보는 화면이라 모든 카드가 항상 `isScrapped: true` → 항상 `ScrappedIcon`(채워진 상태)로 보임
- `alignSelf: 'flex-start'`로 카테고리/D-day 뱃지 행과 같은 높이(카드 상단)에 위치 — 기본값(`items-center`)이면 카드 전체 높이 기준 중앙에 위치해 뱃지 행과 어긋나 보임
- 눌렀을 때 `usePolicyScrap` mutation으로 해제 — 해제되면 목록에서 해당 카드가 빠짐(invalidate 후 refetch)

---

## 5. 빈 상태 / 로딩 / 에러 (청년정책 탭)

데이터 spec(`policy-scrap-list.spec.md`)의 정의를 그대로 따른다. Figma 디자인에는 빈 상태가 그려져 있지 않아 기존 검색 결과 화면의 빈 상태 스타일(중앙 정렬 텍스트)을 재사용한다.
