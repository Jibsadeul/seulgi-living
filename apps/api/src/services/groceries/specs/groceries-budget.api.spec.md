# groceries 예산 설정 API 명세

## 목적

로그인한 사용자의 월별 장보기 예산을 설정한다. 해당 월 예산이 없으면 생성하고, 있으면 덮어쓴다(upsert).

모든 요청과 응답 타입은 `packages/contract`의 groceries Zod 스키마를 단일 진실로 사용한다.

---

## 예산 설정

`PUT /api/groceries/budget`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### Query Parameter

| 필드  | 타입   | 필수 | 설명                |
| ----- | ------ | ---- | ------------------- |
| year  | number | ✓    | 연도 (예: 2026)     |
| month | number | ✓    | 월 (1 이상 12 이하) |

### 요청 바디

| 필드   | 타입   | 필수 | 설명                           |
| ------ | ------ | ---- | ------------------------------ |
| budget | number | ✓    | 예산 (0 이상, 최대 99,999,999) |

### 요청 예시

```json
{ "budget": 300000 }
```

### 응답

성공 시 `204 No Content`. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자 확인. 인증 실패 시 `401` throw
- `(user_id, year, month)` 조합으로 upsert 처리
- query의 `year`가 없거나 정수가 아니거나 1000 미만이거나 9999 초과이면 `400` 반환
- query의 `month`가 없거나 1 미만이거나 12 초과이면 `400` 반환
- `budget`이 0 미만이거나 99,999,999 초과이면 `400` 반환
- 모든 요청 검증은 `packages/contract`의 Zod 스키마로 처리한다

### 검증 기준

- 유효한 요청 시 `grocery_budgets`에 레코드가 생성 또는 수정되고 `204`를 반환한다
- 같은 `(user_id, year, month)`로 두 번 요청하면 두 번째 요청의 `budget`으로 덮어쓴다
- `budget`이 0이면 0으로 저장한다 (삭제 아님)
- `month`가 13이면 `400`을 반환한다
- `budget`이 음수이면 `400`을 반환한다
- 인증 실패 시 `401`을 반환한다

---

## 신규 DB 테이블 — `grocery_budgets`

| 컬럼       | 타입        | 제약                      |
| ---------- | ----------- | ------------------------- |
| id         | UUID        | PK, NOT NULL              |
| user_id    | UUID        | FK → members.id, NOT NULL |
| year       | INTEGER     | NOT NULL                  |
| month      | INTEGER     | NOT NULL (1–12)           |
| budget     | INTEGER     | NOT NULL                  |
| created_at | TIMESTAMPTZ | NOT NULL                  |

UNIQUE(user_id, year, month)
