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
| level         | RecipeLevel[]    | 선택      | 없음   | 난이도 필터, 복수 선택 가능    |

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

### 난이도 필터

난이도는 `단계 수 + 재료 수` 합산 점수를 기준으로 계산한다.

- 단계 수: `recipe_steps` 테이블의 행 수
- 재료 수: `ingredients` JSONB 배열 내 전체 item 수 합산

| 요청값 | 화면 표시 | 합산 점수 기준 |
| ------ | --------- | -------------- |
| LOW    | 하        | 15 이하        |
| MEDIUM | 중        | 16 ~ 20        |
| HIGH   | 상        | 21 이상        |

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
- `level`이 여러 개 전달되면 해당 난이도 중 하나라도 일치하는 레시피를 조회한다.
- `level` 필터는 다른 필터와 AND 조건으로 결합된다.
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

## 레시피 등록

`POST /api/recipes`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

요청은 `multipart/form-data`로 전송한다. 이미지는 API 서버가 S3 호환 외부 스토리지에 업로드하고, DB에는 업로드된 이미지 URL만 저장한다.

### 요청 필드

| 이름              | 타입        | 필수 여부 | 설명                                                    |
| ----------------- | ----------- | --------- | ------------------------------------------------------- |
| mainImage         | File        | 필수      | 대표 이미지 파일                                        |
| name              | string      | 필수      | 레시피 이름                                             |
| cookingMethod     | string      | 필수      | `CookingMethod` enum 값                                 |
| category          | string      | 필수      | `RecipeCategory` enum 값                                |
| ingredients       | JSON string | 필수      | `RecipeIngredient[]`를 JSON.stringify한 문자열          |
| steps             | JSON string | 필수      | 조리 단계 `RecipeStepInput[]`을 JSON.stringify한 문자열 |
| sodiumTip         | string      | 선택      | 저나트륨 비법 노하우                                    |
| stepImages[index] | File        | 선택      | 조리 단계 이미지 파일                                   |

### 요청 예시

```text
mainImage = (대표 사진 파일)
name = 매콤 달콤 닭볶음탕
cookingMethod = BOIL
category = SOUP_STEW
ingredients = [{"section":"재료","items":["연두부 75g(3/4모)","칵테일새우 20g(5마리)"]},{"section":"양념","items":["고추장 5숟갈"]}]
steps = [{"description":"닭을 깨끗하게 씻고 끓는 물에 데친다.","imageUrl":null},{"description":"감자와 양파를 먹기 좋은 크기로 썬다.","imageUrl":null},{"description":"양념을 넣고 약한 불에서 졸인다.","imageUrl":null}]
stepImages[0] = (1번 조리 단계 이미지 파일)
stepImages[1] = (2번 조리 단계 이미지 파일)
sodiumTip = 간장 양을 줄이고 양파와 대파로 감칠맛을 보완한다.
```

`steps`의 이미지 매핑은 배열의 0-based index를 기준으로 한다. 예를 들어 `steps[0]` 단계의 이미지가 있으면 파일 필드명은 `stepImages[0]`이다. 이미지가 없는 단계는 해당 `stepImages[index]` 필드를 전송하지 않는다.

`RecipeStepInput`은 다음 필드를 포함한다.

| 필드        | 타입           | 필수 여부 | 설명                                        |
| ----------- | -------------- | --------- | ------------------------------------------- |
| description | string         | 필수      | 조리 단계 설명                              |
| imageUrl    | string \| null | 선택      | 등록 요청에서는 `null` 또는 생략만 허용한다 |

### 응답

성공 시 `201 Created`를 반환한다.

| 필드     | 타입   | 설명             |
| -------- | ------ | ---------------- |
| recipeId | string | 저장된 레시피 ID |

### 응답 예시

```json
{
  "recipeId": "4b8f9a6f-2e81-4d5d-b557-07a3f963d96a"
}
```

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 인증 실패 시 `getCurrentMemberId`가 `401`을 throw한다.
- `mainImage`가 없거나 이미지 파일이 아니면 `400` 오류를 반환한다.
- `stepImages[index]`는 이미지 파일일 때만 허용한다.
- 허용 이미지 MIME type은 `image/jpeg`, `image/png`, `image/webp`이다.
- 각 이미지 파일 크기는 5MB 이하여야 한다.
- `cookingMethod`는 `CookingMethod` enum 값만 허용한다. 화면 표시명인 `끓이기` 같은 값은 허용하지 않는다.
- `category`는 `RecipeCategory` enum 값만 허용한다. 화면 표시명인 `국&찌개` 같은 값은 허용하지 않는다.
- `ingredients`는 JSON 문자열이어야 하며, 파싱 결과는 `section`, `items` 구조여야 한다.
- `steps`는 JSON 문자열이어야 하며, 파싱 결과는 빈 `description`이 없는 `RecipeStepInput[]` 구조여야 한다.
- 등록 요청의 `steps[index].imageUrl`은 `null` 또는 생략만 허용한다.
- DB 저장 시 `recipes.source`는 `USER`, `recipes.user_id`는 현재 사용자 ID로 저장한다.
- `recipe_steps.step_number`는 `steps` 배열 순서 기준으로 1부터 저장한다.
- 대표 이미지는 `recipes.main_image_url`에 저장하고, `recipes.thumbnail_url`은 `null`로 저장한다.
- 단계 이미지는 `recipe_steps.image_url`에 저장하며, 이미지가 없는 단계는 `null`로 저장한다.
- 업로드 성공 후 DB 저장에 실패하면 업로드된 외부 스토리지 객체 삭제를 시도한다.

## 검증 기준

- 인증된 사용자가 정상 multipart 요청을 보내면 `recipes`와 `recipe_steps`가 생성되고 `{ recipeId }`를 반환한다.
- 인증되지 않은 요청은 `401`을 반환한다.
- 대표 이미지가 없는 요청은 `400`을 반환한다.
- 잘못된 enum 값은 `400`을 반환한다.
- 깨진 JSON 문자열 또는 잘못된 재료/단계 구조는 `400`을 반환한다.
- 등록 요청의 `steps[index].imageUrl`에 문자열 URL이 있으면 `400`을 반환한다.
- `stepImages[index]`가 없는 단계는 `imageUrl: null`로 저장된다.
- 등록 후 `GET /api/recipes/[recipeId]`로 상세 조회가 가능하다.

## 레시피 수정

`PUT /api/recipes/[recipeId]`

인증이 필요하다. 현재 사용자가 직접 작성한 레시피만 수정할 수 있다.

요청은 `multipart/form-data`로 전송한다. 이미지를 교체할 때는 파일을 보내고, 기존 이미지를 유지할 때는 기존 이미지 URL을 보낸다.

### 요청 필드

| 이름              | 타입        | 필수 여부 | 설명                                           |
| ----------------- | ----------- | --------- | ---------------------------------------------- |
| mainImage         | File        | 조건부    | 새 대표 이미지 파일                            |
| mainImageUrl      | string      | 조건부    | 기존 대표 이미지 유지 시 기존 URL              |
| name              | string      | 필수      | 레시피 이름                                    |
| cookingMethod     | string      | 필수      | `CookingMethod` enum 값                        |
| category          | string      | 필수      | `RecipeCategory` enum 값                       |
| ingredients       | JSON string | 필수      | `RecipeIngredient[]`를 JSON.stringify한 문자열 |
| steps             | JSON string | 필수      | `RecipeStepInput[]`을 JSON.stringify한 문자열  |
| sodiumTip         | string      | 선택      | 저나트륨 비법 노하우                           |
| stepImages[index] | File        | 선택      | 해당 단계의 새 이미지 파일                     |

`mainImage`와 `mainImageUrl` 중 정확히 하나는 필요하다.

### 요청 예시

```text
mainImageUrl = https://example.com/recipes/4b8f9/main.png
name = 매콤 닭볶음탕
cookingMethod = BOIL
category = SOUP_STEW
ingredients = [{"section":"재료","items":["닭 500g","감자 2개","양파 1개"]},{"section":"양념","items":["고추장 2숟갈","간장 1숟갈"]}]
steps = [{"description":"닭을 깨끗하게 씻고 끓는 물에 데친다.","imageUrl":"https://example.com/recipes/4b8f9/step-0.png"},{"description":"감자와 양파를 큼직하게 썬다.","imageUrl":null},{"description":"양념을 넣고 약한 불에서 졸인다.","imageUrl":null}]
stepImages[1] = (2번 조리 단계 새 이미지 파일)
sodiumTip = 저염 간장을 사용하고 간장 양을 줄인다.
```

### 응답

성공 시 `200 OK`를 반환한다.

| 필드     | 타입   | 설명             |
| -------- | ------ | ---------------- |
| recipeId | string | 수정된 레시피 ID |

### 응답 예시

```json
{
  "recipeId": "4b8f9a6f-2e81-4d5d-b557-07a3f963d96a"
}
```

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 인증 실패 시 `getCurrentMemberId`가 `401`을 throw한다.
- 존재하지 않는 레시피 ID는 요청 바디 검증보다 먼저 `404` 오류로 응답한다.
- `recipes.source`가 `USER`가 아니면 `403` 오류로 응답한다.
- `recipes.user_id`가 현재 사용자 ID와 다르면 `403` 오류로 응답한다.
- `mainImage`가 있으면 새 파일을 업로드하고 대표 이미지를 교체한다.
- `mainImageUrl`이 있으면 기존 대표 이미지 URL과 일치할 때만 유지한다.
- `mainImage`와 `mainImageUrl`이 모두 없거나 모두 있으면 `400` 오류로 응답한다.
- `steps[index].imageUrl`이 있으면 해당 레시피에 저장된 기존 단계 이미지 URL과 일치할 때만 유지한다.
- `stepImages[index]`가 있으면 새 파일을 업로드하고 해당 단계 이미지를 교체한다.
- 같은 index에 `steps[index].imageUrl`과 `stepImages[index]`가 모두 있으면 `400` 오류로 응답한다.
- `steps[index].imageUrl`도 없고 `stepImages[index]`도 없으면 해당 단계 이미지는 `null`로 저장한다.
- 이때 기존 단계 이미지가 있었다면 DB 저장 성공 후 기존 외부 스토리지 객체 삭제를 시도한다.
- 단계는 요청의 `steps` 배열 기준으로 전체 교체한다.
- 허용 이미지 MIME type은 `image/jpeg`, `image/png`, `image/webp`이다.
- 각 이미지 파일 크기는 5MB 이하여야 한다.
- 업로드 성공 후 DB 저장에 실패하면 새로 업로드한 외부 스토리지 객체 삭제를 시도한다.
- DB 저장 성공 후 더 이상 사용하지 않는 기존 외부 스토리지 객체 삭제를 시도한다.
- 모든 응답은 `packages/contract`의 recipe Zod 스키마로 검증 후 반환한다.

## 검증 기준

- 작성자가 정상 multipart 요청을 보내면 레시피 기본 정보와 단계가 수정되고 `{ recipeId }`를 반환한다.
- 작성자가 아닌 사용자는 `403` 오류를 받는다.
- 공개 레시피는 수정할 수 없다.
- 존재하지 않는 레시피 ID는 `404` 오류로 응답된다.
- 기존 대표 이미지 URL을 보내면 대표 이미지는 유지된다.
- 새 대표 이미지 파일을 보내면 대표 이미지가 교체된다.
- 기존 단계 이미지 URL을 보내면 해당 단계 이미지는 유지된다.
- 새 단계 이미지 파일을 보내면 해당 단계 이미지가 교체된다.
- 단계 이미지 URL과 파일이 모두 없는 단계는 `imageUrl: null`로 저장된다.
- 임의 외부 URL이나 해당 레시피에 속하지 않는 기존 이미지 URL은 `400` 오류로 응답된다.

## 레시피 삭제

`DELETE /api/recipes/[recipeId]`

인증이 필요하다. 현재 사용자가 직접 작성한 레시피만 삭제할 수 있다.

요청 바디는 없다.

### 응답

성공 시 `200 OK`를 반환한다.

응답 바디는 `null`이다.

```json
null
```

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 인증 실패 시 `getCurrentMemberId`가 `401`을 throw한다.
- 존재하지 않는 레시피 ID는 `404` 오류로 응답한다.
- `recipes.source`가 `USER`가 아니면 `403` 오류로 응답한다.
- `recipes.user_id`가 현재 사용자 ID와 다르면 `403` 오류로 응답한다.
- DB에서 레시피를 실제 삭제한다.
- 연결된 `recipe_steps`, `recipe_scraps`는 DB cascade로 함께 삭제된다.
- DB 삭제 성공 후 대표 이미지와 단계 이미지 외부 스토리지 객체 삭제를 시도한다.
- 외부 스토리지 객체 삭제에 실패해도 DB 삭제가 성공했다면 API 응답은 성공으로 유지한다.

## 검증 기준

- 작성자가 정상 요청을 보내면 레시피가 삭제되고 `null`을 반환한다.
- 삭제 후 해당 레시피는 단건 조회에서 `404` 오류로 응답된다.
- 작성자가 아닌 사용자는 `403` 오류를 받는다.
- 공개 레시피는 삭제할 수 없다.
- 존재하지 않는 레시피 ID는 `404` 오류로 응답된다.
- 인증 실패 시 `401` 오류로 응답된다.

## 레시피 스크랩 목록 조회

`GET /api/recipes/scraps`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

현재 사용자가 스크랩한 레시피 목록을 페이지 단위로 조회한다. 필터와 정렬 쿼리 파라미터는 받지 않고, 정렬은 스크랩 생성일 최신순으로 고정한다.

### 요청 예시

```text
/api/recipes/scraps?page=1&size=20
```

### 쿼리 파라미터

| 이름 | 타입   | 필수 여부 | 기본값 | 설명                        |
| ---- | ------ | --------- | ------ | --------------------------- |
| page | number | 선택      | 1      | 조회할 페이지 번호          |
| size | number | 선택      | 20     | 페이지당 제공하는 레시피 수 |

### 응답

응답 형식은 `GET /api/recipes`와 동일한 `RecipeListResponse`를 사용한다.

| 필드        | 타입            | 설명                        |
| ----------- | --------------- | --------------------------- |
| items       | RecipePreview[] | 스크랩한 레시피 목록        |
| page        | number          | 현재 페이지 번호            |
| size        | number          | 페이지당 제공하는 레시피 수 |
| totalCount  | number          | 전체 스크랩 레시피 수       |
| hasNextPage | boolean         | 다음 페이지 존재 여부       |

`RecipePreview`는 `GET /api/recipes`와 동일한 필드를 포함한다.

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
  "totalCount": 12,
  "hasNextPage": false
}
```

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 인증 실패 시 `getCurrentMemberId`가 `401`을 throw한다.
- 데이터는 `recipe_scraps`와 `recipes` 테이블을 기준으로 조회한다.
- 현재 사용자가 스크랩한 레시피만 반환한다.
- 정렬은 `recipe_scraps.created_at DESC`, 동률이면 `recipes.id DESC`로 고정한다.
- 필터와 정렬 쿼리 파라미터는 받지 않는다.
- `page`가 없으면 `1`을 기본값으로 사용한다.
- `size`가 없으면 `20`을 기본값으로 사용한다.
- `page`가 1보다 작으면 오류를 반환한다.
- `size`가 1보다 작으면 오류를 반환한다.
- `size`가 100보다 크면 오류를 반환한다.
- 각 레시피의 `isSaved`는 `true`로 응답한다.
- `scrapCount`는 `recipe_scraps` 관계를 집계해서 계산한다.
- `imageUrl`은 `thumbnailUrl`이 있으면 `thumbnailUrl`, 없으면 `mainImageUrl` 값을 응답한다.
- 스크랩한 레시피가 없으면 `items`는 빈 배열, `totalCount`는 0, `hasNextPage`는 `false`로 응답한다.

## 검증 기준

- 기본 요청 `GET /api/recipes/scraps`는 첫 페이지를 스크랩 생성일 최신순으로 반환한다.
- `page`, `size` 쿼리 파라미터로 페이지 단위 조회가 가능하다.
- 응답 형식은 `GET /api/recipes`와 동일하다.
- 모든 항목의 `isSaved`는 `true`로 응답된다.
- 스크랩한 레시피가 없으면 빈 목록과 `hasNextPage: false`를 반환한다.
- 잘못된 페이지네이션 값은 오류로 응답된다.
- 인증 실패 시 `401`을 반환한다.

## 레시피 스크랩 추가

`POST /api/recipes/:id/scrap`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### 경로 파라미터

| 이름 | 타입   | 설명      |
| ---- | ------ | --------- |
| id   | string | 레시피 ID |

### 응답

성공 시 `204 No Content`를 반환한다. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 인증 실패 시 `getCurrentMemberId`가 `401`을 throw한다.
- 존재하지 않는 레시피 ID면 `404`를 반환한다.
- 이미 스크랩한 레시피를 다시 요청하면 오류 없이 `204`를 반환한다 (멱등).
- 정식 인증 도입 시 `getCurrentMemberId` 내부 구현을 교체한다.

### 검증 기준

- 유효한 레시피 ID와 유효한 사용자로 요청하면 `recipe_scraps`에 레코드가 생성되고 `204`를 반환한다.
- 이미 스크랩된 레시피에 재요청해도 `204`를 반환하며 중복 레코드가 생기지 않는다.
- 존재하지 않는 레시피 ID는 `404`를 반환한다.
- 인증 실패 시 `401`을 반환한다.

## 레시피 스크랩 해제

`DELETE /api/recipes/:id/scrap`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### 경로 파라미터

| 이름 | 타입   | 설명      |
| ---- | ------ | --------- |
| id   | string | 레시피 ID |

### 응답

성공 시 `204 No Content`를 반환한다. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자를 확인한다. 인증 실패 시 `getCurrentMemberId`가 `401`을 throw한다.
- 존재하지 않는 레시피 ID면 `404`를 반환한다.
- 스크랩 레코드가 없는 경우 오류 없이 `204`를 반환한다 (멱등).
- 정식 인증 도입 시 `getCurrentMemberId` 내부 구현을 교체한다.

### 검증 기준

- 스크랩된 레시피에 요청하면 `recipe_scraps` 레코드가 삭제되고 `204`를 반환한다.
- 스크랩하지 않은 레시피에 요청해도 `204`를 반환한다.
- 존재하지 않는 레시피 ID는 `404`를 반환한다.
- 인증 실패 시 `401`을 반환한다.
