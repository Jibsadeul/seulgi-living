# groceries 장보기 내역 추가 API 명세

## 목적

로그인한 사용자의 장보기 내역을 직접 추가한다.

모든 요청 타입은 `packages/contract`의 groceries Zod 스키마를 단일 진실로 사용한다.

---

## 장보기 내역 추가

`POST /api/groceries`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### 요청 바디

| 필드         | 타입   | 필수 | 설명                                   |
| ------------ | ------ | ---- | -------------------------------------- |
| name         | string | ✓    | 품목명. 1자 이상 50자 이하             |
| price        | number | ✓    | 가격. 정수, 0 이상                     |
| purchaseDate | string | ✓    | 구매일. `YYYY-MM-DD` 형식              |
| quantityText | string |      | 수량 텍스트. 있으면 1자 이상 20자 이하 |

### 요청 예시

```json
{
  "name": "삼겹살",
  "price": 14800,
  "purchaseDate": "2024-05-05",
  "quantityText": "400g"
}
```

수량 정보가 없으면 `quantityText`를 생략한다.

```json
{
  "name": "삼겹살",
  "price": 14800,
  "purchaseDate": "2024-05-05"
}
```

### 응답

성공 시 `204 No Content`. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자 확인. 인증 실패 시 `401` throw
- `name`이 비어 있거나 50자를 초과하면 `400` 반환
- `price`가 정수가 아니거나 0 미만이면 `400` 반환
- `purchaseDate`가 `YYYY-MM-DD` 형식이 아니면 `400` 반환
- `quantityText`가 있으면 1자 이상 20자 이하이어야 한다
- 요청에서 `quantityText`가 생략되면 DB에는 `null`로 저장한다
- `grocery_purchase_items`에 현재 사용자 기준으로 저장한다
- 모든 요청 검증은 `packages/contract`의 Zod 스키마로 처리한다

### 검증 기준

- 유효한 요청 시 장보기 내역이 생성되고 `204`를 반환한다
- `quantityText`가 생략된 요청은 `quantity_text`를 `null`로 저장한다
- `price`가 0이면 유효한 요청으로 처리한다
- `price`가 음수이면 `400`을 반환한다
- `purchaseDate` 형식이 잘못되면 `400`을 반환한다
- 인증 실패 시 `401`을 반환한다
