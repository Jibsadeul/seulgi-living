# RecipeListAllScreen

> CookMainScreen "전체보기" 클릭 시 이동. Figma 노드 541-1886 기준.

## 기능 정의

- 전체 레시피 목록 화면.
- 위에서 아래로:
  1. 헤더: ← "모든 레시피" (back variant)
  2. 검색바: "오늘 뭐 먹지? 재료나 레시피 검색"
  3. 필터 칩 바: 필터 아이콘 + "음식종류 ▼" · "요리방법 ▼" · "난이도 ▼"
  4. 검색 결과 건수: "검색 결과 N건"
  5. 2열 레시피 그리드: 사진 + 북마크 + 제목 + 태그 칩
  6. 플로팅 버튼: "+ 레시피 입력"
- 인터랙션:
  - 필터 칩 → TODO (BottomSheet 스텁이라 미구현)
  - 레시피 카드 → `/(stack)/recipes/[id]` 이동
  - 북마크 → 로컬 스크랩 토글

## 데이터 흐름

- `entities/recipes` 미구현이므로 로컬 mock 배열 사용.
- 스크랩 토글은 로컬 `useState`.

## 특이 사항

- 라우트: `app/(stack)/recipe-list-all.tsx` 신설.
- 필터 바텀시트는 BottomSheet 스텁이라 미구현. 칩은 UI만 표시.
