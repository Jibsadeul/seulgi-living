# 카카오 인증 API 명세

## 목적

카카오 로그인과 자동 로그인을 위한 API 계약을 정의한다.

모든 요청과 응답 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 사용한다.

## 카카오 로그인

`POST /api/auth/kakao`

카카오 인가 코드를 우리 앱 access token과 refresh token으로 교환한다.

### 요청 본문

| 필드        | 타입   | 필수 | 설명                              |
| ----------- | ------ | ---- | --------------------------------- |
| code        | string | 예   | 카카오 OAuth 인가 코드            |
| redirectUri | string | 예   | 카카오 콘솔에 등록된 redirect URI |

### 응답

| 필드         | 타입     | 설명                  |
| ------------ | -------- | --------------------- |
| accessToken  | string   | 우리 앱 access token  |
| refreshToken | string   | 우리 앱 refresh token |
| member       | MemberMe | 현재 사용자 정보      |

`member`는 기존 `memberMeSchema`와 같은 형태이다.

```json
{
  "accessToken": "jwt",
  "refreshToken": "opaque_refresh_token",
  "member": {
    "id": "member_uuid",
    "nickname": null,
    "birthday": null,
    "sidoId": null,
    "sigunguId": null,
    "isBasicInfoComplete": false
  }
}
```

### 오류

| 상태 | 조건                                   |
| ---- | -------------------------------------- |
| 400  | 요청 본문 형식 오류                    |
| 401  | 카카오 인증 실패 또는 사용자 조회 실패 |
| 500  | 예상하지 못한 서버 오류                |

## 토큰 재발급

`POST /api/auth/refresh`

refresh token으로 새 access token과 refresh token을 발급한다.

### 요청 본문

| 필드         | 타입   | 필수 | 설명                  |
| ------------ | ------ | ---- | --------------------- |
| refreshToken | string | 예   | 우리 앱 refresh token |

### 응답

| 필드         | 타입   | 설명             |
| ------------ | ------ | ---------------- |
| accessToken  | string | 새 access token  |
| refreshToken | string | 새 refresh token |

```json
{
  "accessToken": "jwt",
  "refreshToken": "new_opaque_refresh_token"
}
```

### 오류

| 상태 | 조건                                               |
| ---- | -------------------------------------------------- |
| 400  | 요청 본문 형식 오류                                |
| 401  | refresh token 불일치, 만료, 회원 없음, soft delete |

## 인증 헤더

정식 인증이 필요한 API는 다음 헤더를 사용한다.

```text
Authorization: Bearer <accessToken>
```

access token 검증 성공 시 payload의 `sub`를 현재 member id로 사용한다.

## 기존 members API와의 연결

다음 API는 정식 인증 도입 후 Authorization 헤더를 기준으로 현재 사용자를 결정한다.

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/nickname/check`
- 사용자별 정책 scrap API
- 이후 추가되는 사용자별 데이터 API

개발용 `x-member-id` 임시 인증은 카카오 인증 구현 후 제거하거나 명시적인 개발 fallback으로만 제한한다.

## CORS / OPTIONS

모바일 앱과 Expo Web 개발 환경에서 호출 가능한 기존 CORS 정책을 유지한다.

인증 헤더를 사용하므로 허용 헤더에는 최소한 다음 값이 포함되어야 한다.

```text
Content-Type, Authorization
```

개발 fallback을 유지하는 동안에는 `x-member-id`도 허용할 수 있다.

## 검증 기준

- `POST /api/auth/kakao`는 contract 스키마로 검증된 응답을 반환한다.
- `POST /api/auth/refresh`는 contract 스키마로 검증된 응답을 반환한다.
- 인증이 필요한 API는 access token이 없으면 401을 반환한다.
- 만료되거나 잘못된 access token은 401을 반환한다.
- soft delete 회원의 access token은 401을 반환한다.
