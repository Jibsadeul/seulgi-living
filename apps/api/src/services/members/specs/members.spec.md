# members 기본 정보 백엔드 명세

## 목적

members 서비스는 사용자 기본 정보 저장과 조회에 필요한 비즈니스 규칙을 담당한다.

## 데이터 규칙

| 테이블  | 컬럼       | 타입         | 설명            |
| ------- | ---------- | ------------ | --------------- |
| members | nickname   | varchar(100) | 사용자 닉네임   |
| members | birthday   | date         | 생년월일        |
| members | sigungu_id | varchar(5)   | `sigungu.id` FK |
| sigungu | id         | varchar(5)   | 시/군/구 ID     |

## 검증 규칙

- `nickname`은 앞뒤 공백을 제거한 값을 기준으로 저장한다.
- `nickname`은 2자 이상 100자 미만이다.
- `birthday`는 실제 존재하는 `YYYY-MM-DD` 날짜여야 하며 DB에는 PostgreSQL `date`로 저장한다.
- `sigunguId`는 DB에 존재해야 한다.
- `sigunguId`가 있으면 연결된 `sidoId`를 조회 응답에 포함한다.
- `deletedAt`이 있는 member는 닉네임 중복 검사 대상에서 제외한다.

## 닉네임 중복 정책

- 저장 전 API에서 동일 닉네임을 가진 다른 활성 사용자가 있는지 검사한다.
- 동일 사용자의 기존 닉네임은 중복으로 보지 않는다.
- DB unique index는 기존 mock 데이터 중복 여부와 삭제 사용자 정책 확정 후 별도 마이그레이션으로 적용한다.

## 필수 기본 정보 완성 기준

다음 값이 모두 존재하면 `isBasicInfoComplete`를 `true`로 반환한다.

- `nickname`
- `birthday`
- `sigunguId`

## 검증 기준

- 현재 사용자 조회 응답만으로 edit 모드 초기값을 구성할 수 있다.
- 기본 정보 저장 후 갱신된 사용자 정보가 반환된다.
- 중복 닉네임 저장 시 409 오류를 반환한다.
- 존재하지 않는 `sigunguId` 저장 시 404 오류를 반환한다.
