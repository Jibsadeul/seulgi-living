# 레시피 API 연동 (`entities/recipes`)

> 모바일 앱의 `entities/recipes` API 레이어를 구현하고, 기존 mock 데이터를 사용하던 화면들을 실제 API 호출로 교체한다.

## 범위

### Entity 레이어 (`entities/recipes/`)

| 파일                     | 역할                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `api/recipes.schema.ts`  | `@repo/contract`의 레시피 타입 재export                                                                          |
| `api/keys.ts`            | TanStack Query 키 팩토리                                                                                         |
| `api/queries.ts`         | `useRecipeList` (페이지 단위), `useRecipeListInfinite` (무한 스크롤), `useRecipeDetail`, `useScrappedRecipeList` |
| `api/mutations.ts`       | `useRecipeScrap` (낙관적 업데이트 포함)                                                                          |
| `model/recipes.model.ts` | API 데이터 → UI 태그 매핑 (`getCategoryTag`, `getCookingMethodTag`)                                              |
| `model/useRecipe.ts`     | queries/mutations를 조합한 퍼사드 훅 (필요 시)                                                                   |
| `model/recipes.store.ts` | 클라이언트 상태 (필요 시, 현재는 미사용 예상)                                                                    |
| `index.ts`               | 배럴 export 업데이트                                                                                             |

### Query 패턴

| 훅                      | 사용 화면                                                  | 패턴                             |
| ----------------------- | ---------------------------------------------------------- | -------------------------------- |
| `useRecipeList`         | CookMainScreen (미리보기 3건), RecipeListBySituationScreen | `useQuery` + 페이지 단위         |
| `useRecipeListInfinite` | RecipeListAllScreen                                        | `useInfiniteQuery` + 무한 스크롤 |
| `useRecipeDetail`       | RecipeDetailScreen                                         | `useQuery`                       |
| `useRecipeScrap`        | 전 화면 공통                                               | `useMutation` + 낙관적 업데이트  |

### 화면 교체 대상

| 화면                          | 현재                     | 변경                                           |
| ----------------------------- | ------------------------ | ---------------------------------------------- |
| `CookRecipeSection`           | 로컬 MOCK_RECIPES 배열   | `useRecipeList({ page: 1, size: 3 })`          |
| `RecipeDetailScreen`          | MOCK_DETAIL 객체         | `useRecipeDetail(id)`                          |
| `RecipeListAllScreen`         | MOCK_RECIPES + 로컬 필터 | `useRecipeListInfinite` + API 필터 파라미터    |
| `RecipeListBySituationScreen` | 카테고리별 MOCK_RECIPES  | `useRecipeList` + category 필터 + 페이지네이션 |

## 낙관적 업데이트 (스크랩)

- `useMutation`으로 `POST /api/recipes/:id/scrap` 또는 `DELETE /api/recipes/:id/scrap` 호출
- `onMutate`: 관련 query 캐시의 `isSaved`, `scrapCount`를 즉시 업데이트
- `onError`: 이전 캐시로 롤백 + 토스트 에러 표시
- `onSettled`: 관련 query 키 무효화

## 태그 매핑 규칙

| API 값             | UI 라벨 | 태그 variant |
| ------------------ | ------- | ------------ |
| `SOUP_STEW`        | 국/찌개 | blue         |
| `SIDE_DISH`        | 반찬    | green        |
| `RICE_PORRIDGE`    | 밥/죽   | blue         |
| `DESSERT`          | 후식    | pink         |
| `OTHER` (category) | 기타    | grey         |
| `GRILL`            | 구이    | orange       |
| `BOIL`             | 끓이기  | orange       |
| `STIR_FRY`         | 볶음    | yellow       |
| `STEAM`            | 찜      | orange       |
| `FRY`              | 튀김    | orange       |
| `BRAISE`           | 조림    | orange       |
| `PAN_FRY`          | 부침    | orange       |
| `OTHER` (method)   | 기타    | grey         |

## 로딩/에러/빈 상태

- 목록 로딩: Skeleton UI (PRD 요구사항)
- API 에러: 에러 메시지 표시
- 검색 결과 0건: Empty State + 전체보기 유도 (PRD 요구사항)
- 상세 로딩: Skeleton UI
- 상세 404: "레시피를 찾을 수 없습니다" + 뒤로가기
