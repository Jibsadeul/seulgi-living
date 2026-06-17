# recipes API 명세

## 목적

레시피 목록 조회 API를 정의한다.

사용자는 레시피 목록을 페이지 단위로 조회할 수 있고, 검색어와 필터를 조합해 원하는 레시피를 찾을 수 있어야 한다. 로그인 사용자는 각 레시피의 스크랩 여부를 함께 확인할 수 있다.

모든 요청과 응답 타입은 `packages/contract`의 recipe Zod 스키마를 단일 진실로 사용한다.

## 레시피 목록 조회

`GET /api/recipes`

인증은 선택이다. 로그인 사용자는 레시피별 실제 스크랩 여부를 응답하고, 비로그인 사용자는 `isSaved`를 `false`로 응답한다.

정식 인증 미들웨어가 아직 구현되지 않았으므로 API는 임시로 `x-member-id` 헤더를 현재 사용자 식별자로 사용한다.

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
- `x-member-id` 헤더가 있으면 해당 member를 현재 사용자로 보고 `recipe_scraps` 기준으로 `isSaved`를 계산한다.
- `x-member-id` 헤더가 없으면 mock DB 확인을 위해 `deletedAt`이 없는 첫 member를 현재 사용자로 사용한다.
- 사용할 수 있는 member가 없으면 비로그인 요청으로 보고 모든 레시피의 `isSaved`를 `false`로 응답한다.
- 정식 인증 도입 시 현재 사용자 확인은 `shared/middleware/auth.ts` 기반으로 교체한다.
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
- `x-member-id` 헤더가 없고 DB에 활성 member가 1개 있으면 해당 member의 스크랩 여부가 `isSaved`에 반영된다.
- 잘못된 페이지네이션 값은 오류로 응답된다.

## 레시피 단건 조회

`GET /api/recipes/[recipeId]`

인증은 선택이다. 로그인 사용자는 해당 레시피의 실제 스크랩 여부를 응답하고, 비로그인 사용자는 `isSaved`를 `false`로 응답한다.

정식 인증 미들웨어가 아직 구현되지 않았으므로 API는 임시로 `x-member-id` 헤더를 현재 사용자 식별자로 사용한다.

### 요청 예시

```text
/api/recipes/recipe0321
```

### 경로 파라미터

| 이름     | 타입   | 필수 여부 | 설명      |
| -------- | ------ | --------- | --------- |
| recipeId | string | 필수      | 레시피 ID |

### 응답

| 필드   | 타입         | 설명               |
| ------ | ------------ | ------------------ |
| scrap  | RecipeScrap  | 레시피 스크랩 정보 |
| recipe | RecipeDetail | 레시피 상세 정보   |

`RecipeScrap`은 다음 필드를 포함한다.

| 필드       | 타입    | 설명                      |
| ---------- | ------- | ------------------------- |
| scrapCount | number  | 레시피 전체 스크랩 수     |
| isSaved    | boolean | 요청 사용자의 스크랩 여부 |

`RecipeDetail`은 다음 필드를 포함한다.

| 필드           | 타입               | 설명                   |
| -------------- | ------------------ | ---------------------- |
| id             | string             | 레시피 ID              |
| authorNickname | string \| null     | 작성자 닉네임          |
| name           | string             | 레시피 이름            |
| category       | RecipeCategory     | 요리 종류              |
| cookingMethod  | CookingMethod      | 요리 방법              |
| mainImageUrl   | string             | 대표 이미지 URL        |
| ingredients    | RecipeIngredient[] | 재료 목록              |
| steps          | RecipeStep[]       | 조리 단계              |
| sodiumTip      | string \| null     | 저염 팁, 없으면 `null` |

`RecipeIngredient`는 다음 필드를 포함한다.

| 필드    | 타입     | 설명           |
| ------- | -------- | -------------- |
| section | string   | 재료 섹션 이름 |
| items   | string[] | 재료 항목 목록 |

`RecipeStep`은 다음 필드를 포함한다.

| 필드        | 타입           | 설명                         |
| ----------- | -------------- | ---------------------------- |
| imageUrl    | string \| null | 단계 이미지 URL, 없으면 null |
| description | string         | 단계 설명                    |

### 응답 예시

```json
{
  "scrap": {
    "scrapCount": 70,
    "isSaved": true
  },
  "recipe": {
    "id": "recipe0321",
    "authorNickname": "qwerty",
    "name": "닭날개조림",
    "category": "OTHER",
    "cookingMethod": "BRAISE",
    "mainImageUrl": "image-file-url-01.png",
    "ingredients": [
      {
        "section": "재료",
        "items": ["연두부 75g(3/4모)", "칵테일새우 20g(5마리)"]
      },
      {
        "section": "양념",
        "items": ["고추장 5숟갈"]
      }
    ],
    "steps": [
      {
        "imageUrl": "image-file-url-02.png",
        "description": "감자를 손질합니다."
      },
      {
        "imageUrl": null,
        "description": "양파를 손질합니다."
      }
    ],
    "sodiumTip": "저염간장을 사용합니다."
  }
}
```

### 규칙

- 데이터는 DB의 `recipes` 테이블을 기준으로 조회한다.
- 공개 레시피와 사용자 작성 레시피를 모두 조회 대상에 포함한다.
- `scrapCount`는 `recipe_scraps` 관계를 집계해서 계산한다.
- `isSaved`는 현재 사용자 기준 `recipe_scraps` 존재 여부로 계산한다.
- `x-member-id` 헤더가 있으면 해당 member를 현재 사용자로 본다.
- `x-member-id` 헤더가 없으면 mock DB 확인을 위해 `deletedAt`이 없는 첫 member를 현재 사용자로 사용한다.
- 사용할 수 있는 member가 없으면 비로그인 요청으로 보고 `isSaved`를 `false`로 응답한다.
- `authorNickname`은 작성자 정보가 있으면 작성자 닉네임, 없으면 `null`로 응답한다.
- `sodiumTip`이 없으면 `null`로 응답한다.
- 존재하지 않는 `recipeId`는 `404` 오류로 응답한다.
- 모든 응답은 `packages/contract`의 recipe Zod 스키마로 검증 후 반환한다.

## 검증 기준

- 존재하는 레시피 ID로 요청하면 `scrap`과 `recipe`를 포함한 상세 응답을 반환한다.
- 레시피 재료는 `section`, `items` 구조로 반환한다.
- 조리 단계는 `imageUrl`, `description` 구조로 반환하며 이미지가 없으면 `imageUrl: null`로 응답한다.
- 로그인 사용자는 해당 레시피의 실제 스크랩 여부를 확인할 수 있다.
- `x-member-id` 헤더가 없고 DB에 활성 member가 1개 있으면 해당 member의 스크랩 여부가 `isSaved`에 반영된다.
- 비로그인 사용자는 `isSaved`가 `false`로 응답된다.
- 존재하지 않는 레시피 ID는 `404` 오류로 응답된다.

## 레시피 스크랩 추가

`POST /api/recipes/:id/scrap`

인증이 필요하다. `getCurrentMemberId`로 현재 사용자를 확인하고, 반환값이 `undefined`면 `401`을 반환한다.

### 경로 파라미터

| 이름 | 타입   | 설명      |
| ---- | ------ | --------- |
| id   | string | 레시피 ID |

### 응답

성공 시 `204 No Content`를 반환한다. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 반환값이 `undefined`면 `401`을 반환한다.
- 존재하지 않는 레시피 ID면 `404`를 반환한다.
- 이미 스크랩한 레시피를 다시 요청하면 오류 없이 `204`를 반환한다 (멱등).
- 정식 인증 도입 시 `getCurrentMemberId` 내부 구현을 교체한다.

### 검증 기준

- 유효한 레시피 ID와 유효한 사용자로 요청하면 `recipe_scraps`에 레코드가 생성되고 `204`를 반환한다.
- 이미 스크랩된 레시피에 재요청해도 `204`를 반환하며 중복 레코드가 생기지 않는다.
- 존재하지 않는 레시피 ID는 `404`를 반환한다.
- `getCurrentMemberId`가 `undefined`를 반환하면 `401`을 반환한다.

## 레시피 스크랩 해제

`DELETE /api/recipes/:id/scrap`

인증이 필요하다. `getCurrentMemberId`로 현재 사용자를 확인하고, 반환값이 `undefined`면 `401`을 반환한다.

### 경로 파라미터

| 이름 | 타입   | 설명      |
| ---- | ------ | --------- |
| id   | string | 레시피 ID |

### 응답

성공 시 `204 No Content`를 반환한다. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 반환값이 `undefined`면 `401`을 반환한다.
- 존재하지 않는 레시피 ID면 `404`를 반환한다.
- 스크랩 레코드가 없는 경우 오류 없이 `204`를 반환한다 (멱등).
- 정식 인증 도입 시 `getCurrentMemberId` 내부 구현을 교체한다.

### 검증 기준

- 스크랩된 레시피에 요청하면 `recipe_scraps` 레코드가 삭제되고 `204`를 반환한다.
- 스크랩하지 않은 레시피에 요청해도 `204`를 반환한다.
- 존재하지 않는 레시피 ID는 `404`를 반환한다.
- `getCurrentMemberId`가 `undefined`를 반환하면 `401`을 반환한다.
