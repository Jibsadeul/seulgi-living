# apps/mobile - AGENTS.md

> Codex와 Claude가 함께 참조하는 모바일 앱 작업 규칙입니다.
> `apps/mobile` 내부 작업에만 적용하며, 루트 `AGENTS.md`의 공통 규칙을 보완합니다.

## 참조 우선순위

1. 전역 에이전트 규칙
2. 루트 `AGENTS.md`
3. 이 파일: `apps/mobile/AGENTS.md`
4. `docs/*.md` 상세 참고 문서

루트 규칙과 충돌하지 않는 범위에서, 모바일 앱의 폴더 구조/레이어/import 규칙은 이 파일을 우선합니다.

---

## 참고 문서

| 문서            | 링크                                      |
| --------------- | ----------------------------------------- |
| Mobile 아키텍처 | `apps/mobile/docs/architecture-mobile.md` |
| UI 디자인 스펙  | `apps/mobile/docs/design.md`              |
| 코드 컨벤션     | @docs/code-convention.md                  |
| 기술 스택       | `apps/mobile/docs/tech-stack.md`          |

---

## 역할

React Native + Expo 기반 모바일 앱입니다. 화면 구성, 사용자 입력, 클라이언트 상태, 서버 상태 조회를 담당합니다. DB에는 직접 접근하지 않고, API 통신과 타입 검증은 `@repo/contract`를 기준으로 처리합니다.

---

## 기술 스택

| 역할            | 라이브러리             |
| --------------- | ---------------------- |
| 프레임워크      | React Native + Expo    |
| 라우팅          | Expo Router            |
| 서버 상태       | TanStack Query         |
| 클라이언트 상태 | Zustand                |
| 스타일          | NativeWind             |
| API 계약        | `@repo/contract` (Zod) |
| 폼 검증         | Zod + React Hook Form  |
| 지도            | 카카오맵 SDK           |
| 인증            | 카카오 소셜 로그인     |

상세 버전과 도입 기준은 `apps/mobile/docs/tech-stack.md`를 따른다.

---

## SDD 적용 위치

루트 `AGENTS.md`의 SDD 워크플로우를 따른다. 모바일 앱에서 spec은 작업 경계에 맞춰 아래 위치에 둔다.

| 작업 단위            | spec 위치                                         |
| -------------------- | ------------------------------------------------- |
| 도메인 모델/API/UI   | `src/entities/{domain}/specs/*.spec.md`           |
| 유스케이스/기능 조합 | `src/features/{domain}-{feature}/specs/*.spec.md` |
| 화면 조립            | `src/screens/{domain}/specs/*.spec.md`            |

---

## 레이어 구조

상세 구조는 `@docs/architecture.md`를 참고하되, 실제 모바일 작업에서는 아래 규칙을 우선한다.

```
apps/mobile/src/
├── app/          # Expo Router 라우팅 + Provider 배선. 화면/비즈니스 로직 금지
├── screens/      # 화면 조립. feature/entity 조합만 담당
├── features/     # 유스케이스. 여러 entity를 조합
├── entities/     # 도메인 모델/API/UI
└── shared/       # 도메인 무관 공통 UI, lib, config, hooks
```

의존 방향:

```text
screens -> features -> entities -> shared
```

- 역방향 import 금지.
- 같은 레이어 간 import 금지. 단, `shared` 내부 공통 유틸 간 import는 허용한다.
- `app/`의 라우트 파일은 `screens/`를 연결하는 얇은 배선만 담당한다.
- 화면 컴포넌트는 비즈니스 로직을 직접 갖지 않고 feature/entity 훅을 조합한다.

---

## 도메인(Entity) 목록

| 도메인    | 경로                      | 설명                          |
| --------- | ------------------------- | ----------------------------- |
| members   | `src/entities/members/`   | 프로필, 거주지, 카카오 계정   |
| recipes   | `src/entities/recipes/`   | 레시피 모델, RecipeCard UI    |
| policies  | `src/entities/policies/`  | 청년 정책 모델, PolicyCard UI |
| map       | `src/entities/map/`       | 편의시설 지도                 |
| fridge    | `src/entities/fridge/`    | 냉장고 재료                   |
| groceries | `src/entities/groceries/` | 장보기 내역                   |
| camera    | `src/entities/camera/`    | AI 기반 이미지 및 영수증 분석 |
| chat      | `src/entities/chat/`      | AI 채팅                       |

---

## 모바일 코드 규칙

- `@repo/db` import 금지.
- API 응답 타입은 `@repo/contract` 스키마를 사용해 검증한다.
- 각 entity/feature는 `index.ts`로만 외부에 노출한다.
- 외부에서는 `src/entities/{domain}/ui/*`, `model/*`, `api/*` 같은 내부 파일을 직접 import하지 않는다.
- 서버 상태는 TanStack Query를 우선하고, 순수 클라이언트 상태만 Zustand에 둔다.
- 외부 API 로딩/실패/빈 결과는 PRD의 Skeleton, Error, Empty State 요구사항을 반영한다.
