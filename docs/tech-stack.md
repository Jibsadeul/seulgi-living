# Tech Stack


## Version Policy

본 프로젝트는 개별 라이브러리의 최신 버전을 우선하지 않는다.

항상 다음 기준 프레임워크와의 호환성을 우선 고려한다.

- Expo SDK 55
- React Native 0.83
- Expo Router 5
- TypeScript 5

새로운 라이브러리 도입 시에는 반드시 Expo SDK 및 React Native 공식 지원 버전을 확인한 후 적용한다.

---

## Core Framework

| Category | Stack |
|-----------|--------|
| Mobile Framework | Expo SDK 55 |
| Mobile Runtime | React Native 0.83 |
| API Framework | Next.js 16 |
| Navigation | Expo Router 5 |
| Language | TypeScript 5 |
| Package Manager | pnpm |
| Monorepo | Turborepo |

---

## Backend & Database

| Scope | Stack | Purpose |
|---------|---------|----------|
| apps/api | `@repo/db` | API-only database access package |
| packages/db | Prisma 5 | ORM and schema management |
| packages/db | `@prisma/client` | Generated Prisma Client runtime |
| packages/db | `prisma` | Prisma CLI for generate/migrate/push |

> Prisma schema lives in `packages/db/prisma/schema.prisma`. `apps/api` should access the database through `@repo/db`; other apps must not import `packages/db`.

---

## State Management & Server State

| Stack | Purpose |
|---------|----------|
| Zustand 5 | Client State Management |
| TanStack Query 5 | Server State Management & Caching |

---

## Networking

| Stack | Purpose |
|---------|----------|
| Axios 1.7+ | HTTP Client |

---

## UI & Performance

| Stack | Purpose |
|---------|----------|
| NativeWind 4 | Utility-first Styling for React Native |
| @shopify/flash-list 1.7+ | High-performance List Rendering |
| react-native-safe-area-context | Safe Area Handling |
| react-native-screens | Native Screen Optimization |

---

## Form & Validation

| Stack | Purpose |
|---------|----------|
| React Hook Form 7 | Form State Management |
| Zod 3 | Schema Validation |
| @hookform/resolvers 3 | RHF-Zod Integration |

---

## Utilities

| Stack | Purpose |
|---------|----------|
| date-fns 3 | Date Utilities |

---

## AI Integration

| Stack | Purpose |
|---------|----------|
| @google/generative-ai | Gemini API Integration |

---

