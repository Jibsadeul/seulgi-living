# regions API 명세

## 목적

사용자 기본 정보 입력에서 필요한 시/도와 시/군/구 목록 조회 API를 정의한다.

모든 요청과 응답 타입은 `packages/contract`의 region Zod 스키마를 단일 진실로 사용한다.

## 시/도 목록 조회

`GET /api/regions/sido`

### 응답

| 필드 | 타입   | 설명       |
| ---- | ------ | ---------- |
| id   | string | 시/도 ID   |
| name | string | 시/도 이름 |

## 시/군/구 목록 조회

`GET /api/regions/sigungu?sidoId={sidoId}`

### 응답

| 필드   | 타입   | 설명          |
| ------ | ------ | ------------- |
| id     | string | 시/군/구 ID   |
| sidoId | string | 상위 시/도 ID |
| name   | string | 시/군/구 이름 |

### 규칙

- `sidoId`가 없거나 존재하지 않으면 오류를 반환한다.
- 같은 시/도 안에서 선택 UI에 적합하도록 이름 오름차순으로 반환한다.
