# groceries 장보기 내역 조회 API 명세

## 목적

로그인한 사용자의 특정 월 장보기 내역을 구매일별로 그룹화해서 조회한다.

모든 요청과 응답 타입은 `packages/contract`의 groceries Zod 스키마를 단일 진실로 사용한다.

---

## 장보기 내역 조회

`GET /api/groceries`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### Query Parameter

| 필드  | 타입   | 필수 | 설명                |
| ----- | ------ | ---- | ------------------- |
| year  | number | ✓    | 연도 (예: 2026)     |
| month | number | ✓    | 월 (1 이상 12 이하) |

### 응답 바디

```json
[
  {
    "date": "2024-05-14",
    "dailyTotal": 42500,
    "items": [
      {
        "id": "uuid",
        "name": "국산 햇감자",
        "price": 5200,
        "purchaseDate": "2024-05-14",
        "quantityText": "1개"
      }
    ]
  }
]
```

### 규칙

- `getCurrentMemberId`로 현재 사용자 확인. 인증 실패 시 `401` throw
- query의 `year`이 정수가 아니거나 1000 미만이거나 9999 초과이면 `400` 반환
- query의 `month`가 1 미만이거나 12 초과이면 `400` 반환
- `grocery_purchase_items`에서 현재 사용자와 해당 연월의 `purchased_at` 기준으로 조회한다
- 응답 그룹은 `date` 기준 내림차순, 즉 구매일 최신순으로 정렬한다
- 각 그룹의 `items`는 `createdAt DESC`, `id DESC` 순으로 정렬한다
- `date`는 `YYYY-MM-DD` 형식 문자열로 반환한다
- 각 item의 `purchaseDate`는 수정 폼 초기값으로 사용할 수 있도록 해당 item의 구매일을 `YYYY-MM-DD` 형식 문자열로 반환한다
- `dailyTotal`은 해당 날짜 items의 `price` 합계다
- 내역이 없으면 빈 배열 `[]`을 반환한다
- `quantityText`는 DB 값이 없으면 `null`로 반환한다
- 모든 요청/응답 검증은 `packages/contract`의 Zod 스키마로 처리한다

### 검증 기준

- 유효한 요청 시 날짜별 그룹 목록을 `200`으로 반환한다
- 내역이 없는 월은 `[]`를 반환한다
- 그룹은 구매일 최신순으로 정렬된다
- 그룹 내부 items는 `createdAt DESC`, `id DESC` 순으로 정렬된다
- `month`가 13이면 `400`을 반환한다
- 인증 실패 시 `401`을 반환한다
