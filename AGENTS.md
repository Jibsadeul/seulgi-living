# 슬기로운 자취생활 — 프로젝트 CLAUDE.md

> **참조 우선순위**: 전역 `C:\Users\Codelab\.claude\CLAUDE.md` → **이 파일** → `apps/mobile/CLAUDE.md` 또는 `apps/api/CLAUDE.md` (작업 앱에 해당하는 것만)

---

## 프로젝트 개요

**슬기로운 자취생활** — 독립 청년을 위한 올인원 앱 (레시피 · 청년 정책 · 편의시설 지도 · AI 채팅)

모노레포 구조: `apps/mobile` (React Native + Expo) · `apps/api` (Next.js BFF) · `packages/contract` · `packages/db` · `packages/config`

### Shared Domains


---

## 참고 문서

| 문서 | 링크 |
|------|------|
| 아키텍처 · 폴더 구조 | @docs/architecture.md |
| DB 스키마 (ERD) | @docs/erd.md |
| API 엔드포인트 | @docs/api-contract.md |
| 제품 요구사항 | @docs/prd.md |
| Git 전략 | @docs/git-strategy.md |
| 코드 컨벤션 | @docs/code-convention.md |
| 기술 스택 | @docs/tech-stack.md |

---

## ⚠️ SDD 강제 워크플로우

**모든 구현은 반드시 spec 확인 → (없으면 작성) → 승인 → 구현 순서를 따른다. 사용자가 요청할 때만 예외.**

### 개발 요청이 오면 Agent는 아래 순서를 무조건 따른다

```
1. 해당 도메인/feature의 specs/*.spec.md 존재 여부 확인
   → 있으면: "이 spec 기반으로 개발할게요. 확인해주세요." 후 대기
   → 없으면: [SPEC 작성 모드] 진입

2. 사용자 확인 후 구현 시작

3. 구현 완료 후 spec과 대조 검증
   → "spec의 [항목]이 모두 구현되었습니다. 확인해주세요."
```

### [SPEC 작성 모드] — spec이 없을 때

Agent가 혼자 작성하지 않는다. 반드시 사용자와 대화로 완성한다.

```
Step 1. 아래 항목 질문
  "새로운 스펙 작성을 시작합니다. 아래 세 가지 핵심 내용만 자유롭게 한 번에 적어주세요! (키워드나 한 줄 요약도 좋습니다.)"
  - 기능 정의: 이 기능의 목적과 핵심 유스케이스
  - 데이터 흐름: 필요한 입력값(인풋)과 기대하는 결과물(아웃풋)
  - 특이 사항: 반드시 고려해야 할 예외 케이스나 필수 UI 상태 (로딩/에러 등)

Step 2. 답변 바탕으로 spec 초안 작성 후 제시
  → "이렇게 spec을 작성했습니다. 수정할 부분이 있나요?"

Step 3. 승인 후 해당 도메인의 specs/ 폴더에 저장
  → "spec이 완성되었습니다. 이제 구현을 시작할까요?"
```

### 예시

```
사용자: "레시피 스크랩 기능 개발해야 돼"

Agent:  "recipe-scrap spec 파일이 없네요. 먼저 작성하겠습니다.
        Q1. 스크랩 시 폴더 지정이 필수인가요, 선택인가요?"

사용자: "선택이야"

Agent:  "Q2. 비로그인 상태에서 스크랩 버튼을 누르면 어떻게 되나요?"

        ... (질문 완료 후)

        "아래와 같이 spec을 작성했습니다.
        [spec 초안]
        수정할 부분이 있나요?"

사용자: "좋아"

Agent:  "entities/recipe/specs/recipe-scrap.spec.md에 저장했습니다.
        구현을 시작할까요?"
```

---

## 작업 규칙

1. **계획 먼저**: 코드 작업 요청을 받으면 바로 구현하지 않고,
   개발 계획을 `local/WORK.md`에 먼저 작성한다
2. **승인 후 진행**: 사용자의 승인을 받은 후에만 구현을 시작한다
3. **WORK.md 확인**: 구현 시작 전 `local/WORK.md`를 읽고 계획대로 진행한다
4. **완료 처리**: 작업 완료 후 해당 항목을 `local/WORK.md`에서
   `local/HISTORY.md`로 이동한다

---

## 도메인 목록

## 도메인(Entity) 목록

| members | recipes | policies | map | fridge | groceries | camera | chat 

---

## 코드 규칙 (항상 적용)

- TypeScript `any` **금지** → `unknown` + 타입 가드
- Barrel Export: 각 도메인/feature는 `index.ts`로만 외부 노출, 내부 파일 직접 import 금지
- API 타입: `packages/contract`의 Zod 스키마가 단일 진실. 각 앱에서 임의 타입 선언 금지
- `packages/db`는 `apps/api`에서만 import
- 레이어 의존 방향: `screens → features → entities → shared` (역방향 금지)