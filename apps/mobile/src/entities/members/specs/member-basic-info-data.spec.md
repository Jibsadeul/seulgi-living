# members 기본 정보 데이터 명세

## 목적

사용자 기본 정보 입력과 수정에 필요한 members entity 데이터, 프론트엔드 API 계약 기대치를 정의한다.

실제 API 타입은 `packages/contract`의 members 관련 Zod 스키마를 단일 진실로 사용한다. 모바일 앱은 API DTO를 임의로 재선언하지 않는다.

## MemberBasicInfo

| 필드      | 타입   | 필수 | 설명                                |
| --------- | ------ | ---- | ----------------------------------- |
| nickname  | string | 예   | 사용자 닉네임                       |
| birthday  | string | 예   | `YYYY-MM-DD` 형식 생년월일          |
| sidoId    | string | 예   | 화면 선택 상태 구성을 위한 시/도 ID |
| sigunguId | string | 예   | 저장 대상 시/군/구 ID               |

## 검증 규칙

- `nickname`은 2자 이상 100자 미만이다.
- `birthday`는 PostgreSQL `date`로 저장 가능한 실제 날짜 문자열이다.
- 저장 요청에는 `sidoId`를 직접 보내지 않고 `sigunguId`로 거주지를 확정한다.
- `sigunguId` 유효성은 백엔드 members 서비스가 DB의 `sigungu.id` 존재 여부로 검증한다.

## 현재 사용자 조회

`GET /api/users/me`

| 필드                | 타입           | 설명                     |
| ------------------- | -------------- | ------------------------ |
| id                  | string         | 사용자 ID                |
| nickname            | string \| null | 사용자 닉네임            |
| birthday            | string \| null | `YYYY-MM-DD`             |
| sidoId              | string \| null | 시/도 ID                 |
| sigunguId           | string \| null | 시/군/구 ID              |
| isBasicInfoComplete | boolean        | 필수 기본 정보 완성 여부 |

요구사항:

- `isBasicInfoComplete`는 `nickname`, `birthday`, `sigunguId`가 모두 존재할 때 `true`로 본다.
- `sigunguId`가 있을 경우 프론트엔드 초기값 구성을 위해 `sidoId`도 함께 반환한다.

## 사용자 기본 정보 저장

`PATCH /api/users/me`

요청 본문:

| 필드      | 타입   | 필수 | 설명                |
| --------- | ------ | ---- | ------------------- |
| nickname  | string | 예   | 2자 이상 100자 미만 |
| birthday  | string | 예   | `YYYY-MM-DD`        |
| sigunguId | string | 예   | 선택한 시/군/구 ID  |

응답:

- 갱신된 현재 사용자 정보를 반환한다.
- 응답 형태는 `GET /api/users/me`에서 사용하는 사용자 기본 정보 필드를 포함한다.

오류:

| 상태 | 조건                      |
| ---- | ------------------------- |
| 400  | 입력값 형식 오류          |
| 401  | 인증되지 않은 사용자      |
| 404  | 존재하지 않는 `sigunguId` |
| 409  | 중복 닉네임               |

## 닉네임 중복 확인

`GET /api/users/nickname/check?nickname={nickname}`

| 필드      | 타입    | 설명           |
| --------- | ------- | -------------- |
| available | boolean | 사용 가능 여부 |

요구사항:

- 닉네임이 2자 미만이거나 100자 이상이면 400 오류를 반환한다.
- 현재 로그인한 사용자의 기존 닉네임은 사용 가능으로 처리한다.

## regions 의존

- members entity는 지역 목록 조회를 소유하지 않는다.
- 시/도와 시/군/구 목록 조회는 `entities/regions`와 `/api/regions/*` 계약을 사용한다.
- members 저장 계약은 선택된 `sigunguId`만 참조한다.
