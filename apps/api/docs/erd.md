# ERD 및 DB 스키마

> 수정 시 팀 합의 필요. 개인 단독 수정 금지.  
> Prisma 스키마 위치: `packages/db/prisma/schema.prisma`

---

## 테이블 목록

### 지역 (행정구역)

**`sido`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | VARCHAR(2) | PK, NOT NULL |
| name | VARCHAR(50) | NOT NULL |

**`sigungu`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | VARCHAR(5) | PK, NOT NULL |
| sido_id | VARCHAR(2) | FK → sido.id, NOT NULL |
| name | VARCHAR(50) | NOT NULL |

> ⚠️ 이전 ERD의 `dong` 테이블 제거됨. `members`는 `sigungu`에 직접 연결.

---

### 사용자

**`members`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, NOT NULL |
| kakao_id | VARCHAR(255) | NOT NULL |
| sigungu_id | VARCHAR(5) | FK → sigungu.id, NULL |
| email | VARCHAR(255) | NULL |
| nickname | VARCHAR(100) | NULL |
| birthday | DATE | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (소프트 삭제) |

---

### 리프레쉬 토큰

**`refresh_token`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| user_id | UUID | PK, FK → members.id, NOT NULL |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |

---

### 레시피

**`recipes`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, NOT NULL |
| source | ENUM(recipe_source: PUBLIC, USER) | NOT NULL |
| user_id | UUID | FK → members.id, NULL (공공 레시피는 NULL) |
| public_recipe_id | VARCHAR(255) | NULL |
| name | VARCHAR(255) | NOT NULL |
| category | ENUM(recipe_category: SOUP_STEW, SIDE_DISH, RICE_PORRIDGE, DESSERT, OTHER) | NOT NULL |
| cooking_method | ENUM(cooking_method: GRILL, BOIL, STIR_FRY, STEAM, FRY, BRAISE, PAN_FRY, OTHER) | NOT NULL |
| ingredients_raw | TEXT | NULL |
| ingredients | JSONB | NOT NULL |
| main_image_url | TEXT | NOT NULL |
| thumbnail_url | TEXT | NULL |
| calories | DOUBLE | NULL |
| carbohydrate | DOUBLE | NULL |
| protein | DOUBLE | NULL |
| fat | DOUBLE | NULL |
| sodium | DOUBLE | NULL |
| sodium_tip | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

**`recipe_step`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, NOT NULL |
| recipe_id | UUID | FK → recipes.id, NOT NULL |
| step_number | INTEGER | NOT NULL |
| content | TEXT | NOT NULL |
| image_url | TEXT | NULL |

> UNIQUE(recipe_id, step_number)

**`recipe_scraps`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| recipe_id | UUID | PK(복합), FK → recipes.id, NOT NULL |
| user_id | UUID | PK(복합), FK → members.id, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| folder_id | UUID | NULL |

---

### 냉장고

**`fridge_ingredients`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, NOT NULL |
| user_id | UUID | FK → members.id, NOT NULL |
| name | VARCHAR(50) | NOT NULL |
| image_key | VARCHAR(50) | NOT NULL, DEFAULT 'DEFAULT' |
| quantity | INTEGER | NOT NULL |
| unit | VARCHAR(10) | NOT NULL |
| category | ENUM(ingredient_category: VEGETABLE, FRUIT, MEAT, SEAFOOD, EGG_DAIRY, GRAIN_NOODLE, PROCESSED, SAUCE_SEASONING, ETC) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

---

### 장보기 내역

**`grocery_purchase_items`** (구 `food_expense_items`)
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, NOT NULL |
| user_id | UUID | FK → members.id, NOT NULL |
| name | VARCHAR(50) | NOT NULL |
| quantity_text | VARCHAR(20) | NULL |
| price | INTEGER | NOT NULL |
| purchased_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

---

### 청년 정책

**`policy_scrap_folders`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | BIGSERIAL | PK, NOT NULL |
| user_id | UUID | FK → members.id, NOT NULL |
| folder_name | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

**`policy_scraps`**
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | BIGSERIAL | PK, NOT NULL |
| user_id | UUID | FK → members.id, NOT NULL |
| policy_id | VARCHAR(255) | NOT NULL (외부 API 정책 ID) |
| policy_scrap_folder_id | BIGSERIAL | FK → policy_scrap_folders.id, NULL |
| policy_name | VARCHAR(100) | NOT NULL |
| support_type | VARCHAR(100) | NULL |
| apply_start_date | DATE | NULL |
| apply_end_date | DATE | NULL |
| notification_sent | BOOLEAN | NOT NULL |
| created_at | TIMESTAMPTZ | NULL |

---

## 관계 다이어그램

```
sido ──< sigungu ──< members
                     │
                     ├──< fridge_ingredients
                     ├──< grocery_purchase_items
                     ├──< policy_scraps >── policy_scrap_folders
                     └──< recipe_scraps >── recipes ──< recipe_step
                                            (source=USER) ──< members
```

---

## 설계 원칙

- **청년 정책 데이터**: 외부 API 실시간 조회, DB 저장 안 함 (스크랩 메타데이터만 저장)
- **GPS 좌표**: DB 저장 금지, 편의시설 검색 목적에만 사용
- **소프트 삭제**: `members.deleted_at`
- **지역 단위**: `dong` 제거, `sigungu` 수준까지만 관리
