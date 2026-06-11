# 아키텍처

> 수정 시 팀 합의 필요. 개인 단독 수정 금지.

---

## 설계 철학

**FSD의 "레이어 의존 방향" 개념을 채용하되, SDD 개발 방식을 수행하기 위해 각 도메인 내부는 DDD 스타일로 구성한다.**

- FSD에서 가져온 것: 레이어 분리(screens / features / entities / shared), 단방향 의존
- DDD에서 가져온 것: 각 도메인은 `specs / api / model / ui` 세그먼트를 가짐, Barrel Export
- SDD를 위해: 모든 도메인은 `specs/` 명세 파일이 구현보다 먼저 존재해야 함

---

## 모노레포 전체 구조

```
seulgi-jachi/
├── apps/
│   ├── mobile/          # React Native (Expo) — 모바일 앱
│   └── api/             # Next.js — BFF/백엔드
├── packages/            # 프론트·백 공유 패키지
│   ├── contract/        # API 계약 (Zod 스키마 + 공유 타입)
│   ├── db/              # Prisma schema + client (api 전용)
│   └── config/          # 공유 eslint / tsconfig / tailwind preset
├── docs/                # 공용 설계 문서
├── local/               # 개인 작업 메모 (.gitignore)
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## packages/ 내부 구조

> 두 앱(`apps/mobile`, `apps/api`) 모두에서 필요한 코드만 여기에 둔다.  
> 한 앱에서만 쓰이는 코드는 해당 앱 안에 위치해야 한다.

### `packages/contract/` — API 계약 (가장 중요)

> 프론트↔백이 주고받는 데이터 타입의 단일 진실(Single Source of Truth).  
> `apps/api`는 이 타입으로 응답을 직렬화하고, `apps/mobile`은 이 타입으로 응답을 검증한다.  
> **각 앱에서 임의 타입 선언 금지.**

```
packages/contract/
├── src/
│   ├── domains/             # 도메인별 Zod 스키마 (API 리소스 기준 명명)
│   │   ├── recipe.ts        # RecipeDto, CreateRecipeDto
│   │   ├── policy.ts        # PolicyDto
│   │   ├── map.ts           # MapDto (편의시설)
│   │   ├── user.ts          # UserDto, UpdateUserDto
│   │   ├── fridge.ts        # FridgeIngredientDto, CreateFridgeDto
│   │   ├── grocery.ts       # GroceryItemDto
│   │   ├── camera.ts        # CameraAnalysisDto (AI 이미지·영수증 분석 결과)
│   │   └── chat.ts          # ChatMessageDto, ChatResponseDto
│   ├── common/              # 앱·도메인 무관 공통 타입
│   │   ├── pagination.ts    # PaginatedResponseDto
│   │   ├── response.ts      # ApiResponseDto, ApiErrorDto
│   │   └── enums.ts         # 공유 Enum (RecipeSource, FridgeCategory 등)
│   └── index.ts             # 전체 배럴 export — 외부는 여기서만 import
├── package.json
└── tsconfig.json
```

### `packages/db/` — Prisma 스키마 + Client (api 전용)

> DB 구조("어떻게 생겼나")와 비즈니스 로직("어떻게 쓰나")을 분리하기 위해 패키지로 분리.  
> **`apps/mobile`에서 직접 import 절대 금지.**

```
packages/db/
├── prisma/
│   ├── schema.prisma        # 단일 스키마 파일 — 모든 테이블 여기서 관리
│   └── migrations/          # prisma migrate 자동 생성 파일
├── src/
│   └── index.ts             # PrismaClient 싱글턴 export
├── package.json
└── tsconfig.json
```

### `packages/config/` — 공유 도구 설정

> 두 앱이 동일한 린트·컴파일·스타일 규칙을 사용하기 위한 설정 모음.  
> TypeScript 소스 코드 없음 — 설정 파일만.

```
packages/config/
├── eslint/
│   └── index.js             # 공유 ESLint 설정
├── typescript/
│   └── base.json            # 공유 tsconfig (각 앱의 tsconfig가 extends)
├── tailwind/
│   └── preset.js            # NativeWind 공유 preset
└── package.json
```

---

## apps/mobile/ 구조

### 레이어 구조 (FSD 의존 방향 채용)

```
src/
├── app/        ❶ 배선 — Expo Router 라우팅 + 전역 Provider (app.json router.root: "src")
├── screens/    ❷ 화면 조립 — 로직 없이 feature/entity 조합만
├── features/   ❸ 유스케이스 — 여러 entity를 엮는 기능 단위
├── entities/   ❹ 도메인 — 가장 안정적인 레이어 (DDD 도메인 구조)
└── shared/     ❺ 공통 — 도메인 무관 유틸/UI/스토어
```

**의존 방향**: `screens → features → entities → shared`  
역방향 import 금지. 같은 레이어 간 import 금지 (shared 제외).

### app/ 구조 (Expo Router)

> `app.json`의 `router.root: "src"` 설정으로 Expo Router가 `src/app/`을 라우팅 루트로 인식.  
> 각 라우트 파일은 **배선만** 담당 — 화면 내용은 전부 `screens/`에서 import.

```
src/app/
├── _layout.tsx              # 루트: QueryClient, Zustand hydration, 테마 등 전역 Provider
├── index.tsx                # 토큰 유무 확인 → (auth) or (tabs) 리다이렉트
│
├── (auth)/                  # 비로그인 플로우
│   ├── _layout.tsx          # Stack navigator
│   └── login.tsx            # → screens/members/ui/LoginScreen
│
├── (tabs)/                  # 메인 탭 네비게이션
│   ├── _layout.tsx          # Tab navigator + 아이콘/레이블 설정
│   ├── index.tsx            # 홈 (레시피)
│   ├── policies.tsx
│   ├── map.tsx
│   ├── fridge.tsx
│   └── mypage.tsx
│
└── (stack)/                 # 탭 위에 push되는 상세 화면
    ├── _layout.tsx          # Stack navigator
    ├── recipes/[id].tsx     # 레시피 상세
    ├── policies/[id].tsx    # 정책 상세
    └── chat.tsx             # AI 채팅
```

**라우트 파일 작성 규칙**:
- `_layout.tsx`: navigator 설정 + Provider 주입만. 화면 렌더링 없음
- 그 외 `*.tsx`: `screens/`의 컴포넌트를 1줄 re-export (`export { default } from '@/screens/...'`)

### Entity 도메인 구조 (DDD 세그먼트)

```
entities/{domain}/
├── specs/                    # ← SDD 핵심. 구현 전 반드시 존재해야 함
│   └── {domain}.spec.md
├── api/                      # 백엔드 통신
│   ├── queries.ts            
│   ├── mutations.ts
│   ├── {domain}.schema.ts    # @repo/contract Zod 스키마 re-export + 검증
│   └── keys.ts               # 쿼리 키 팩토리
├── model/                    # 도메인 로직
│   ├── {domain}.model.ts   # 순수 타입 + DTO→모델 매퍼 (의존성 없는 순수 함수)
│   ├── use{Domain}.ts      # 위 매퍼를 쓰는 훅 (React 의존)
│   └── {domain}.store.ts     # Zustand 클라이언트 상태 (필요시)
├── ui/                       # 도메인 UI 컴포넌트
│   └── {Domain}Card.tsx
└── index.ts                  # ← 배럴 export만. 내부 파일 직접 import 금지
```

### Feature 구조

```
features/{domain}-{feature}/    # 예시 : policy-search, policy-scrap, ...
├── specs/
│   └── {feature}.spec.md
├── model/
│   ├── use{Feature}.ts       # 💡 여기서 entities의 query/mutation을 가져와 "조합"함
│   └── {feature}.store.ts    # zustand 상태 관리
├── ui/
│   └── {Feature}Form.tsx     # entities의 UI 컴포넌트들을 조립해서 화면을 만듦
├── api/                      👈 [주의] 여기엔 오직 이 Feature만을 위한 "특수 API"만 진입
│   └── use{Feature}Submit.ts # 예: 여러 엔티티를 묶어서 한 번에 서버로 보내는 특수 Mutation 정도만!
└── index.ts
```

---

### Screens 구조

```
screens/{domain}/                 # domain이 policy라면
├── specs/
│   ├── {domain}List.spec.md      # PolicyList.spec.md
│   └── {domain}Detail.spec.md
└── ui/
    ├── {domain}ListScreen.tsx       # 정책 목록 화면
    ├── {domain}DetailScreen.tsx     # 정책 상세 화면
    └── components/
        └── {domain}DetailHeader.tsx # 이 화면 배치에만 쓰이는 얇은 UI
```

---

### shared 구조

```
shared/
├── api/
│   └── client.ts            # axios/fetch 베이스 인스턴스, 토큰 인터셉터
│
├── ui/                      # 도메인 없는 원시 컴포넌트
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── BottomSheet.tsx      # 필터, 시설상세, 확인모달에 공통 사용
│   ├── SkeletonCard.tsx     # 외부 API 로딩 중 필수
│   ├── EmptyState.tsx       # 검색 0건, 스크랩 없음 등 필수
│   └── Toast.tsx
│
├── lib/                     # 순수 함수, 도메인 로직 없음
│   ├── date.ts              # 마감일 계산 (정책 D-7 등)
│   ├── format.ts            # 가격 포맷, 거리 포맷
│   └── validator.ts         # 공통 검증 함수
│
├── store/
│   └── auth.store.ts        # 카카오 로그인 세션, 토큰 전역 상태
│
├── config/
│   ├── constants.ts         # API_BASE_URL, MAP_DEFAULT_ZOOM 등
│   └── env.ts               # 환경변수 타입 안전하게 래핑
│
└── hooks/                   # 도메인 무관 공통 훅
    ├── useDebounce.ts        # 레시피/정책 검색 입력에 사용
    ├── useGeolocation.ts     # GPS 위치 (GPS 거부 처리 포함)
    └── useBottomSheet.ts
```

---

## apps/api/ 구조 (DDD-lite)

```
apps/api/
├── app/api/                  # Route Handlers (얇게 — service 호출만)
│   ├── recipes/route.ts
│   ├── policies/route.ts
│   ├── facilities/route.ts
│   ├── fridge/route.ts
│   ├── grocery/route.ts
│   ├── auth/kakao/route.ts
│   └── ai/chat/route.ts
└── src/
    ├── modules/              # 도메인 모듈
    │   └── {domain}/
    │       ├── specs/
    │       │   ├── {domain}.api.spec.md  # 엔드포인트 요청/응답 spec
    │       │   └── {domain}.spec.md      # 도메인 비즈니스 로직 spec
    │       ├── {domain}.service.ts    # 유스케이스/비즈니스 규칙
    │       ├── {domain}.repository.ts # Prisma 접근 (@repo/db)
    │       └── {domain}.dto.ts        # @repo/contract 타입 사용
    └── shared/
        ├── external/         # 외부 API 클라이언트
        ├── lib/
        └── middleware/       # 인증 검증
```

---
### shared 구조

```
shared/
├── external/                # 외부 API 클라이언트 (도메인이 아닌 인프라)
│   ├── youth-policy.client.ts   # data.go.kr 청년정책 API
│   ├── kakao-map.client.ts      # 편의시설 위치
│   └── claude-ai.client.ts      # AI 채팅
│
├── middleware/
│   └── auth.ts              # 카카오 토큰 검증, 로그인 여부 확인
│
├── lib/
│   ├── response.ts          # ApiResponse 래퍼 ({ data, error } 공통 포맷)
│   ├── error.ts             # AppError 클래스, 에러 코드 상수
│   └── cache.ts             # 외부 API 실패 시 캐싱 (정책 API 등)
│
└── config/
    └── env.ts               # 서버 환경변수 타입 안전하게 래핑
```

---

## 레이어 간 import 규칙 요약

| From \ To | shared | entities | features | screens | packages/* |
|-----------|--------|----------|----------|---------|------------|
| shared | ✗ | ✗ | ✗ | ✗ | ✓ |
| entities | ✓ | ✗ | ✗ | ✗ | ✓ |
| features | ✓ | ✓ | ✗ | ✗ | ✓ |
| screens | ✓ | ✓ | ✓ | ✗ | ✓ |
| api modules | - | - | - | - | ✓ (db, contract) |