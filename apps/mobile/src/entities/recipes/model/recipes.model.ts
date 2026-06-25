import type { RecipeCategory, CookingMethod, RecipeLevel } from '../api/recipes.schema';
import type { RecipeTag } from '../ui/RecipeCard';

const CATEGORY_TAG_MAP: Record<RecipeCategory, RecipeTag> = {
  SOUP_STEW: { label: '국/찌개', variant: 'pink' },
  SIDE_DISH: { label: '반찬', variant: 'pink' },
  RICE_PORRIDGE: { label: '밥/죽', variant: 'pink' },
  DESSERT: { label: '후식', variant: 'pink' },
  OTHER: { label: '기타', variant: 'pink' },
};

const COOKING_METHOD_TAG_MAP: Record<CookingMethod, RecipeTag> = {
  GRILL: { label: '구이', variant: 'blue' },
  BOIL: { label: '끓이기', variant: 'blue' },
  STIR_FRY: { label: '볶음', variant: 'blue' },
  STEAM: { label: '찜', variant: 'blue' },
  FRY: { label: '튀김', variant: 'blue' },
  BRAISE: { label: '조림', variant: 'blue' },
  PAN_FRY: { label: '부침', variant: 'blue' },
  OTHER: { label: '기타', variant: 'blue' },
};

const CATEGORY_LABEL_MAP: Record<RecipeCategory, string> = {
  SOUP_STEW: '국/찌개',
  SIDE_DISH: '반찬',
  RICE_PORRIDGE: '밥/죽',
  DESSERT: '후식',
  OTHER: '기타',
};

const COOKING_METHOD_LABEL_MAP: Record<CookingMethod, string> = {
  GRILL: '구이',
  BOIL: '끓이기',
  STIR_FRY: '볶음',
  STEAM: '찜',
  FRY: '튀김',
  BRAISE: '조림',
  PAN_FRY: '부침',
  OTHER: '기타',
};

export function getCategoryTag(category: RecipeCategory): RecipeTag {
  return CATEGORY_TAG_MAP[category];
}

export function getCookingMethodTag(method: CookingMethod): RecipeTag {
  return COOKING_METHOD_TAG_MAP[method];
}

export function getCategoryLabel(category: RecipeCategory): string {
  return CATEGORY_LABEL_MAP[category];
}

export function getCookingMethodLabel(method: CookingMethod): string {
  return COOKING_METHOD_LABEL_MAP[method];
}

const LEVEL_TAG_MAP: Record<RecipeLevel, RecipeTag> = {
  LOW: { label: '초급', variant: 'green' },
  MEDIUM: { label: '중급', variant: 'green' },
  HIGH: { label: '상급', variant: 'green' },
};

export function getLevelTag(level: RecipeLevel): RecipeTag {
  return LEVEL_TAG_MAP[level];
}

export function getRecipeTags(
  category: RecipeCategory,
  method: CookingMethod,
  level?: RecipeLevel,
): RecipeTag[] {
  const tags = [getCategoryTag(category), getCookingMethodTag(method)];
  if (level) tags.push(getLevelTag(level));
  return tags;
}

export function getRecipeSummary(category: RecipeCategory, method: CookingMethod): string {
  const methodLabel = COOKING_METHOD_LABEL_MAP[method];
  const categoryLabel = CATEGORY_LABEL_MAP[category];
  return `${methodLabel}로 만드는 ${categoryLabel} 레시피`;
}
