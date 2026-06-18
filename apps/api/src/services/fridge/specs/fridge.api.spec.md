# fridge API 명세

## 목적

로그인한 사용자의 냉장고에 재료를 추가한다.

모든 요청과 응답 타입은 `packages/contract`의 fridge Zod 스키마를 단일 진실로 사용한다.

## 재료 추가

`POST /api/fridge`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### 요청 바디

| 필드     | 타입               | 필수 | 설명                            |
| -------- | ------------------ | ---- | ------------------------------- |
| name     | string             | ✓    | 재료명 (1자 이상, 최대 50자)    |
| imageKey | string             | ✓    | 이미지 키 (1자 이상, 최대 50자) |
| category | IngredientCategory | ✓    | 카테고리 enum                   |
| quantity | number (양의 정수) | ✓    | 수량 (1 이상, 최대 999999)      |
| unit     | string             | ✓    | 단위 (1자 이상, 최대 10자)      |

### 요청 예시

```json
{
  "name": "우유",
  "imageKey": "MILK",
  "category": "EGG_DAIRY",
  "quantity": 2,
  "unit": "L"
}
```

### IngredientCategory enum

| 값              | 화면 표시명 |
| --------------- | ----------- |
| VEGETABLE       | 채소        |
| FRUIT           | 과일        |
| MEAT            | 육류        |
| SEAFOOD         | 수산물      |
| EGG_DAIRY       | 달걀·유제품 |
| GRAIN_NOODLE    | 곡류·면     |
| PROCESSED       | 가공식품    |
| SAUCE_SEASONING | 양념·소스   |
| OTHER           | 기타        |

### 응답

성공 시 `204 No Content`. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자 확인. 인증 실패 시 `401` throw
- 같은 이름의 재료가 이미 있어도 별도 행으로 추가 (중복 허용)
- `name`이 비어 있거나 50자 초과 시 `400` 반환
- `imageKey`가 비어 있거나 50자 초과 시 `400` 반환
- `quantity`가 1 미만이거나 999999 초과 시 `400` 반환
- `unit`이 비어 있거나 10자 초과 시 `400` 반환
- `category`가 enum 범위 밖이면 `400` 반환
- 모든 요청 검증은 `packages/contract`의 Zod 스키마로 처리한다

## 검증 기준

- 유효한 요청 시 `fridge_ingredients`에 레코드가 생성되고 `204`를 반환한다
- `name`이 비어 있으면 `400`을 반환한다
- `imageKey`가 비어 있으면 `400`을 반환한다
- `quantity`가 1 미만이거나 999999 초과이면 `400`을 반환한다
- `category`가 enum 범위 밖이면 `400`을 반환한다
- 인증 실패 시 `401`을 반환한다
- 같은 이름의 재료를 두 번 추가하면 `fridge_ingredients`에 별도 행 2개가 생성된다
