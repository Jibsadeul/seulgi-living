# CookSearchScreen

## 기능 정의

레시피 검색 진입 화면. `CookMainScreen`의 검색바를 터치하면 이 화면으로 이동한다.

- 검색 입력창에 자동 포커스
- 최근 검색어 목록 표시 (최대 10개, AsyncStorage 로컬 저장)
- 최근 검색어 개별 삭제(X 버튼) + 전체 삭제
- 검색어 제출 or 최근 검색어 터치 시 → `RecipeListAllScreen`으로 이동 (keyword 파라미터 전달)

## 데이터 흐름

```
[사용자 입력 / 최근 검색어 터치]
  → useRecentSearches('recent-searches:recipe') 에 저장
  → router.push('/(stack)/recipe-list-all', { keyword })
  → RecipeListAllScreen이 keyword를 받아 searchText 초기값으로 설정
```

- 저장소: AsyncStorage (기기 로컬)
- DB/API 변경: 없음

## 특이 사항

- 빈 상태: 최근 검색어가 없으면 목록 영역 비어있음
- `RecipeListAllScreen`은 `useLocalSearchParams`로 `keyword`를 받아 `searchText` 초기값으로 설정
- 최근 검색어 아이템: 시계 아이콘 + 텍스트 + X 삭제 버튼
