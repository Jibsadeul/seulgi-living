# 공유 딥링크 헬퍼 명세

## 목적

정책/레시피 등 여러 도메인의 상세 화면 공유 기능에서 공통으로 쓸, 딥링크 랜딩 페이지 URL 생성 함수를 제공한다. 도메인별로 중복 구현하지 않도록 `shared/lib`에 둔다.

---

## 함수

`shared/lib/share.ts`

```ts
function buildShareLandingUrl(domain: 'policies' | 'recipes', id: string): string;
```

- 반환값: `https://[github-user].github.io/[repo]/share/?domain={domain}&id={id}` (`web/share/specs/share-landing.spec.md` 참고)
- 랜딩 페이지 base URL은 환경변수가 아니라 상수로 고정한다(모바일 앱은 별도 `.env` 분기 없이 단일 공개 URL만 가리키면 되므로, 환경별 분기는 과한 추상화).
- `domain` 유니언 타입은 실제로 공유 기능이 연동된 도메인만 추가한다 — 현재는 `policies`만 사용, `recipes`는 공유 버튼 연동 시점에 추가.

---

## 사용처

- `screens/policies/ui/PoliciesDetailScreen.tsx`의 `handleSharePress`에서 기존 공유 텍스트 마지막 줄에 `buildShareLandingUrl('policies', policy.id)` 결과를 추가한다.
- 레시피 등 다른 도메인은 공유 버튼이 아직 미연동 상태라 이번 작업 범위에 포함하지 않는다.

---

## 검증 기준

- `shared` 레이어 함수이므로 `entities`/`screens`를 import하지 않는다.
- 함수는 순수 문자열 조합만 하며 부수효과가 없다(테스트 용이성).
