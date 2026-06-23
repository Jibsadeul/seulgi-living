# groceries 장보기 내역 삭제 API 명세

## 목적

로그인한 사용자의 장보기 내역 단건을 삭제한다.

모든 요청 타입은 `packages/contract`의 groceries Zod 스키마를 단일 진실로 사용한다.

---

## 장보기 내역 삭제

`DELETE /api/groceries/[groceryId]`

인증이 필요하다. `getCurrentMemberId`가 인증 실패 시 `401`을 throw한다.

### Path Parameter

| 필드      | 타입   | 필수 | 설명             |
| --------- | ------ | ---- | ---------------- |
| groceryId | string | ✓    | 장보기 내역 UUID |

### 요청 바디

없음.

### 응답

성공 시 `204 No Content`. 응답 바디 없음.

### 규칙

- `getCurrentMemberId`로 현재 사용자 확인. 인증 실패 시 `401` throw
- `groceryId`가 UUID 형식이 아니면 `400` 반환
- 현재 사용자의 장보기 내역만 삭제할 수 있다
- 존재하지 않거나 현재 사용자 소유가 아니면 `404` 반환
- 삭제는 `grocery_purchase_items` row를 실제 삭제한다
- 모든 요청 검증은 `packages/contract`의 Zod 스키마로 처리한다

### 검증 기준

- 유효한 요청 시 장보기 내역이 삭제되고 `204`를 반환한다
- 다른 사용자의 장보기 내역 삭제 요청은 `404`를 반환한다
- 존재하지 않는 `groceryId`는 `404`를 반환한다
- `groceryId`가 UUID 형식이 아니면 `400`을 반환한다
- 인증 실패 시 `401`을 반환한다
