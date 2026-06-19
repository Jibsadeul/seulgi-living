import type { RecipeCategory, CookingMethod } from '../api/recipes.schema';
import type { RecipeTag } from '../ui/RecipeCard';

const CATEGORY_TAG_MAP: Record<RecipeCategory, RecipeTag> = {
  SOUP_STEW: { label: '국/찌개', variant: 'blue' },
  SIDE_DISH: { label: '반찬', variant: 'green' },
  RICE_PORRIDGE: { label: '밥/죽', variant: 'blue' },
  DESSERT: { label: '후식', variant: 'pink' },
  OTHER: { label: '기타', variant: 'grey' },
};

const COOKING_METHOD_TAG_MAP: Record<CookingMethod, RecipeTag> = {
  GRILL: { label: '구이', variant: 'orange' },
  BOIL: { label: '끓이기', variant: 'orange' },
  STIR_FRY: { label: '볶음', variant: 'yellow' },
  STEAM: { label: '찜', variant: 'orange' },
  FRY: { label: '튀김', variant: 'orange' },
  BRAISE: { label: '조림', variant: 'orange' },
  PAN_FRY: { label: '부침', variant: 'orange' },
  OTHER: { label: '기타', variant: 'grey' },
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

export function getRecipeTags(category: RecipeCategory, method: CookingMethod): RecipeTag[] {
  return [getCategoryTag(category), getCookingMethodTag(method)];
}
