# 공용 응답/예외처리 핸들러 구현 스펙

## 폴더 구조

```
lib/
  api/
    response.ts   → 공통 응답 형식 정의
    errors.ts     → 커스텀 에러 클래스 및 자주 쓰는 에러 목록
    handler.ts    → withHandler 래퍼
```

---

## response.ts

모든 API 응답을 아래 두 가지 형태로 통일한다.

**성공 응답**

- `success: true`
- `data`: 실제 반환 데이터 (제네릭 타입, 기본값 null)

**실패 응답**

- `success: false`
- `error.code`: 프론트엔드 분기처리용 커스텀 에러코드
- `error.message`: 사용자에게 보여줄 메시지

성공/실패 응답 객체를 만들어주는 헬퍼 함수를 함께 작성한다.

---

## errors.ts

**AppError 클래스**

- `Error` 를 상속
- HTTP 상태코드, 커스텀 에러코드, 메시지 세 가지 필드를 가진다

**미리 정의해둘 에러 목록**

| 코드                    | HTTP | 설명                            |
| ----------------------- | ---- | ------------------------------- |
| `UNAUTHORIZED`          | 401  | 인증 토큰 없음 또는 만료        |
| `FORBIDDEN`             | 403  | 권한 없음 (타 유저 리소스 접근) |
| `NOT_FOUND`             | 404  | 리소스 없음                     |
| `VALIDATION_ERROR`      | 422  | 요청 파라미터 오류              |
| `INTERNAL_SERVER_ERROR` | 500  | 서버 오류                       |
| `EXTERNAL_API_ERROR`    | 502  | 외부 API 호출 실패              |

---

## handler.ts

모든 route.ts의 GET/POST/DELETE 등을 감싸는 `withHandler` 래퍼를 작성한다.

**처리 순서**

1. 핸들러 실행 성공 시 `successResponse` 로 감싸서 반환
2. 에러 발생 시 아래 순서로 분기처리

**에러 분기**

| 에러 종류                             | 처리 방식                              |
| ------------------------------------- | -------------------------------------- |
| AppError                              | 해당 statusCode, code, message 로 응답 |
| PrismaClientKnownRequestError (P2025) | 404 NOT_FOUND 로 응답                  |
| 그 외                                 | 500 INTERNAL_ERROR 로 응답             |

**환경별 콘솔 출력 분기**

`process.env.NODE_ENV` 로 환경을 구분한다.

| 환경        | AppError / Prisma 에러   | 예상 못한 에러 |
| ----------- | ------------------------ | -------------- |
| development | 콘솔에 스택트레이스 출력 | 항상 출력      |
| production  | 출력 안함                | 항상 출력      |
