# regions 데이터 명세

## 목적

여러 화면에서 공통으로 사용하는 시/도와 시/군/구 지역 목록 데이터, 프론트엔드 API 계약 기대치를 정의한다.

실제 API 타입은 `packages/contract`의 region Zod 스키마를 단일 진실로 사용한다. 모바일 앱은 API DTO를 임의로 재선언하지 않는다.

## Sido

| 필드 | 타입   | 설명                  |
| ---- | ------ | --------------------- |
| id   | string | `sido.id`, varchar(2) |
| name | string | 시/도 이름            |

## Sigungu

| 필드   | 타입   | 설명                     |
| ------ | ------ | ------------------------ |
| id     | string | `sigungu.id`, varchar(5) |
| sidoId | string | 상위 시/도 ID            |
| name   | string | 시/군/구 이름            |

## 시/도 목록 조회

`GET /api/regions/sido`

응답:

| 필드 | 타입   | 설명       |
| ---- | ------ | ---------- |
| id   | string | 시/도 ID   |
| name | string | 시/도 이름 |

## 시/군/구 목록 조회

`GET /api/regions/sigungu?sidoId={sidoId}`

응답:

| 필드   | 타입   | 설명          |
| ------ | ------ | ------------- |
| id     | string | 시/군/구 ID   |
| sidoId | string | 상위 시/도 ID |
| name   | string | 시/군/구 이름 |

요구사항:

- `sidoId`가 없거나 존재하지 않으면 오류를 반환한다.
- 같은 시/도 안에서는 선택 UI에 적합한 정렬 순서로 반환한다.

## 소유권

- 지역 목록 조회와 타입은 `entities/regions`가 소유한다.
- 사용자 기본 정보 저장은 `members`가 소유하며, 선택된 `sigunguId`만 저장 요청에 사용한다.
