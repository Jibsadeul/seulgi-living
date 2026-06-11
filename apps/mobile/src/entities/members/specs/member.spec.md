# member — 도메인 명세

## 목적
회원 인증 및 프로필 조회·수정 관련 도메인 로직을 담당한다.

---

## 데이터

### MemberDto (출력 · `@repo/contract/domains/user.ts` 에 정의)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 회원 UUID |
| nickname | string | 닉네임 |
| profileImageUrl | string \| null | 프로필 이미지 URL |
| createdAt | string | 가입 일시 (ISO 8601) |

### UpdateMemberDto (입력)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| nickname | string | - | 1–20자 |
| profileImageUrl | string \| null | - | presigned URL |

---

## 유스케이스
1. 카카오 로그인 → 서버 JWT 발급 → 로컬 저장
2. 내 프로필 조회 (`GET /users/me`)
3. 닉네임 / 프로필 이미지 수정 (`PATCH /users/me`)
4. 회원 탈퇴 (`DELETE /users/me`)

---

## 예외 / 엣지 케이스
- JWT 만료 시: refresh 시도 → 실패하면 로그아웃 후 로그인 화면으로 이동
- 비로그인 상태에서 보호된 기능 접근 시: 로그인 유도 바텀시트 표시
- 닉네임 중복 또는 금지어 포함 시: 인라인 에러 메시지 표시

---

## UI 상태
| 상태 | 설명 |
|------|------|
| loading | 회원 정보 서버 요청 중 |
| success | 정상 로드 완료 |
| error | 네트워크 또는 서버 오류 |
| unauthenticated | 미로그인 (토큰 없음) |
