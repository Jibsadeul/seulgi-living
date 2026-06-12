# apps/api - AGENTS.md

> Codex와 Claude가 함께 참조하는 API 앱 작업 규칙입니다.
> `apps/api` 내부 작업에만 적용하며, 루트 `AGENTS.md`의 공통 규칙을 보완합니다.

## 참조 우선순위

1. 전역 에이전트 규칙
2. 루트 `AGENTS.md`
3. 이 파일: `apps/api/AGENTS.md`
4. `docs/*.md` 상세 참고 문서

루트 규칙과 충돌하지 않는 범위에서, API 앱의 라우트/service/DB 접근 규칙은 이 파일을 우선합니다.

---

## 역할

Next.js 기반 BFF(Backend for Frontend)입니다. 모바일 앱이 필요한 API를 제공하고, DB 접근과 외부 API 연동을 담당합니다. DB 접근은 이 앱에서만 허용합니다.

---

## SDD 적용 위치

루트 `AGENTS.md`의 SDD 워크플로우를 따른다. API 앱에서 spec은 도메인 service 기준으로 둔다.

| 작업 단위            | spec 위치                                          |
| -------------------- | -------------------------------------------------- |
| 엔드포인트 요청/응답 | `src/services/{domain}/specs/{domain}.api.spec.md` |
| 비즈니스 로직        | `src/services/{domain}/specs/{domain}.spec.md`     |

---

## 도메인(Service) 목록

| 도메인    | 경로                      | 비고                      |
| --------- | ------------------------- | ------------------------- |
| members   | `src/services/members/`   | 카카오 OAuth, JWT 발급    |
| recipes   | `src/services/recipes/`   | 외부 레시피 API 또는 DB   |
| policies  | `src/services/policies/`  | 청년정책 API (data.go.kr) |
| map       | `src/services/map/`       | 카카오맵 API              |
| fridge    | `src/services/fridge/`    | 식재료 관리               |
| groceries | `src/services/groceries/` | 장보기 내역               |
| camera    | `src/services/camera/`    | AI 이미지/영수증 분석     |
| chat      | `src/services/chat/`      | AI 채팅                   |

---

## 참고 문서

| 문서            | 링크                                |
| --------------- | ----------------------------------- |
| API 아키텍처    | `apps/api/docs/architecture-api.md` |
| 기술 스택       | `apps/api/docs/tech-stack.md`       |
| API 엔드포인트  | @docs/api-contract.md               |
| DB 스키마 (ERD) | `apps/api/docs/erd.md`              |

---

## DDD-lite 레이어 규칙

호출 방향:

```text
Route Handler -> Service -> Repository
```

- Route Handler는 요청 파싱, 인증 연결, service 호출, 응답 반환만 담당한다.
- Service는 유스케이스와 비즈니스 규칙을 담당한다.
- Repository는 Prisma 접근만 담당한다.
- Repository에서 Service나 Route Handler를 import하지 않는다.
- `@repo/db` import는 repository 또는 DB 인프라 코드로 제한한다.
- DTO와 응답 검증은 `@repo/contract` 스키마를 기준으로 한다.

---

## URL과 도메인 매핑

| URL 경계          | 도메인 모듈          |
| ----------------- | -------------------- |
| `/api/auth/kakao` | `services/members`   |
| `/api/recipes`    | `services/recipes`   |
| `/api/policies`   | `services/policies`  |
| `/api/map`        | `services/map`       |
| `/api/fridge`     | `services/fridge`    |
| `/api/groceries`  | `services/groceries` |
| `/api/ai/camera`  | `services/camera`    |
| `/api/ai/chat`    | `services/chat`      |

---

## 외부 API 목록

| API                       | 용도             | 클라이언트 파일                    |
| ------------------------- | ---------------- | ---------------------------------- |
| 청년정책 API (data.go.kr) | 청년 정책 데이터 | `youth-policy.client.ts`           |
| 카카오맵 API              | 편의시설 위치    | `kakao-map.client.ts`              |
| 서울 열린데이터           | 편의시설 보완    | `seoul-data.client.ts`             |
| 카카오 OAuth              | 소셜 로그인      | 미정                               |
| AI Provider               | AI 채팅/분석     | `apps/api/docs/tech-stack.md` 기준 |

---

## API 코드 규칙

- 모든 응답은 `@repo/contract` 스키마로 검증 후 반환한다.
- 인증 필요 엔드포인트는 `shared/middleware/auth.ts`에서 검증한다.
- 외부 API 실패 시 캐시 데이터 제공 또는 명확한 에러를 반환한다.
- 개인 데이터(스크랩, 냉장고, 마이페이지)는 인증된 사용자만 접근할 수 있다.
- 사용자 위치는 편의시설 검색 목적에만 사용하고 DB에 저장하지 않는다.
- 환경변수는 `.env.local`에만 보관하고 커밋하지 않는다.
