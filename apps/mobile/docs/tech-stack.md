# Mobile Tech Stack

> `apps/mobile` 전용 스택 문서입니다.
> 공통 도구와 버전 정책은 `@docs/tech-stack.md`를 따릅니다.

---

## Version Policy

모바일 앱의 모든 라이브러리는 아래 기준 버전과의 호환성을 최우선으로 한다.

- Expo SDK 55
- React Native 0.83
- Expo Router 5
- TypeScript 5

---

## Core Framework

| Stack             | Purpose              |
| ----------------- | -------------------- |
| Expo SDK 55       | 모바일 프레임워크    |
| React Native 0.83 | 모바일 런타임        |
| Expo Router 5     | 파일 기반 네비게이션 |

---

## State Management

| Stack            | Purpose                |
| ---------------- | ---------------------- |
| Zustand 5        | 클라이언트 상태 관리   |
| TanStack Query 5 | 서버 상태 관리 및 캐싱 |

---

## Networking

| Stack      | Purpose         |
| ---------- | --------------- |
| Axios 1.7+ | HTTP 클라이언트 |

> API 앱은 Next.js 내장 fetch를 사용한다. Axios는 모바일 전용이다.

---

## UI & Performance

| Stack                          | Purpose                          |
| ------------------------------ | -------------------------------- |
| NativeWind 4                   | React Native용 유틸리티 스타일링 |
| @shopify/flash-list 1.7+       | 고성능 리스트 렌더링             |
| react-native-safe-area-context | Safe Area 처리                   |
| react-native-screens           | 네이티브 스크린 최적화           |

---

## Form & Validation

| Stack                 | Purpose      |
| --------------------- | ------------ |
| React Hook Form 7     | 폼 상태 관리 |
| @hookform/resolvers 3 | RHF-Zod 연동 |

> Zod는 공통 패키지(`@repo/contract`)와 함께 사용된다. `@docs/tech-stack.md` 참조.
