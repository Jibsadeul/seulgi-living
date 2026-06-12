# API 아키텍처

> `apps/api` 전용 구조 문서입니다. 이 문서는 API 구조 설명의 단일 원본입니다. 다른 파일에 복사하지 않습니다.
> 공통 경계 규칙은 `@docs/architecture.md`를 따릅니다.

---

## 디렉토리 구조

`app/api/`는 URL 구조 기준, `src/services/`는 도메인 경계 기준입니다.
이름이 일치하지 않아도 되지만, 라우트는 반드시 해당 도메인 service를 호출합니다.

```
apps/api/
├── app/api/                  # Route Handlers (얇게 — service 호출만)
│   ├── {domain}/route.ts
│   ├── {domain}/route.ts
│   │   └── [id]/
│   │       └── route.ts      # 필요시
│   ├── {domain}/route.ts
│   └── {domain}/{sub}/route.ts # 필요시
└── src/
    ├── services/              # 도메인 모듈
    │   └── {domain}/
    │       ├── specs/
    │       │   └── {domain}.spec.md       # 도메인 비즈니스 로직 spec
    │       └── {domain}.service.ts        # dto, repository, service 로직을 한 번에 처리
    └── shared/
        ├── external/         # 외부 API 클라이언트
        ├── lib/
        └── middleware/       # 인증 검증
```

---

## DDD-lite 레이어 책임

호출 방향:

```
Route Handler → Service → Repository
```

| 레이어        | 책임                                          |
| ------------- | --------------------------------------------- |
| Route Handler | 요청 파싱, 인증 연결, service 호출, 응답 반환 |
| Service       | 유스케이스, 비즈니스 규칙                     |
| Repository    | Prisma 접근 (`@repo/db`)                      |
| DTO           | `@repo/contract` 스키마로 입출력 타입 정의    |

역방향 호출 금지. Repository는 Service나 Route Handler를 import하지 않습니다.

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

## shared 구조

```
src/shared/
├── external/                # 외부 API 클라이언트 (도메인이 아닌 인프라)
│   ├── youth-policy.client.ts   # data.go.kr 청년정책 API
│   ├── kakao-map.client.ts      # 편의시설 위치
│   └── claude-ai.client.ts      # AI 채팅
├── middleware/
│   └── auth.ts              # 카카오 토큰 검증, 로그인 여부 확인
├── lib/
│   ├── response.ts          # ApiResponse 래퍼 ({ data, error } 공통 포맷)
│   ├── error.ts             # AppError 클래스, 에러 코드 상수
│   └── cache.ts             # 외부 API 실패 시 캐싱 (정책 API 등)
└── config/
    └── env.ts               # 서버 환경변수 타입 안전하게 래핑
```
