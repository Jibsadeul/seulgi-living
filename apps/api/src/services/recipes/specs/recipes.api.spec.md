# recipes API 명세

## 목적

레시피 목록 조회 API를 정의한다.

사용자는 레시피 목록을 페이지 단위로 조회할 수 있고, 검색어와 필터를 조합해 원하는 레시피를 찾을 수 있어야 한다. 로그인 사용자는 각 레시피의 스크랩 여부를 함께 확인할 수 있다.

모든 요청과 응답 타입은 `packages/contract`의 recipe Zod 스키마를 단일 진실로 사용한다.

## 레시피 목록 조회

`GET /api/recipes`

인증은 선택이다. 로그인 사용자는 레시피별 실제 스크랩 여부를 응답하고, 비로그인 사용자는 `isSaved`를 `false`로 응답한다.

### 요청 예시

```text
/api/recipes?page=1&size=20&sort=popular&cookingMethod=BOIL&cookingMethod=STEAM&category=SOUP_STEW
```

### 쿼리 파라미터

| 이름          | 타입             | 필수 여부 | 기본값 | 설명                           |
| ------------- | ---------------- | --------- | ------ | ------------------------------ |
| page          | number           | 선택      | 1      | 조회할 페이지 번호             |
| size          | number           | 선택      | 20     | 페이지당 제공하는 레시피 수    |
| sort          | RecipeSort       | 선택      | latest | 정렬 기준                      |
| keyword       | string           | 선택      | 없음   | 검색어                         |
| cookingMethod | CookingMethod[]  | 선택      | 없음   | 요리 방법 필터, 복수 선택 가능 |
| category      | RecipeCategory[] | 선택      | 없음   | 요리 종류 필터, 복수 선택 가능 |

### 정렬 기준

| 값      | 의미      | 정렬 기준                                              |
| ------- | --------- | ------------------------------------------------------ |
| latest  | 최신순    | `createdAt DESC`, 동률이면 `id DESC`                   |
| oldest  | 오래된 순 | `createdAt ASC`, 동률이면 `id ASC`                     |
| popular | 인기순    | 스크랩 수 `DESC`, 동률이면 `createdAt DESC`, `id DESC` |

### 요리 방법 필터

| 요청값   | 화면 표시명 |
| -------- | ----------- |
| GRILL    | 구이        |
| BOIL     | 끓이기      |
| STIR_FRY | 볶음        |
| STEAM    | 찜          |
| FRY      | 튀김        |
| BRAISE   | 조림        |
| PAN_FRY  | 부침        |
| OTHER    | 기타        |

### 요리 종류 필터

| 요청값        | 화면 표시명 |
| ------------- | ----------- |
| SOUP_STEW     | 국·찌개     |
| SIDE_DISH     | 반찬        |
| RICE_PORRIDGE | 밥·죽       |
| DESSERT       | 후식        |
| OTHER         | 기타        |

### 응답

| 필드        | 타입            | 설명                                 |
| ----------- | --------------- | ------------------------------------ |
| items       | RecipePreview[] | 레시피 목록                          |
| page        | number          | 현재 페이지 번호                     |
| size        | number          | 페이지당 제공하는 레시피 수          |
| totalCount  | number          | 현재 필터 조건에 맞는 전체 레시피 수 |
| hasNextPage | boolean         | 다음 페이지 존재 여부                |

`RecipePreview`는 다음 필드를 포함한다.

| 필드          | 타입           | 설명                      |
| ------------- | -------------- | ------------------------- |
| id            | string         | 레시피 ID                 |
| name          | string         | 레시피 이름               |
| category      | RecipeCategory | 요리 종류                 |
| cookingMethod | CookingMethod  | 요리 방법                 |
| imageUrl      | string         | 목록 이미지 URL           |
| scrapCount    | number         | 스크랩 수                 |
| isSaved       | boolean        | 요청 사용자의 스크랩 여부 |

### 응답 예시

```json
{
  "items": [
    {
      "id": "cm123abc",
      "name": "두부 김치찌개",
      "category": "SOUP_STEW",
      "cookingMethod": "BOIL",
      "imageUrl": "https://example.com/recipes/cm123abc-thumbnail.jpg",
      "scrapCount": 128,
      "isSaved": true
    }
  ],
  "page": 1,
  "size": 20,
  "totalCount": 1146,
  "hasNextPage": true
}
```

### 규칙

- 데이터는 DB의 `recipes` 테이블을 기준으로 조회한다.
- 기본 목록은 `source`가 `PUBLIC`인 레시피와 `USER`인 레시피를 모두 포함한다.
- `imageUrl`은 `thumbnailUrl`이 있으면 `thumbnailUrl`, 없으면 `mainImageUrl` 값을 응답한다.
- `keyword`는 레시피 `name`과 `ingredients`의 `items` 문자열을 대상으로 검색한다.
- `cookingMethod`가 여러 개 전달되면 해당 요리 방법 중 하나라도 일치하는 레시피를 조회한다.
- `category`가 여러 개 전달되면 해당 요리 종류 중 하나라도 일치하는 레시피를 조회한다.
- `cookingMethod` 필터와 `category` 필터가 함께 전달되면 두 필터 조건을 모두 만족해야 한다.
- `page`가 1보다 작으면 오류를 반환한다.
- `size`가 1보다 작으면 오류를 반환한다.
- `size`가 100보다 크면 오류를 반환한다.
- `sort`가 없으면 `latest`를 기본값으로 사용한다.
- `sort=popular`의 스크랩 수는 `recipe_scraps` 관계를 집계해서 계산한다.
- 필터 조건에 맞는 레시피가 없으면 `items`는 빈 배열, `totalCount`는 0, `hasNextPage`는 `false`로 응답한다.

## 검증 기준

- 기본 요청 `GET /api/recipes`는 첫 페이지를 `latest` 정렬로 반환한다.
- 검색어가 있으면 `name` 또는 `ingredients`의 `items` 문자열에 검색어가 포함된 레시피만 반환한다.
- 요리 방법과 요리 종류 필터는 각각 복수 선택을 지원한다.
- 로그인 사용자는 각 레시피의 실제 스크랩 여부를 확인할 수 있다.
- 비로그인 사용자는 모든 레시피의 `isSaved`가 `false`로 응답된다.
- 잘못된 페이지네이션 값은 오류로 응답된다.
