# 아키텍처

> 수정 시 팀 합의 필요. 개인 단독 수정 금지.
> 이 문서는 모노레포 전체 구조와 앱 간 경계 규칙의 단일 원본입니다.

---

## 상세 문서

| 영역   | 문서                         |
| ------ | ---------------------------- |
| Mobile | @docs/architecture-mobile.md |
| API    | @docs/architecture-api.md    |

---

## 설계 철학

**FSD의 "레이어 의존 방향" 개념을 채용하되, SDD 개발 방식을 수행하기 위해 각 도메인 내부는 DDD 스타일로 구성한다.**

- FSD에서 가져온 것: 레이어 분리(screens / features / entities / shared), 단방향 의존
- DDD에서 가져온 것: 각 도메인은 `specs / api / model / ui` 세그먼트를 가짐, Barrel Export
- SDD를 위해: 모든 도메인은 `specs/` 명세 파일이 구현보다 먼저 존재해야 함

---

## 모노레포 전체 구조

```
seulgi-living/
├── apps/
│   ├── mobile/          # React Native (Expo) — 모바일 앱
│   └── api/             # Next.js — BFF/백엔드
├── packages/
│   ├── contract/        # API 계약 (Zod 스키마 + 공유 타입)
│   ├── db/              # Prisma schema + client (api 전용)
│   └── config/          # 공유 eslint / tsconfig / tailwind preset
├── docs/
├── local/               # 개인 작업 메모 (.gitignore)
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## 앱 간 책임 경계

| 영역                | 책임                            | 금지               |
| ------------------- | ------------------------------- | ------------------ |
| `apps/mobile`       | 화면, 클라이언트 상태, API 호출 | DB 직접 접근       |
| `apps/api`          | BFF, DB 접근, 외부 API 연동     | 모바일 UI 로직     |
| `packages/contract` | Zod 스키마, 공유 DTO            | 앱별 비즈니스 로직 |
| `packages/db`       | Prisma schema/client            | mobile import      |

---

## packages/ 내부 구조

> 두 앱 모두에서 필요한 코드만 여기에 둔다. 한 앱에서만 쓰이는 코드는 해당 앱 안에 위치해야 한다.

### `packages/contract/` — API 계약 (가장 중요)

> 프론트↔백이 주고받는 데이터 타입의 단일 진실(Single Source of Truth).
> **각 앱에서 임의 타입 선언 금지.**

```
packages/contract/
├── src/
│   ├── domains/
│   │   ├── recipe.ts
│   │   ├── policy.ts
│   │   ├── map.ts
│   │   ├── user.ts
│   │   ├── fridge.ts
│   │   ├── grocery.ts
│   │   ├── camera.ts
│   │   └── chat.ts
│   ├── common/
│   │   ├── pagination.ts
│   │   ├── response.ts
│   │   └── enums.ts
│   └── index.ts             # 전체 배럴 export — 외부는 여기서만 import
├── package.json
└── tsconfig.json
```

### `packages/db/` — Prisma 스키마 + Client (api 전용)

> **`apps/mobile`에서 직접 import 절대 금지.**

```
packages/db/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   └── index.ts             # PrismaClient 싱글턴 export
├── package.json
└── tsconfig.json
```

### `packages/config/` — 공유 도구 설정

```
packages/config/
├── eslint/
│   └── index.js
├── typescript/
│   └── base.json
├── tailwind/
│   └── preset.js
└── package.json
```

---

## 레이어 간 import 규칙

| From \ To   | shared | entities | features | screens | packages/\*      |
| ----------- | ------ | -------- | -------- | ------- | ---------------- |
| shared      | ✗      | ✗        | ✗        | ✗       | ✓                |
| entities    | ✓      | ✗        | ✗        | ✗       | ✓                |
| features    | ✓      | ✓        | ✗        | ✗       | ✓                |
| screens     | ✓      | ✓        | ✓        | ✗       | ✓                |
| api modules | -      | -        | -        | -       | ✓ (db, contract) |
