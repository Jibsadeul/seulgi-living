# members 인증 세션 데이터 명세

## 목적

모바일 앱에서 우리 앱 access token과 refresh token을 저장하고, 앱 시작 시 자동 로그인 상태를 복원하는 규칙을 정의한다.

카카오 OAuth 실행 자체는 `features/member-login`이 담당한다. 이 spec은 저장된 우리 앱 세션과 API 요청 인증을 담당한다.

## 저장소

토큰은 `expo-secure-store`에 저장한다.

| 키           | 값                    |
| ------------ | --------------------- |
| accessToken  | 우리 앱 access token  |
| refreshToken | 우리 앱 refresh token |

카카오 access token은 장기 저장하지 않는다.

## 세션 상태

| 상태               | 설명                                   |
| ------------------ | -------------------------------------- |
| checking           | 앱 시작 시 저장된 토큰 확인 중         |
| authenticated      | access token으로 현재 사용자 확인 완료 |
| onboardingRequired | 로그인은 되었지만 기본 정보 미완성     |
| unauthenticated    | 토큰 없음 또는 refresh 실패            |

화면 분기:

- `authenticated` + `isBasicInfoComplete === true`: 홈 화면
- `authenticated` + `isBasicInfoComplete === false`: 기본 정보 입력 화면
- `unauthenticated`: 로그인 화면

## 자동 로그인 플로우

1. 앱 시작 시 SecureStore에서 access token과 refresh token을 읽는다.
2. 둘 중 하나라도 없으면 토큰을 삭제하고 로그인 화면으로 이동한다.
3. access token으로 `/api/users/me`를 호출한다.
4. 성공하면 member store를 갱신하고 기본 정보 완성 여부로 화면을 분기한다.
5. 401이면 refresh token으로 `/api/auth/refresh`를 호출한다.
6. refresh 성공 시 새 토큰을 저장하고 `/api/users/me`를 다시 호출한다.
7. refresh 실패 시 저장된 토큰을 삭제하고 로그인 화면으로 이동한다.

## API 요청 인증

API client는 저장된 access token이 있으면 다음 헤더를 붙인다.

```text
Authorization: Bearer <accessToken>
```

기존 개발용 `x-member-id` 헤더는 정식 인증 적용 후 제거하거나 개발 fallback으로만 제한한다.

## 401 처리

인증 API 요청에서 401이 발생하면 refresh를 한 번만 시도한다.

- refresh 성공: 새 access token으로 원 요청을 한 번 재시도한다.
- refresh 실패: 토큰 삭제 후 로그인 화면으로 이동한다.

무한 재시도를 막기 위해 같은 요청에서 refresh는 1회만 수행한다.

## 토큰 삭제 조건

다음 경우 SecureStore의 access token과 refresh token을 모두 삭제한다.

- 저장된 토큰 쌍이 불완전하다.
- refresh token이 만료되었거나 서버에서 거부되었다.
- `/api/users/me`가 refresh 후에도 401을 반환한다.
- 회원이 soft delete 상태이다.

## 검증 기준

- 앱 재시작 후 저장된 토큰으로 자동 로그인된다.
- 기본 정보가 미완성인 회원은 홈이 아니라 기본 정보 입력 화면으로 이동한다.
- access token 만료 시 refresh 후 현재 사용자 조회가 재시도된다.
- refresh 실패 시 로그인 화면으로 이동하고 토큰이 삭제된다.
- API client가 access token을 Authorization 헤더에 포함한다.
