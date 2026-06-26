# 슬기로운 자취생활

독립 청년을 위한 올인원 생활 지원 앱입니다. 레시피, 냉장고 재료 관리, 장보기 내역, 청년 정책, 주변 편의시설 지도, AI 채팅, 카메라 기반 분석 기능을 하나의 모바일 앱에서 제공합니다.

## 프로젝트 개요

`슬기로운 자취생활`은 자취를 시작한 청년이 일상에서 자주 겪는 문제를 줄이기 위한 서비스입니다.

- 보유 재료 기반 레시피 탐색
- 냉장고 재료와 장보기 내역 관리
- 청년 정책 검색과 스크랩
- 주변 편의시설 지도 조회
- AI 채팅을 통한 정책, 레시피, 생활 정보 질의응답
- 카메라 기반 이미지와 영수증 분석

모바일 앱과 API 서버를 분리한 모노레포 구조이며, 공통 API 타입은 Zod 기반 `packages/contract`에서 관리합니다.

## 주요 기능

### 레시피

- 레시피 목록과 상세 조회
- 검색, 카테고리, 상황별 레시피 탐색
- 사용자 레시피 등록, 수정, 삭제
- 내 레시피 관리
- 레시피 스크랩

### 냉장고

- 냉장고 재료 등록, 수정, 삭제
- 보유 재료 기반 레시피 추천
- 재료 수량과 단위 관리

### 장보기

- 장보기 내역 등록
- 월별 예산과 지출 요약
- 소비 리포트 확인

### 청년 정책

- 청년 정책 목록 조회
- 정책 상세 정보 확인
- 조건 기반 정책 탐색
- 정책 스크랩

### 지도

- 주변 편의시설 조회
- 위치 기반 시설 탐색
- 카테고리별 필터링

### AI 기능

- AI 채팅을 통한 정책, 레시피, 생활 정보 질의응답
- 카메라 기반 이미지 분석
- 영수증 또는 식재료 촬영 후 가계부, 장보기, 냉장고 기능과 연계

### 회원

- 카카오 로그인
- 내 정보 조회와 수정
- 로그아웃, 회원 탈퇴

## 기술 스택

### 공통

- TypeScript
- pnpm
- Turborepo
- Zod

### Mobile

- React Native
- Expo
- Expo Router
- React Query
- Zustand
- NativeWind

### Backend

- Next.js
- Prisma
- PostgreSQL
- MongoDB
- Kakao OAuth
- Google GenAI / Vertex AI

### Packages

- `packages/contract`: Zod 기반 API 요청/응답 계약
- `packages/db`: Prisma schema와 client
- `packages/config`: 공유 설정

## 모노레포 구조

```text
seulgi-living/
├─ apps/
│  ├─ mobile/          # React Native + Expo 모바일 앱
│  └─ api/             # Next.js 기반 BFF/API 서버
├─ packages/
│  ├─ contract/        # API 요청/응답 Zod 스키마
│  ├─ db/              # Prisma schema와 client
│  └─ config/          # 공유 설정
├─ docs/               # 프로젝트 문서
├─ local/              # 로컬 작업 계획과 이력
├─ pnpm-workspace.yaml
├─ turbo.json
└─ tsconfig.base.json
```

## 주요 경계

- `apps/mobile`
  - 화면, 클라이언트 상태, API 호출을 담당합니다.
  - DB에 직접 접근하지 않습니다.

- `apps/api`
  - 인증, 비즈니스 로직, DB 접근, 외부 API 연동을 담당합니다.

- `packages/contract`
  - API 요청과 응답 타입의 단일 진실입니다.
  - Mobile과 API가 같은 Zod 스키마를 공유합니다.

- `packages/db`
  - Prisma schema와 client를 관리합니다.
  - API 앱에서만 사용합니다.

## 시작하기

### 요구 사항

- Node.js 22 이상
- pnpm 9 이상

### 설치

```bash
pnpm install
```

### 개발 서버 실행

전체 개발 서버:

```bash
pnpm dev
```

API 서버:

```bash
pnpm --filter @repo/api dev
```

모바일 앱:

```bash
pnpm --filter @repo/mobile start
```

### 검증

```bash
pnpm typecheck
pnpm lint
pnpm build
```

작업 범위가 특정 앱에 한정되면 해당 앱 필터를 사용합니다.

```bash
pnpm --filter @repo/api typecheck
pnpm --filter @repo/api lint
pnpm --filter @repo/mobile start
```

## 개발 워크플로우

이 프로젝트는 SDD(Spec 주도 개발) 흐름을 따릅니다. 코드 변경이 필요한 개발 요청은 바로 구현하지 않고, 아래 순서를 지킵니다.

1. 작업할 기능의 관련 `specs/*.spec.md` 문서를 확인합니다.
2. 관련 spec이 있으면 해당 spec을 기준으로 진행할지 사용자 확인을 받습니다.
3. 관련 spec이 없으면 기능 목적, 데이터 흐름, 특이 사항을 먼저 정의합니다.
4. 사용자와 spec을 확정한 뒤 해당 도메인의 `specs/` 폴더에 저장합니다.
5. 구현 전 `local/WORK.md`에 작업 계획을 작성하고 승인을 받습니다.
6. 구현 시작 전 `local/WORK.md`를 다시 읽고 계획 범위 안에서만 수정합니다.
7. 구현 후 타입 체크, 필요한 테스트, 수동 검증을 수행합니다.
8. 구현 결과가 spec의 완료 기준을 만족하는지 대조합니다.
9. 완료된 작업은 `local/WORK.md`에서 정리하고 `local/HISTORY.md`에 기록합니다.

### Spec이 없을 때 확인할 내용

Spec이 없는 기능은 다음 세 가지를 먼저 정의합니다.

- 기능 정의: 기능의 목적과 핵심 유스케이스
- 데이터 흐름: 필요한 입력값, 처리 과정, 기대 결과
- 특이 사항: 예외 케이스, 로딩, 에러, 빈 상태 등 필수 UI 상태

Agent가 혼자 spec을 완성하지 않습니다. 사용자와 대화로 초안을 만들고, 승인 후 저장합니다.

### 작업 계획 형식

구현 전 `local/WORK.md`에는 최소한 다음 내용을 기록합니다.

```md
## 작업명

- 관련 spec:
- 목표:
- 변경 범위:
- 구현 단계:
- 검증 방법:
```

승인 전에는 구현하지 않습니다.

### 완료 기록 형식

작업 완료 후 `local/HISTORY.md`에는 최소한 다음 내용을 기록합니다.

```md
## YYYY-MM-DD - 작업명

- 관련 spec:
- 변경 요약:
- 검증 결과:
- 남은 이슈:
```

## 코드 규칙

- TypeScript `any`를 사용하지 않습니다.
- 불명확한 타입은 `unknown`과 타입 가드를 사용합니다.
- API 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 둡니다.
- 각 앱에서 API DTO를 임의로 재선언하지 않습니다.
- `packages/db`는 `apps/api`에서만 import합니다.
- 외부 노출은 각 도메인과 feature의 `index.ts` 배럴 export를 우선합니다.
- 요청과 직접 관련 없는 파일은 수정하지 않습니다.
- 불필요한 추상화보다 요청 범위에 맞는 작은 변경을 우선합니다.

## 참고 문서

- [전체 아키텍처](docs/architecture.md)
- [API 계약](docs/api-contract.md)
- [제품 요구사항](docs/prd.md)
- [Git 전략](docs/git-strategy.md)
- [코드 컨벤션](docs/code-convention.md)
- [기술 스택](docs/tech-stack.md)
- [Agent 작업 규칙](AGENTS.md)
