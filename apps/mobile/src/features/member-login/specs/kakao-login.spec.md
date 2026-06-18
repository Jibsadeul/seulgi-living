# kakao-login 기능 명세

## 목적

`member-login` feature는 Expo AuthSession 기반 카카오 OAuth를 실행하고, 카카오 인가 코드를 우리 API 서버의 세션으로 교환한다.

## 범위

- 카카오 로그인 요청을 시작한다.
- AuthSession redirect URI를 생성한다.
- 카카오 로그인 성공 시 인가 코드를 추출한다.
- 인가 코드와 redirect URI를 `POST /api/auth/kakao`로 전달한다.
- 응답으로 받은 access token과 refresh token을 SecureStore에 저장한다.
- 응답의 member 정보로 화면 분기를 위한 결과를 반환한다.
- 로그인 중, 취소, 실패 상태를 관리한다.

카카오 네이티브 SDK 연동은 이번 범위에 포함하지 않는다.

## Redirect URI

개발 빌드 기준 redirect URI는 앱 scheme을 사용한다.

```text
seulgi-living://auth/kakao
```

카카오 콘솔에 등록된 redirect URI와 AuthSession에 전달하는 redirect URI는 정확히 같아야 한다.

카카오 REST API 키의 제약 때문에 https callback bridge를 사용하는 경우, feature는 최종적으로 앱에 돌아온 `code` 값을 기준으로 동작한다. bridge 구현 상세는 API/라우팅 spec에서 확정한다.

## 로그인 플로우

1. 사용자가 카카오 로그인 버튼을 누른다.
2. feature가 로그인 상태를 loading으로 변경한다.
3. AuthSession으로 카카오 OAuth URL을 연다.
4. 사용자가 카카오 로그인을 완료한다.
5. 앱 redirect URI로 복귀한다.
6. redirect 결과에서 `code`를 추출한다.
7. `POST /api/auth/kakao`를 호출한다.
8. 응답의 access token과 refresh token을 SecureStore에 저장한다.
9. 응답의 member 정보를 호출자에게 반환한다.

## 상태

| 상태      | 설명                                |
| --------- | ----------------------------------- |
| idle      | 로그인 전                           |
| loading   | 카카오 로그인 또는 API 교환 진행 중 |
| success   | 우리 앱 세션 발급 완료              |
| cancelled | 사용자가 로그인 과정을 취소         |
| error     | 카카오 인증 또는 API 교환 실패      |

## 성공 후 화면 분기

feature 자체는 화면 이동을 직접 결정하지 않는다. 호출한 screen이 member 정보를 기준으로 분기한다.

- `member.isBasicInfoComplete === true`: 홈 화면
- `member.isBasicInfoComplete === false`: 기본 정보 입력 화면

## 오류 처리

| 조건                      | 처리                                     |
| ------------------------- | ---------------------------------------- |
| 사용자가 로그인 취소      | 상태를 cancelled로 두고 로그인 화면 유지 |
| redirect 결과에 code 없음 | error 상태, 오류 안내                    |
| `/api/auth/kakao` 400/401 | error 상태, 오류 안내                    |
| 네트워크 오류             | error 상태, 재시도 가능                  |

오류가 발생하면 토큰을 저장하지 않는다.

## 검증 기준

- 로그인 버튼을 누르면 AuthSession 카카오 로그인 창이 열린다.
- 성공 시 `/api/auth/kakao`에 code와 redirectUri가 전달된다.
- 성공 응답의 토큰이 SecureStore에 저장된다.
- 신규 회원은 기본 정보 입력 화면으로 분기할 수 있는 결과를 반환한다.
- 기존 회원은 홈 화면으로 분기할 수 있는 결과를 반환한다.
- 취소/실패 시 로그인 화면에 머물고 토큰이 저장되지 않는다.
