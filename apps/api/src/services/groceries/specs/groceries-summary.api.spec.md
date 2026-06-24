# groceries 예산 및 지출액 조회 API 명세

## 목적

로그인한 사용자의 특정 월 장보기 예산과 지출 합계를 조회한다.

모든 요청과 응답 타입은 `packages/contract`의 groceries Zod 스키마를 단일 진실로 사용한다.

---

## 예산 및 지출액 조회

`GET /api/groceries/summary`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### Query Parameter

| 필드  | 타입   | 필수 | 설명                |
| ----- | ------ | ---- | ------------------- |
| year  | number | ✓    | 연도 (예: 2026)     |
| month | number | ✓    | 월 (1 이상 12 이하) |

### 응답 바디

| 필드   | 타입           | 설명                                    |
| ------ | -------------- | --------------------------------------- |
| budget | number \| null | 해당 월 예산. 설정하지 않은 경우 `null` |
| spent  | number         | 해당 월 지출 합계. 내역 없으면 `0`      |

### 응답 예시

```json
{ "budget": 100000, "spent": 30000 }
```

### 규칙

- `getCurrentMemberId`로 현재 사용자 확인. 인증 실패 시 `401` throw
- query의 `year`가 없거나 정수가 아니거나 1000 미만이거나 9999 초과이면 `400` 반환
- query의 `month`가 없거나 1 미만이거나 12 초과이면 `400` 반환
- `budget`은 `grocery_budgets`에서 `(user_id, year, month)` 기준으로 조회. 없으면 `null`
- `spent`는 `grocery_purchase_items`에서 `user_id`와 `purchased_at`이 해당 연월인 항목의 `price` 합계. 내역 없으면 `0`
- 모든 요청 검증은 `packages/contract`의 Zod 스키마로 처리한다

### 검증 기준

- 유효한 요청 시 `budget`과 `spent`를 담은 `200` 응답을 반환한다
- 해당 월 예산이 없으면 `budget`은 `null`을 반환한다
- 해당 월 구매 내역이 없으면 `spent`는 `0`을 반환한다
- `month`가 13이면 `400`을 반환한다
- 인증 실패 시 `401`을 반환한다
