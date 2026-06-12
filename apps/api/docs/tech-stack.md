# API Tech Stack

> `apps/api` 전용 스택 문서입니다.
> 공통 도구와 버전 정책은 `@docs/tech-stack.md`를 따릅니다.

---

## Core Framework

| Stack      | Purpose        |
| ---------- | -------------- |
| Next.js 16 | BFF 프레임워크 |

---

## Database

| Scope       | Stack            | Purpose                         |
| ----------- | ---------------- | ------------------------------- |
| apps/api    | `@repo/db`       | API 전용 DB 접근 패키지         |
| packages/db | Prisma 5         | ORM 및 스키마 관리              |
| packages/db | `@prisma/client` | Prisma Client 런타임            |
| packages/db | `prisma`         | CLI (generate / migrate / push) |

> Prisma 스키마는 `packages/db/prisma/schema.prisma`에서 관리한다.
> `apps/api`는 반드시 `@repo/db`를 통해 DB에 접근하며, 다른 앱에서의 직접 import는 금지한다.

---

## AI Integration

| Stack                 | Purpose                       |
| --------------------- | ----------------------------- |
| @google/generative-ai | Gemini API 연동 (서버 사이드) |
