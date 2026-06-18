# 카카오 인증 백엔드 명세

## 목적

members 서비스는 카카오 OAuth 결과를 우리 앱의 회원 세션으로 교환하고, 자동 로그인에 필요한 토큰 재발급을 담당한다.

이번 범위는 카카오 로그인과 자동 로그인까지이다. 로그아웃, 회원 탈퇴, 다중 기기 세션 관리는 포함하지 않는다.

## 데이터 규칙

| 테이블        | 컬럼       | 규칙                                       |
| ------------- | ---------- | ------------------------------------------ |
| members       | kakao_id   | 카카오 회원번호, 필수, unique              |
| members       | email      | 카카오에서 제공된 경우만 저장, 없으면 null |
| members       | nickname   | 우리 앱 기본 정보 입력 전까지 null 가능    |
| members       | birthday   | 우리 앱 기본 정보 입력 전까지 null 가능    |
| members       | sigungu_id | 우리 앱 기본 정보 입력 전까지 null 가능    |
| refresh_token | user_id    | 사용자당 1개 refresh token만 유지          |
| refresh_token | token_hash | refresh token 원문이 아닌 hash 저장        |
| refresh_token | expires_at | refresh token 만료 시각                    |

`members.kakao_id`는 중복 회원 생성을 막기 위해 DB unique 제약을 가진다.

## 카카오 사용자 정보

서버는 카카오 token API와 user info API를 통해 다음 정보만 사용한다.

| 카카오 정보         | 사용처             | 비고                 |
| ------------------- | ------------------ | -------------------- |
| id                  | `members.kakao_id` | 필수                 |
| kakao_account.email | `members.email`    | 제공되지 않으면 null |

카카오 닉네임과 프로필 이미지는 이번 서비스 기본 정보로 사용하지 않는다.

## 로그인 처리

1. 모바일 앱이 카카오 인가 코드와 redirect URI를 전달한다.
2. 서버가 카카오 token API로 인가 코드를 카카오 access token으로 교환한다.
3. 서버가 카카오 user info API로 카카오 회원번호와 email을 조회한다.
4. `members.kakao_id`로 활성 회원을 조회한다.
5. 기존 회원이 있으면 해당 회원으로 로그인한다.
6. 기존 회원이 없으면 `members`를 생성한다.
7. access token과 refresh token을 발급한다.
8. refresh token 원문은 응답으로만 반환하고, DB에는 hash만 저장한다.

soft delete된 회원(`deletedAt` 존재)은 활성 회원으로 보지 않는다.

## 신규 회원 생성

신규 회원은 다음 초기값으로 생성한다.

| 필드      | 초기값                                 |
| --------- | -------------------------------------- |
| kakaoId   | 카카오 회원번호                        |
| email     | 카카오에서 제공되면 email, 아니면 null |
| nickname  | null                                   |
| birthday  | null                                   |
| sigunguId | null                                   |

신규 회원의 `isBasicInfoComplete`는 false이다.

## 기존 회원 로그인

기존 회원은 `members.kakao_id` 기준으로 찾는다.

- `email`이 새로 제공되었고 기존 값이 비어 있으면 저장할 수 있다.
- 카카오에서 email이 제공되지 않는다고 해서 기존 email을 null로 덮어쓰지 않는다.
- 기본 정보 완성 여부는 기존 `members` 기본 정보 규칙을 따른다.

## 토큰 정책

access token:

- JWT로 발급한다.
- 만료 시간은 15분이다.
- payload에는 최소한 `sub`, `type`, `iat`, `exp`를 포함한다.
- `sub`는 member id이다.
- `type`은 `access`이다.

refresh token:

- 예측 불가능한 opaque token으로 발급한다.
- 만료 시간은 14일이다.
- 원문은 DB에 저장하지 않는다.
- DB에는 hash와 만료 시각만 저장한다.
- 사용자당 1개만 유지한다.
- 새 로그인 또는 refresh 성공 시 기존 token hash를 새 값으로 교체한다.

## Refresh 처리

1. 클라이언트가 refresh token을 전달한다.
2. 서버가 refresh token hash를 계산한다.
3. `refresh_token.token_hash`와 비교한다.
4. 만료 시간이 지났으면 401을 반환한다.
5. 회원이 없거나 soft delete 상태이면 401을 반환한다.
6. 유효하면 새 access token과 새 refresh token을 발급한다.
7. DB에는 새 refresh token hash와 새 만료 시각을 저장한다.

Refresh token rotation을 사용하므로 refresh 성공 후 이전 refresh token은 사용할 수 없다.

## 오류 규칙

| 조건                              | 상태 |
| --------------------------------- | ---- |
| 요청 본문 형식 오류               | 400  |
| 카카오 인가 코드 교환 실패        | 401  |
| 카카오 사용자 조회 실패           | 401  |
| refresh token 없음 또는 형식 오류 | 400  |
| refresh token 불일치              | 401  |
| refresh token 만료                | 401  |
| 회원 없음 또는 soft delete        | 401  |

## 검증 기준

- 같은 `kakao_id`로 로그인하면 회원이 중복 생성되지 않는다.
- 신규 회원은 기본 정보 미완성 상태로 생성된다.
- 기존 회원은 기존 기본 정보 완성 여부를 유지한다.
- refresh token 원문이 DB에 저장되지 않는다.
- refresh 성공 시 이전 refresh token은 무효가 된다.
- 다중 기기 세션을 지원하지 않고 사용자당 하나의 refresh token만 유지한다.
