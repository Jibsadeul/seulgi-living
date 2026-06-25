# FridgeAllScreen Spec

> 냉장고 전체 보기 화면 (My 냉장고 탭)

## 기능 정의

CookMainScreen에서 "My 냉장고" 탭 선택 시 보여지는 냉장고 재료 전체 목록 화면.
사용자가 보유한 재료를 카테고리별로 필터하고, 수량을 직접 조절할 수 있다.

### 화면 위치

- 파일: `screens/recipes/ui/FridgeAllScreen.tsx`
- 진입: CookMainScreen의 fridge 탭 콘텐츠로 렌더링
- 토글 스위처(레시피/My 냉장고)는 이 화면에 포함

---

## UI 구성

### 1. 토글 스위처

- 기존 `CookTabToggle` 컴포넌트 재사용
- "레시피" 탭 클릭 시 CookMainScreen의 레시피 콘텐츠로 전환
- "My 냉장고" 탭이 활성 상태

### 2. 검색바

- 오렌지 테두리(`border-main-100`), 흰 배경, rounded-lg
- 검색 아이콘(오렌지), 플레이스홀더 "검색창"
- 터치 시 검색 동작 (현재는 로컬 필터링)

### 3. 필터 바

- **정렬 버튼**: "등록순" (필터 아이콘 + 텍스트), pill 형태, 흰 배경, 회색 테두리
- **세로 구분선**: 정렬과 카테고리 사이
- **카테고리 칩**: 가로 스크롤
  - 활성: 오렌지 배경(`bg-main-100`), 흰 텍스트
  - 비활성: 흰 배경, 회색 테두리, 어두운 텍스트

카테고리 매핑:

| UI 라벨   | contract 값     |
| --------- | --------------- |
| 전체      | (필터 없음)     |
| 정육/계란 | MEAT, EGG_DAIRY |
| 채소      | VEGETABLE       |
| 유제품    | EGG_DAIRY       |
| 수산물    | SEAFOOD         |
| 과일      | FRUIT           |
| 곡물/면   | GRAIN_NOODLE    |
| 가공식품  | PROCESSED       |
| 양념/소스 | SAUCE_SEASONING |
| 기타      | OTHER           |

### 4. 재료 그리드

- 2열 그리드, 12px 간격
- 각 카드:
  - 흰 배경, rounded-lg, 회색 테두리, 그림자
  - padding 16px
  - **상단 행**: 원형 재료 이미지(48px) + 재료명 + ⋮ 메뉴 버튼
  - **하단 행**: 수량 조절기 `[-] 6개 [+]`
    - `-` 버튼: 오렌지 아웃라인
    - `+` 버튼: 오렌지 배경, 흰 아이콘
    - 수량 텍스트: 중앙 정렬

### 5. FAB (Floating Action Button)

- 우하단 고정 위치
- 오렌지 원형 버튼, 편집 아이콘 + "편집" 텍스트
- 터치 시 재료 추가 화면(`FridgeAddScreen`)으로 이동

---

## 데이터 흐름

### API 연동

| 동작      | 엔드포인트               | 메서드   |
| --------- | ------------------------ | -------- |
| 목록 조회 | `GET /api/fridge`        | Query    |
| 수량 변경 | `PATCH /api/fridge/:id`  | Mutation |
| 재료 삭제 | `DELETE /api/fridge/:id` | Mutation |

### 구현 파일

| 파일                               | 역할                        |
| ---------------------------------- | --------------------------- |
| `entities/fridge/api/keys.ts`      | TanStack Query 키           |
| `entities/fridge/api/queries.ts`   | `useFridgeIngredients()` 훅 |
| `entities/fridge/api/mutations.ts` | 수량 변경/삭제 Mutation 훅  |
| `entities/fridge/index.ts`         | Barrel Export               |

### 클라이언트 상태

- 검색 키워드: 로컬 state (재료명 필터링)
- 선택된 카테고리: 로컬 state
- 정렬 옵션: 로컬 state (등록순 = createdAt DESC 기본)

---

## 예외 처리

| 상황            | 처리                                     |
| --------------- | ---------------------------------------- |
| 로딩 중         | SkeletonCard 2열 그리드 표시             |
| 에러            | Toast 에러 메시지                        |
| 재료 0건        | 간단한 빈 상태 메시지 (별도 디자인 없음) |
| 수량 1일 때 `-` | 최소값 1 유지 (감소 불가)                |
| 비로그인        | 로그인 안내                              |
