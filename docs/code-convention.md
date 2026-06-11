# 코드 컨벤션

> 수정 시 팀 합의 필요.

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수 | camelCase | `recipeList`, `userAge` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 함수 | camelCase + 동사 우선 | `fetchRecipes`, `handleSubmit` |
| 컴포넌트 | PascalCase | `RecipeCard`, `PolicyList` |
| 커스텀 훅 | `use` + camelCase | `useRecipeSearch`, `usePolicyScrap` |
| 파일 | PascalCase | `RecipeCard.tsx`, `PolicyList.tsx` |
| 폴더 | kebab-case | `recipe-search/`, `policy-scrap/` |
| MD 파일 | kebab-case | `api-contract.md`, `git-strategy.md` |

** Feature 폴더 명명 규칙** : `[도메인]-[기능 이름]` 순
예: `policy-scrab`, `policy-search`, 

**컴포넌트 명명 규칙**: `[도메인][역할]` 순  
예: `PolicyCard`, `PolicyList`, `RecipeFilterBar`, `FacilityMarker`

## TypeScript

- `any` 사용 **금지**. 불명확한 타입은 `unknown` + 타입 가드
- strict 모드 활성화
- 모든 함수 반환 타입 명시 권장

## Barrel Export

- 각 feature/entity는 `index.ts`에서만 외부 노출
- 내부 파일을 외부에서 직접 import 금지

```typescript
// ❌ 금지
import { RecipeCard } from '@/entities/recipe/ui/RecipeCard'

// ✅ 허용
import { RecipeCard } from '@/entities/recipe'
```

## 좋은 코드 원칙 (Toss 기준)

1. 변경하기 쉬운 코드
2. **하나의 컴포넌트 = 하나의 기능**
3. 상관없는 데이터는 분리
4. 복잡한 로직은 함수명으로 의도 표현
5. 상수에 이름 부여
6. 시점 이동 줄이기 (스크롤 최소화)
7. 구체적인 변수명 (로직이 예측 가능하게)
8. 응집도 고려: 같이 수정되는 파일은 같은 디렉토리
9. 결합도 낮추기
10. 중복 코드는 3번 이상 반복 시 추출
11. props drilling 제거 (컴포지션 패턴)