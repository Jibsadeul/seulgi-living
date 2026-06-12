# 슬기로운 자취생활 - AGENTS.md

> Codex와 Claude가 함께 참조하는 프로젝트 공통 규칙입니다.
> 실제 규칙의 단일 원본은 이 파일이며, `CLAUDE.md`는 Claude Code가 이 파일을 읽기 위한 진입점입니다.

## 참조 우선순위

1. 전역 에이전트 규칙
2. 루트 `AGENTS.md`
3. 작업 앱의 `apps/mobile/AGENTS.md` 또는 `apps/api/AGENTS.md`
4. `docs/*.md` 상세 참고 문서

하위 문서는 상위 문서를 보완합니다. 충돌 시 상위 문서를 우선하되, 더 구체적인 앱별 규칙은 해당 앱 작업에 한해 적용합니다.

---

## 프로젝트 개요

**슬기로운 자취생활** - 독립 청년을 위한 올인원 앱 (레시피, 청년 정책, 편의시설 지도, AI 채팅, 카메라)

모노레포 구조:

| 영역     | 경로                | 역할                                     |
| -------- | ------------------- | ---------------------------------------- |
| Mobile   | `apps/mobile`       | React Native + Expo 모바일 앱            |
| API      | `apps/api`          | Next.js BFF                              |
| Contract | `packages/contract` | Zod 기반 API 계약                        |
| DB       | `packages/db`       | Prisma schema + client (`apps/api` 전용) |
| Config   | `packages/config`   | 공유 설정                                |

---

## 공통 도메인

| 도메인    | Mobile 경계          | API 경계             | 비고                        |
| --------- | -------------------- | -------------------- | --------------------------- |
| members   | `entities/members`   | `services/members`   | 사용자, 프로필, 카카오 인증 |
| recipes   | `entities/recipes`   | `services/recipes`   | 레시피 검색, 상세, 스크랩   |
| policies  | `entities/policies`  | `services/policies`  | 청년 정책, 스크랩           |
| map       | `entities/map`       | `services/map`       | 편의시설 지도               |
| fridge    | `entities/fridge`    | `services/fridge`    | 냉장고 재료                 |
| groceries | `entities/groceries` | `services/groceries` | 장보기 내역                 |
| camera    | `entities/camera`    | `services/camera`    | 이미지/영수증 분석          |
| chat      | `entities/chat`      | `services/chat`      | AI 채팅                     |

도메인 이름은 앱과 패키지 전반에서 가능한 한 위 표를 따른다. 외부 API나 URL 이름이 다를 경우 앱별 `AGENTS.md`에 매핑을 명시한다.

---

## 참고 문서

| 문서             | 링크                                      | 역할                            |
| ---------------- | ----------------------------------------- | ------------------------------- |
| 전체 아키텍처    | @docs/architecture.md                     | 모노레포 경계, packages 구조    |
| Mobile 아키텍처  | `apps/mobile/docs/architecture-mobile.md` | `apps/mobile` 상세 구조         |
| API 아키텍처     | `apps/api/docs/architecture-api.md`       | `apps/api` 상세 구조            |
| DB 스키마 (ERD)  | `apps/api/docs/erd.md`                    | 데이터 모델 참고                |
| API 엔드포인트   | @docs/api-contract.md                     | API 계약 참고                   |
| 제품 요구사항    | @docs/prd.md                              | 기능 요구사항 참고              |
| Git 전략         | @docs/git-strategy.md                     | 브랜치/커밋 참고                |
| 코드 컨벤션      | @docs/code-convention.md                  | 네이밍/스타일 참고              |
| 기술 스택 (공통) | @docs/tech-stack.md                       | 공통 버전 정책, 공유 라이브러리 |

`docs/*.md`는 상세 참고 문서입니다. 실행 규칙은 이 파일과 앱별 `AGENTS.md`를 우선합니다.

---

## SDD 강제 워크플로우

모든 요청은 반드시 요청 파악 -> 관련 spec 확인 -> 없으면 spec 작성/승인 -> local/WORK.md 계획 작성/승인 -> 구현 -> spec 대조 검증 -> local/HISTORY.md 이동
순서를 따릅니다. 사용자가 명시적으로 예외를 요청한 경우에만 생략할 수 있습니다.

개발 요청이 오면 아래 순서를 따릅니다.

1. 해당 도메인/feature/screen의 `specs/*.spec.md` 존재 여부를 확인한다.
2. spec이 있으면 사용자에게 "이 spec 기반으로 개발할게요. 확인해주세요."라고 알리고 대기한다.
3. spec이 없으면 [SPEC 작성 모드]로 들어간다.
4. spec 승인 후 `local/WORK.md`에 작업 계획을 작성하고 승인을 받는다.
5. 구현 시작 전 `local/WORK.md`를 다시 읽고 계획대로 진행한다.
6. 구현 완료 후 spec과 대조 검증한다.
7. 완료된 작업 항목을 `local/WORK.md`에서 `local/HISTORY.md`로 이동한다.

### SPEC 작성 모드

Agent가 혼자 spec을 완성하지 않습니다. 반드시 사용자와 대화로 완성합니다.

1. 사용자에게 아래 세 가지를 질문한다.
   - 기능 정의: 이 기능의 목적과 핵심 유스케이스
   - 데이터 흐름: 필요한 입력값과 기대하는 결과물
   - 특이 사항: 예외 케이스, 로딩/에러/빈 상태 등 필수 UI 상태
2. 답변을 바탕으로 spec 초안을 제시한다.
3. 사용자 승인 후 해당 도메인의 `specs/` 폴더에 저장한다.
4. "spec이 완성되었습니다. 이제 구현을 시작할까요?"라고 확인한다.

---

## 작업 규칙

- 모든 문서는 한국어로 작성한다.
- 코드 작업 요청을 받으면 바로 구현하지 않고 `local/WORK.md`에 개발 계획을 먼저 작성한다.
- 사용자의 승인을 받은 후에만 구현을 시작한다.
- 구현 시작 전 `local/WORK.md`를 읽고 계획대로 진행한다.
- 작업 완료 후 해당 항목을 `local/WORK.md`에서 `local/HISTORY.md`로 이동한다.
- 단순 문서 정리처럼 구현 spec이 필요하지 않은 작업은 SDD를 생략할 수 있지만, 변경 범위와 의도는 먼저 설명한다.

---

## 공통 코드 규칙

- TypeScript `any` 금지. 불명확한 타입은 `unknown` + 타입 가드를 사용한다.
- API 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 둔다.
- 각 앱에서 API DTO를 임의로 재선언하지 않는다.
- `packages/db`는 `apps/api`에서만 import한다.
- 외부 노출은 각 도메인/feature의 `index.ts` 배럴 export를 우선한다.
- 내부 파일 직접 import 금지 규칙과 레이어 의존 방향은 앱별 `AGENTS.md`의 구조를 따른다.
