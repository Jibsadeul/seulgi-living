import { errors } from '@/shared/lib/error';
import {
  recipeCreateBodySchema,
  recipeCreateFormFieldsSchema,
  recipeCreateIngredientSchema,
  recipeCreateStepSchema,
  recipeUpdateBodySchema,
  recipeUpdateFormFieldsSchema,
  recipeUpdateStepSchema,
} from '@repo/contract';

export function toRecipeListQueryObject(searchParams: URLSearchParams) {
  const query: Record<string, string | string[]> = {};

  searchParams.forEach((_, key) => {
    const values = searchParams.getAll(key);
    query[key] = values.length > 1 ? values : (values[0] ?? '');
  });

  return query;
}

export function toRecipeScrapListQueryObject(searchParams: URLSearchParams) {
  return {
    page: searchParams.get('page') ?? undefined,
    size: searchParams.get('size') ?? undefined,
  };
}

function getRequiredString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== 'string') {
    throw errors.validation(`${name} 값이 필요합니다.`);
  }

  return value;
}

function getOptionalString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw errors.validation(`${name} 값이 올바르지 않습니다.`);
  }

  return value;
}

function getRequiredFile(formData: FormData, name: string) {
  const value = formData.get(name);
  if (!(value instanceof File)) {
    throw errors.validation(`${name} 파일이 필요합니다.`);
  }

  return value;
}

function getOptionalFile(formData: FormData, name: string) {
  const value = formData.get(name);
  if (value === null) {
    return undefined;
  }

  if (!(value instanceof File)) {
    throw errors.validation(`${name} 파일이 올바르지 않습니다.`);
  }

  return value;
}

function parseJsonField(value: string, name: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw errors.validation(`${name} 값은 올바른 JSON 문자열이어야 합니다.`);
  }
}

function getStepImages(formData: FormData) {
  const stepImages = new Map<number, File>();
  const stepImageKeyPattern = /^stepImages\[(\d+)]$/;

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('stepImages[')) {
      continue;
    }

    const match = stepImageKeyPattern.exec(key);
    if (!match) {
      throw errors.validation('조리 단계 이미지 필드명이 올바르지 않습니다.');
    }

    if (!(value instanceof File)) {
      throw errors.validation('조리 단계 이미지 파일이 올바르지 않습니다.');
    }

    stepImages.set(Number(match[1]), value);
  }

  return stepImages;
}

export function parseRecipeCreateFormData(formData: FormData) {
  const fields = recipeCreateFormFieldsSchema.parse({
    name: getRequiredString(formData, 'name'),
    cookingMethod: getRequiredString(formData, 'cookingMethod'),
    category: getRequiredString(formData, 'category'),
    ingredients: getRequiredString(formData, 'ingredients'),
    steps: getRequiredString(formData, 'steps'),
    sodiumTip: getOptionalString(formData, 'sodiumTip'),
  });

  return {
    body: recipeCreateBodySchema.parse({
      name: fields.name,
      cookingMethod: fields.cookingMethod,
      category: fields.category,
      ingredients: recipeCreateIngredientSchema
        .array()
        .parse(parseJsonField(fields.ingredients, 'ingredients')),
      steps: recipeCreateStepSchema.array().parse(parseJsonField(fields.steps, 'steps')),
      sodiumTip: fields.sodiumTip ?? null,
    }),
    mainImage: getRequiredFile(formData, 'mainImage'),
    stepImages: getStepImages(formData),
  };
}

export function parseRecipeUpdateFormData(formData: FormData) {
  const mainImage = getOptionalFile(formData, 'mainImage');
  const fields = recipeUpdateFormFieldsSchema.parse({
    mainImageUrl: getOptionalString(formData, 'mainImageUrl'),
    name: getRequiredString(formData, 'name'),
    cookingMethod: getRequiredString(formData, 'cookingMethod'),
    category: getRequiredString(formData, 'category'),
    ingredients: getRequiredString(formData, 'ingredients'),
    steps: getRequiredString(formData, 'steps'),
    sodiumTip: getOptionalString(formData, 'sodiumTip'),
  });

  return {
    body: recipeUpdateBodySchema.parse({
      mainImageUrl: fields.mainImageUrl,
      name: fields.name,
      cookingMethod: fields.cookingMethod,
      category: fields.category,
      ingredients: recipeCreateIngredientSchema
        .array()
        .parse(parseJsonField(fields.ingredients, 'ingredients')),
      steps: recipeUpdateStepSchema.array().parse(parseJsonField(fields.steps, 'steps')),
      sodiumTip: fields.sodiumTip ?? null,
    }),
    mainImage,
    stepImages: getStepImages(formData),
  };
}
