# camera 분석 결과 저장 API 명세

## 목적

AI 분석 결과 수정 폼에서 사용자가 확인/수정한 영수증 또는 식재료 데이터를 저장한다.

기존 `POST /api/ai/camera`는 이미지 분석만 담당한다. 이 API는 분석 결과를 사용자가 확정한 뒤 `장보기 내역` 또는 `My 냉장고`에 저장하는 역할만 담당한다.

모든 요청 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 사용한다.

## 분석 결과 저장

`POST /api/ai/camera/results`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### 요청 본문

| 필드         | 타입                      | 필수 | 설명                                  |
| ------------ | ------------------------- | ---- | ------------------------------------- |
| source       | `RECEIPT \| INGREDIENT`   | 예   | 분석 출처                             |
| purchaseDate | string                    | 조건 | `YYYY-MM-DD`, `PURCHASE` 포함 시 필수 |
| destinations | `PURCHASE \| FRIDGE` 배열 | 예   | 저장 위치, 최소 1개 이상              |
| items        | CameraResultSaveItem 배열 | 예   | 저장할 항목 목록                      |

`CameraResultSaveItem`은 다음 필드를 포함한다.

| 필드     | 타입               | 필수 | 설명                    |
| -------- | ------------------ | ---- | ----------------------- |
| name     | string             | 예   | 품목명                  |
| category | IngredientCategory | 조건 | `FRIDGE` 포함 시 필수   |
| quantity | number             | 예   | 수량                    |
| unit     | string             | 예   | 단위                    |
| price    | number             | 조건 | `PURCHASE` 포함 시 필수 |

### 타입

```ts
type CameraResultSaveRequest = {
  source: 'RECEIPT' | 'INGREDIENT';
  purchaseDate?: string;
  destinations: Array<'PURCHASE' | 'FRIDGE'>;
  items: Array<{
    name: string;
    category?: IngredientCategory;
    quantity: number;
    unit: string;
    price?: number;
  }>;
};
```

`IngredientCategory`는 `packages/contract`의 냉장고 카테고리 enum을 사용한다.

```ts
type IngredientCategory =
  | 'VEGETABLE'
  | 'FRUIT'
  | 'MEAT'
  | 'SEAFOOD'
  | 'EGG_DAIRY'
  | 'GRAIN_NOODLE'
  | 'PROCESSED'
  | 'SAUCE_SEASONING'
  | 'OTHER';
```

### 응답

성공 시 `204 No Content`. 응답 바디 없음.

### 요청 예시

영수증 - 장보기 내역과 냉장고 모두 저장

```json
{
  "source": "RECEIPT",
  "purchaseDate": "2024-05-20",
  "destinations": ["PURCHASE", "FRIDGE"],
  "items": [
    {
      "name": "계란",
      "category": "EGG_DAIRY",
      "quantity": 10,
      "unit": "개",
      "price": 6000
    },
    {
      "name": "우유",
      "category": "EGG_DAIRY",
      "quantity": 1,
      "unit": "L",
      "price": 2500
    }
  ]
}
```

영수증 - 장보기 내역만 저장

```json
{
  "source": "RECEIPT",
  "purchaseDate": "2024-05-20",
  "destinations": ["PURCHASE"],
  "items": [
    {
      "name": "계란",
      "quantity": 10,
      "unit": "개",
      "price": 6000
    }
  ]
}
```

영수증 - 냉장고만 저장

```json
{
  "source": "RECEIPT",
  "destinations": ["FRIDGE"],
  "items": [
    {
      "name": "계란",
      "category": "EGG_DAIRY",
      "quantity": 10,
      "unit": "개"
    }
  ]
}
```

식재료 사진 - 냉장고 저장

```json
{
  "source": "INGREDIENT",
  "destinations": ["FRIDGE"],
  "items": [
    {
      "name": "계란",
      "category": "EGG_DAIRY",
      "quantity": 10,
      "unit": "개"
    },
    {
      "name": "우유",
      "category": "EGG_DAIRY",
      "quantity": 1,
      "unit": "L"
    }
  ]
}
```

### 규칙

- 요청 본문에서 `null`은 사용하지 않는다. 필요 없는 필드는 생략한다.
- `destinations`는 최소 1개 이상이어야 한다.
- `destinations`에는 중복 값을 허용하지 않는다.
- `source=INGREDIENT`이면 `destinations`는 `["FRIDGE"]`만 허용한다.
- `destinations`에 `PURCHASE`가 포함되면 `purchaseDate`는 필수다.
- `destinations`에 `PURCHASE`가 포함되면 모든 item의 `price`는 필수다.
- `destinations`에 `FRIDGE`가 포함되면 모든 item의 `category`는 필수다.
- `purchaseDate`는 `YYYY-MM-DD` 형식으로 받는다.
- `price`는 0 이상의 정수만 허용한다.
- `quantity`는 0보다 큰 숫자만 허용한다.
- 장보기 내역 저장 시 `grocery_purchase_items`에 현재 사용자의 구매 항목을 생성한다.
- 냉장고 저장 시 `fridge_ingredients`에 현재 사용자의 냉장고 재료를 생성한다.
- 장보기 내역과 냉장고를 모두 저장하는 경우 가능한 한 하나의 트랜잭션으로 처리한다.

### 오류

| 상태 | 조건                                    |
| ---- | --------------------------------------- |
| 400  | 요청 형식 오류 또는 조건부 필수 값 누락 |
| 401  | 인증 실패                               |
| 500  | 서버 내부 오류                          |

## 검증 기준

- 유효한 `RECEIPT` + `PURCHASE` 요청 시 `grocery_purchase_items`에 항목이 생성되고 `204`를 반환한다.
- 유효한 `RECEIPT` + `FRIDGE` 요청 시 `fridge_ingredients`에 항목이 생성되고 `204`를 반환한다.
- 유효한 `RECEIPT` + `PURCHASE`, `FRIDGE` 요청 시 두 저장소에 항목이 생성되고 `204`를 반환한다.
- 유효한 `INGREDIENT` 요청 시 `fridge_ingredients`에만 항목이 생성되고 `204`를 반환한다.
- `source=INGREDIENT`인데 `destinations`가 `["FRIDGE"]`가 아니면 `400`을 반환한다.
- `PURCHASE` 포함 요청에서 `purchaseDate`가 없으면 `400`을 반환한다.
- `PURCHASE` 포함 요청에서 item `price`가 없으면 `400`을 반환한다.
- `FRIDGE` 포함 요청에서 item `category`가 없으면 `400`을 반환한다.
- 요청 본문에 `null`이 포함되면 `400`을 반환한다.
- 인증 실패 시 `401`을 반환한다.
