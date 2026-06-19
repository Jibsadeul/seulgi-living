# RescueFridgeScreen

> CookRescueBanner 클릭 시 이동하는 "냉장고를 구해줘" 화면. Figma 노드 541-2741 기준.

## 기능 정의

- CookMainScreen의 AI 추천 배너("냉장고를 구해줘") 클릭 시 스택으로 진입하는 화면.
- 위에서 아래로:
  1. 헤더: ← "냉장고를 구해줘" (back variant)
  2. 안내 영역: "남은 재료로 만드는 최적의 식단 가이드" + 부제 텍스트
  3. 재료 선택 섹션: "지금 있는 재료를 선택하세요" + "모두 지우기" 링크
  4. 검색 입력: placeholder "재료를 검색해보세요 (예: 감자) Enter로 추가" — 텍스트 입력 후 엔터로 재료 추가
  5. My 냉장고 재료: "My 냉장고의 재료" + "자세히보기" → 원형 재료 칩(아이콘+라벨) 가로 나열, 또는 빈 상태("아직 냉장고에 재료가 없어요" + "재료 추가하러 가기" 버튼)
  6. 하단 CTA: "지금 재료로 레시피 보러가기 >" 풀 너비 오렌지 버튼

## 데이터 흐름

- `entities/fridge` 미구현이므로 로컬 mock 재료 배열(`useState`) 사용.
- 검색 입력 → Enter → 재료를 선택 목록에 추가 (로컬 state).
- My 냉장고 재료도 로컬 mock 배열. 빈 배열이면 빈 상태 UI 표시.
- "모두 지우기" → 선택 재료 배열 초기화.
- CTA 클릭 → RescueRecommendScreen 이동(라우트 미존재, TODO).

## 특이 사항

- 라우트: `app/(stack)/rescue-fridge.tsx` 신설. CookMainScreen의 `handleRescuePress`를 `/(stack)/rescue-fridge`로 변경.
- "자세히보기" → TODO (My냉장고 상세 라우트 미존재).
- "재료 추가하러 가기" (빈 상태) → TODO.
- 실제 API/entities 연동은 추후 별도 작업.
