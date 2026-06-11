# Git 전략

> 수정 시 팀 합의 필요.

## 브랜치 구조

| 브랜치 | 역할 |
|--------|------|
| `main` | 프로덕션 배포 브랜치 |
| `develop` | 기능 통합 브랜치 |
| `feature/*` | 단위 기능 개발 |
| `fix/*` | 버그 수정 브랜치 |

## 개발 흐름

```
develop → feature/* (개발) → develop (PR+리뷰) → main
```

## 핵심 규칙

- 브랜치 병합 시 항상 `--no-ff` (Fast-Forward 방지)
- feature 브랜치 완료 후 삭제

## 커밋 메시지

### 커밋 메시지 형식

`[type]: 내용`

예시

- `feat: 로그인 UI 및 API 연동`
- `fix: 정책 목록 필터 버그 수정`
- `docs: API 계약 문서 업데이트`
- `refactor: RecipeCard 컴포넌트 분리`
- `chore: Turborepo 빌드 설정 추가`

### 커밋 메시지 타입

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `refactor`: 리팩토링
- `chore`: 빌드/설정 변경
- `style`: UI/스타일 변경
- `comment`: 주석 추가 및 변경
- `rename`: 파일/폴더 이름 수정 또는 이동 
- `remove`: 코드나 파일 삭제


## 브랜치 명명

```
feature/auth-kakao-login
feature/recipe-search-filter
feature/policy-scrap
```