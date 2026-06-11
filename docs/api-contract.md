# API 계약 (API Contract)

**아직 적용 금지. 수정 필요**

> 수정 시 팀 합의 필요. 개인 단독 수정 금지.  
> 모든 타입은 `packages/contract/`에 Zod 스키마로 정의됩니다.

## 엔드포인트 목록

### 인증

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/kakao` | ✗ | 카카오 OAuth 로그인/회원가입 |
| DELETE | `/api/auth/logout` | ✓ | 로그아웃 |
| DELETE | `/api/auth/withdraw` | ✓ | 회원탈퇴 |

### 사용자

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/users/me` | ✓ | 내 프로필 조회 |
| PATCH | `/api/users/me` | ✓ | 프로필 수정 (닉네임/나이/거주지) |

### 레시피

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/recipes` | ✗ | 레시피 목록 (검색/필터/정렬) |
| GET | `/api/recipes/:id` | ✗ | 레시피 상세 |
| POST | `/api/recipes` | ✓ | 레시피 등록 |
| PATCH | `/api/recipes/:id` | ✓ | 레시피 수정 (본인만) |
| POST | `/api/recipes/:id/scrap` | ✓ | 레시피 스크랩 |
| DELETE | `/api/recipes/:id/scrap` | ✓ | 레시피 스크랩 해제 |

### 냉장고

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/fridge` | ✓ | 냉장고 재료 목록 |
| POST | `/api/fridge` | ✓ | 재료 추가 |
| PATCH | `/api/fridge/:id` | ✓ | 재료 수량 수정 |
| DELETE | `/api/fridge/:id` | ✓ | 재료 삭제 |

### 장보기 내역

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/food-expenses` | ✓ | 장보기 내역 목록 |
| POST | `/api/food-expenses` | ✓ | 내역 등록 (영수증 OCR 결과 포함) |

### 청년 정책

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/policies` | ✗ | 정책 목록 (카테고리/마감임박 필터) |
| GET | `/api/policies/:id` | ✗ | 정책 상세 |
| POST | `/api/policies/:id/scrap` | ✓ | 정책 스크랩 |
| DELETE | `/api/policies/:id/scrap` | ✓ | 정책 스크랩 해제 |
| GET | `/api/policy-scrap-folders` | ✓ | 스크랩 폴더 목록 |
| POST | `/api/policy-scrap-folders` | ✓ | 폴더 생성 |

### 편의시설

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/facilities` | ✗ | 주변 편의시설 목록 (위도/경도/카테고리) |

### AI 채팅

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/ai/chat` | ✗ | AI 채팅 메시지 전송 (SSE 스트리밍) |

### OCR

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/ocr/ingredients` | ✓ | 식재료 사진 분석 |
| POST | `/api/ocr/receipt` | ✓ | 영수증 분석 |

---

## 공통 응답 형식

```typescript
// 성공
{ data: T, message?: string }

// 에러
{ error: string, code: string }
```

## Query Parameter 규칙

- 목록 API: `page`, `limit`, `sort`, `order`
- 레시피 필터: `keyword`, `category`, `sortBy` (latest|views|ingredients)
- 정책 필터: `category` (housing|employment|welfare|scholarship), `deadline` (imminent)
- 편의시설 필터: `lat`, `lng`, `radius`, `category` (laundry|convenience|mart|restaurant)