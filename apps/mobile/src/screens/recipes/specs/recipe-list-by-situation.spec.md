# RecipeListBySituationScreen

> CookSituationChips 클릭 시 이동하는 "상황별 추천 레시피" 화면. Figma 노드 541-1673 기준.

## 기능 정의

- 상황별 카테고리(야식/안주·초스피드·디저트·건강식)별 레시피 목록 화면.
- 위에서 아래로:
  1. 헤더: ← "상황별 추천 레시피" (back variant)
  2. 카테고리 탭 칩: 야식/안주, 초스피드, 디저트, 건강식 (가로 스크롤, 선택된 칩 오렌지 배경)
  3. 카테고리 타이틀: "{카테고리명} 추천 🔥" + 서브타이틀
  4. 검색 결과 건수 + 페이지네이션 ("검색 결과 N건", "< 1 / 5 >")
  5. 2열 레시피 그리드: 사진 + 북마크 아이콘 + 제목 + 태그 칩
- 인터랙션:
  - 카테고리 탭 변경 → 해당 카테고리의 mock 레시피 표시
  - 레시피 카드 클릭 → `/(stack)/recipes/[id]` 이동
  - 북마크 아이콘 → 로컬 스크랩 토글

## 데이터 흐름

- `entities/recipes` 미구현이므로 카테고리별 로컬 mock 배열 사용.
- 진입 시 route param `category`로 초기 선택 카테고리 결정 (기본값 `night`).
- 카테고리 선택, 스크랩 토글은 로컬 `useState`.
- 페이지네이션은 UI만 표시(고정 1/5), 실제 동작은 API 연동 시 구현.

## 특이 사항

- 라우트: `app/(stack)/recipe-by-situation.tsx` 신설. CookMainScreen의 `handleSituationSelect`에서 category param과 함께 이동.
- 실제 API/entities 연동은 추후 별도 작업.
