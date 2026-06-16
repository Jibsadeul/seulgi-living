# members 기본 정보 API 명세

## 목적

사용자 기본 정보 바텀시트에서 필요한 현재 사용자 조회, 기본 정보 저장, 닉네임 중복 확인 API를 정의한다.

모든 요청과 응답 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 사용한다.

## 현재 사용자 조회

`GET /api/users/me`

현재 로그인한 사용자 기본 정보와 필수 기본 정보 완성 여부를 반환한다.

### 응답

| 필드                | 타입           | 설명                     |
| ------------------- | -------------- | ------------------------ |
| id                  | string         | 사용자 ID                |
| nickname            | string \| null | 사용자 닉네임            |
| birthday            | string \| null | `YYYY-MM-DD`             |
| sidoId              | string \| null | 시/도 ID                 |
| sigunguId           | string \| null | 시/군/구 ID              |
| isBasicInfoComplete | boolean        | 필수 기본 정보 완성 여부 |

### 규칙

- `isBasicInfoComplete`는 `nickname`, `birthday`, `sigunguId`가 모두 존재할 때 `true`다.
- `sigunguId`가 있으면 프론트엔드 초기값 구성을 위해 `sidoId`도 함께 반환한다.

## 사용자 기본 정보 저장

`PATCH /api/users/me`

### 요청 본문

| 필드      | 타입   | 필수 | 설명                |
| --------- | ------ | ---- | ------------------- |
| nickname  | string | 예   | 2자 이상 100자 미만 |
| birthday  | string | 예   | `YYYY-MM-DD`        |
| sigunguId | string | 예   | 선택한 시/군/구 ID  |

### 응답

갱신된 현재 사용자 정보를 반환한다. 응답 형태는 `GET /api/users/me`와 같다.

### 오류

| 상태 | 조건                         |
| ---- | ---------------------------- |
| 400  | 입력값 형식 오류             |
| 401  | 현재 사용자를 확인할 수 없음 |
| 404  | 존재하지 않는 `sigunguId`    |
| 409  | 중복 닉네임                  |

## 닉네임 중복 확인

`GET /api/users/nickname/check?nickname={nickname}`

### 응답

| 필드      | 타입    | 설명           |
| --------- | ------- | -------------- |
| available | boolean | 사용 가능 여부 |

### 규칙

- 닉네임이 2자 미만이거나 100자 이상이면 400 오류를 반환한다.
- 현재 사용자의 기존 닉네임은 사용 가능으로 처리한다.
- `deletedAt`이 있는 사용자는 중복 검사 대상에서 제외한다.

## 임시 인증 연결

정식 인증 미들웨어가 아직 구현되지 않았으므로 API는 다음 순서로 현재 사용자를 결정한다.

1. `x-member-id` 헤더가 있으면 해당 member를 현재 사용자로 사용한다.
2. 헤더가 없으면 mock DB 확인을 위해 `deletedAt`이 없는 첫 member를 현재 사용자로 사용한다.
3. 찾을 수 없으면 401 오류를 반환한다.

정식 인증 도입 시 이 연결부는 `shared/middleware/auth.ts` 기반으로 교체한다.
