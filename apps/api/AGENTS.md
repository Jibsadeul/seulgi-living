# apps/api — CLAUDE.md

> **참조 우선순위**: 전역 CLAUDE.md → 루트 CLAUDE.md → **이 파일**

---

## 역할

Next.js 기반 BFF(Backend for Frontend). DB 접근은 이 앱에서만. DDD-lite 아키텍처 적용.

---

## 도메인(Module) 목록

| 도메인     | 경로                  | 비고                          |
|-----------|-----------------------|------------------------------|
| members   | `modules/members/`    | 카카오 OAuth, JWT 발급         |
| recipes   | `modules/recipes/`    | 외부 레시피 API or DB          |
| policies  | `modules/policies/`   | 청년정책 API (data.go.kr)      |
| map       | `modules/map/`        | 카카오맵 API                   |
| fridge    | `modules/fridge/`     | 식재료 관리                    |
| groceries | `modules/groceries/`  | 장본 내용(영수증, 이미지)        |
| camera    | `modules/camera/`     | AI 이미지·영수증 분석           |
| chat      | `modules/chat/`       | Claude API                   |

---

## 디렉토리 구조

> `app/api/`는 **URL 구조** 기준, `src/modules/`는 **도메인 경계** 기준.  
> 이름이 일치하지 않아도 된다. (예: `auth/kakao/route.ts` → `modules/members/` 호출)

```
apps/api/
├── app/api/                      # Route Handlers (얇게 — service 호출만)
│   ├── recipes/route.ts
│   ├── policies/route.ts
│   ├── map/route.ts
│   ├── fridge/route.ts
│   ├── groceries/route.ts
│   ├── auth/kakao/route.ts       # → modules/members/
│   └── ai/
│       ├── chat/route.ts         # → modules/chat/
│       └── camera/route.ts       # → modules/camera/
└── src/
    ├── modules/                  # 도메인 모듈 (bounded context)
    │   └── {domain}/
    │       ├── specs/
    │       │   ├── {domain}.api.spec.md   # 엔드포인트 요청/응답 spec
    │       │   └── {domain}.spec.md       # 비즈니스 로직 spec
    │       ├── {domain}.service.ts        # 유스케이스/비즈니스 규칙
    │       ├── {domain}.repository.ts     # Prisma 접근 (@repo/db)
    │       └── {domain}.dto.ts            # @repo/contract 타입 사용
    └── shared/
        ├── external/             # 외부 API 클라이언트
        ├── lib/
        └── middleware/           # 인증 검증
```

---

## DDD-lite 레이어 규칙

상세 규칙: `@docs/architecture.md` — apps/api/ 구조 섹션 참조.

핵심: **Route Handler → Service → Repository** 순서로만 호출. 역방향 금지.

---

## 외부 API 목록

| API                       | 용도             | 클라이언트 파일             |
|---------------------------|-----------------|---------------------------|
| 청년정책 API (data.go.kr)  | 청년 정책 데이터  | `youth-policy.client.ts`  |
| 카카오맵 API               | 편의시설 위치     | `kakao-map.client.ts`     |
| 서울 열린데이터             | 편의시설 보완     | `seoul-data.client.ts`    |
| 카카오 OAuth               | 소셜 로그인       | —                         |
| Claude API                | AI 채팅·분석     | —                         |

---

## API 엔드포인트 규칙

- RESTful 준수
- 모든 응답은 `@repo/contract` 스키마로 검증 후 반환
- 인증 필요 엔드포인트는 `middleware/auth.ts`로 처리
- 외부 API 실패 시: 캐시 데이터 제공 또는 명확한 에러 반환

---

## 보안 규칙

- 개인 데이터(스크랩·냉장고·마이페이지): 인증된 사용자만
- 사용자 위치: 편의시설 검색 목적에만 사용, DB 저장 금지
- 환경변수: `.env.local`에만 보관, 커밋 금지
