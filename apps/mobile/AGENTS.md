# apps/mobile — CLAUDE.md

> **참조 우선순위**: 전역 CLAUDE.md → 루트 CLAUDE.md → **이 파일**  
> mobile 작업 시에만 이 파일을 참조한다.

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| 프레임워크 | React Native + Expo |
| 라우팅 | Expo Router |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | Zustand |
| 스타일 | NativeWind | # 수정필요
| API 계약 | `@repo/contract` (Zod) |
| 폼 검증 | Zod + React Hook Form |
| 지도 | 카카오맵 SDK |
| 인증 | 카카오 소셜 로그인 |

---

## 레이어 구조

| 아키텍처 · 폴더 구조 | @docs/architecture.md | 참조

```
apps/mobile/src/
├── app/          ❶ 배선 (providers, 초기화, 글로벌 스타일) — 라우팅 아님
├── screens/      ❷ 화면 조립만. 비즈니스 로직 금지. 최대 150줄
├── features/     ❸ 유스케이스 (여러 entity 조합)
├── entities/     ❹ 도메인 (가장 안정적)
└── shared/       ❺ 도메인 무관 공통
```

---

## 도메인(Entity) 목록

| 도메인 | 경로 | 설명 |
|--------|------|------|
| members | `entities/members/` | 프로필, 거주지, 카카오 계정 |
| recipes | `entities/recipes/` | 레시피 모델, RecipeCard UI |
| policies | `entities/policies/` | 청년 정책 모델, PolicyCard UI |
| map | `entities/map/` | 편의시설 (빨래방 등) |
| fridge | `entities/fridge/` | 냉장고 재료 |
| groceries | `entities/groceries/` | 장 본 목록 |
| camera | `entities/camera/` | AI 기반 이미지 및 영수증 분석 |
| chat | `entities/chat/` | AI 채팅 |

---
