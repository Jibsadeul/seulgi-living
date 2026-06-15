# Mobile 아키텍처

> `apps/mobile` 전용 구조 문서입니다. 이 문서는 mobile 구조 설명의 단일 원본입니다. 다른 파일에 복사하지 않습니다.
> 공통 경계 규칙은 `@docs/architecture.md`를 따릅니다.

---

## 레이어 구조

```
apps/mobile/src/
├── app/        ❶ 배선 — Expo Router 라우팅 + 전역 Provider
├── screens/    ❷ 화면 조립 — 로직 없이 feature/entity 조합만
├── features/   ❸ 유스케이스 — 여러 entity를 엮는 기능 단위
├── entities/   ❹ 도메인 — 가장 안정적인 레이어 (DDD 도메인 구조)
└── shared/     ❺ 공통 — 도메인 무관 유틸/UI/스토어
```

**의존 방향**: `screens → features → entities → shared`
역방향 import 금지. 같은 레이어 간 import 금지 (shared 제외).

---

## app/ 구조 (Expo Router)

> `app.json`의 `router.root: "src"` 설정으로 Expo Router가 `src/app/`을 라우팅 루트로 인식.
> 각 라우트 파일은 **배선만** 담당 — 화면 내용은 전부 `screens/`에서 import.

```
src/app/
├── _layout.tsx              # 루트: QueryClient, Zustand hydration, 테마 등 전역 Provider
├── index.tsx                # 토큰 유무 확인 → (auth) or (tabs) 리다이렉트
│
├── (auth)/
│   ├── _layout.tsx          # Stack navigator
│   └── login.tsx            # → screens/members/ui/LoginScreen
│
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator + 아이콘/레이블 설정
│   ├── index.tsx            # 홈 (레시피)
│   ├── policies.tsx
│   ├── map.tsx
│   ├── fridge.tsx
│   └── mypage.tsx
│
└── (stack)/
    ├── _layout.tsx          # Stack navigator
    ├── recipes/[id].tsx
    ├── policies/[id].tsx
    └── chat.tsx
```

**라우트 파일 작성 규칙**:

- `_layout.tsx`: navigator 설정 + Provider 주입만. 화면 렌더링 없음
- 그 외 `*.tsx`: `screens/`의 컴포넌트를 1줄 re-export (`export { default } from '@/screens/...'`)

---

## Entity 구조 (DDD 세그먼트)

```
entities/{domain}/
├── specs/                    # ← SDD 핵심. 구현 전 반드시 존재해야 함
│   └── {domain}.spec.md
├── api/
│   ├── queries.ts
│   ├── mutations.ts
│   ├── {domain}.schema.ts    # @repo/contract Zod 스키마 re-export + 검증
│   └── keys.ts               # 쿼리 키 팩토리
├── model/
│   ├── {domain}.model.ts     # 순수 타입 + DTO→모델 매퍼 (의존성 없는 순수 함수)
│   ├── use{Domain}.ts        # 위 매퍼를 쓰는 훅 (React 의존)
│   └── {domain}.store.ts     # Zustand 클라이언트 상태 (필요시)
├── ui/
│   └── {Domain}Card.tsx
└── index.ts                  # ← 배럴 export만. 내부 파일 직접 import 금지
```

---

## Feature 구조

```
features/{domain}-{feature}/
├── specs/
│   └── {feature}.spec.md
├── model/
│   ├── use{Feature}.ts       # entities의 query/mutation을 조합
│   └── {feature}.store.ts
├── ui/
│   └── {Feature}Form.tsx     # entities UI 컴포넌트 조립
├── api/                      # 이 Feature만을 위한 특수 API만
│   └── use{Feature}Submit.ts
└── index.ts
```

---

## Screens 구조(항상 도메인을 따라가지는 않음. 예시: home)

```
screens/{domain}/
├── specs/
│   ├── {domain}List.spec.md
│   └── {domain}Detail.spec.md
└── ui/
    ├── {domain}ListScreen.tsx
    ├── {domain}DetailScreen.tsx
    └── components/
        └── {domain}DetailHeader.tsx  # 이 화면 배치에만 쓰이는 얇은 UI
```

---

## shared 구조

```
shared/
├── api/
│   └── client.ts            # axios/fetch 베이스 인스턴스, 토큰 인터셉터
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── BottomSheet.tsx
│   ├── SkeletonCard.tsx      # 외부 API 로딩 중 필수
│   ├── EmptyState.tsx        # 검색 0건, 스크랩 없음 등 필수
│   └── Toast.tsx
├── lib/
│   ├── date.ts               # 마감일 계산 (정책 D-7 등)
│   ├── format.ts             # 가격 포맷, 거리 포맷
│   └── validator.ts
├── store/
│   └── auth.store.ts         # 카카오 로그인 세션, 토큰 전역 상태
├── config/
│   ├── constants.ts          # API_BASE_URL, MAP_DEFAULT_ZOOM 등
│   └── env.ts                # 환경변수 타입 안전하게 래핑
└── hooks/
    ├── useDebounce.ts
    ├── useGeolocation.ts     # GPS 위치 (GPS 거부 처리 포함)
    └── useBottomSheet.ts
```
