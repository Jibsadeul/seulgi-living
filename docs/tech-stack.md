# Tech Stack

> 이 문서는 모노레포 공통 도구와 버전 정책의 단일 원본입니다.
> 앱별 상세 스택은 아래 문서를 참조합니다.

| 앱     | 문서                             |
| ------ | -------------------------------- |
| Mobile | `apps/mobile/docs/tech-stack.md` |
| API    | `apps/api/docs/tech-stack.md`    |

---

## Version Policy

본 프로젝트는 개별 라이브러리의 최신 버전을 우선하지 않는다.

- 모바일 앱은 **Expo SDK 55 / React Native 0.83 / Expo Router 5** 호환성을 최우선으로 한다.
- 새로운 라이브러리 도입 시 반드시 Expo SDK 및 React Native 공식 지원 버전을 확인한 후 적용한다.
- 모든 앱은 **TypeScript 5** strict 모드를 기준으로 한다.

---

## 공통 Core

| Stack        | Purpose       |
| ------------ | ------------- |
| TypeScript 5 | 언어          |
| pnpm         | 패키지 매니저 |
| Turborepo    | 모노레포 빌드 |

---

## 공통 Shared

두 앱 모두에서 사용하는 라이브러리입니다.

| Stack      | Purpose                                                     |
| ---------- | ----------------------------------------------------------- |
| Zod 3      | 스키마 검증 — `packages/contract` 타입 정의 및 양쪽 앱 검증 |
| date-fns 3 | 날짜 유틸리티                                               |
