import {
  recipeCreateBodySchema,
  recipeCreateResponseSchema,
  recipeDetailParamsSchema,
  recipeDetailResponseSchema,
  recipeListQuerySchema,
  recipeListResponseSchema,
  recipeScrapListQuerySchema,
  recipeDeleteResponseSchema,
  recipeUpdateBodySchema,
  recipeUpdateResponseSchema,
  type CookingMethod,
  type RecipeCreateBody,
  type RecipeCategory,
  type RecipeListQuery,
  type RecipeScrapListQuery,
  type RecipeUpdateBody,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { errors } from '@/shared/lib/error';
import {
  deleteRecipeImages,
  deleteRecipeImagesByUrls,
  uploadRecipeImage,
} from '@/shared/external/s3-storage.client';
import { randomUUID } from 'crypto';

type ListRecipesContext = {
  userId?: string;
};

type GetRecipeDetailContext = {
  userId?: string;
};

type RecipeListRow = {
  id: string;
  name: string;
  category: RecipeCategory;
  cookingMethod: CookingMethod;
  imageUrl: string;
  scrapCount: number | bigint | string;
  isSaved: boolean;
};

type CountRow = {
  totalCount: number | bigint | string;
};

type CreateRecipeInput = {
  memberId: string;
  body: RecipeCreateBody;
  mainImage: File;
  stepImages: Map<number, File>;
};

type UpdateRecipeInput = {
  recipeId: string;
  memberId: string;
  body: RecipeUpdateBody;
  mainImage?: File;
  stepImages: Map<number, File>;
  editableRecipe?: EditableRecipe;
};

type EditableRecipe = {
  id: string;
  source: 'PUBLIC' | 'USER';
  userId: string | null;
  mainImageUrl: string;
  recipeSteps: {
    imageUrl: string | null;
  }[];
};

function normalizeArray<T>(value: T | T[] | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function toNumber(value: number | bigint | string | undefined) {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return value ?? 0;
}

function buildWhereClause(query: RecipeListQuery) {
  const values: unknown[] = [];
  const conditions = [`r.source::text = ANY($${values.push(['PUBLIC', 'USER'])}::text[])`];
  const cookingMethods = normalizeArray(query.cookingMethod);
  const categories = normalizeArray(query.category);

  if (cookingMethods) {
    conditions.push(`r.cooking_method::text = ANY($${values.push(cookingMethods)}::text[])`);
  }

  if (categories) {
    conditions.push(`r.category::text = ANY($${values.push(categories)}::text[])`);
  }

  const levels = normalizeArray(query.level);

  if (levels) {
    conditions.push(`(
      SELECT CASE
        WHEN step_count + ingredient_count <= 15 THEN 'LOW'
        WHEN step_count + ingredient_count <= 20 THEN 'MEDIUM'
        ELSE 'HIGH'
      END
      FROM (
        SELECT
          (SELECT COUNT(*) FROM recipe_steps WHERE recipe_id = r.id) AS step_count,
          COALESCE((
            SELECT SUM(jsonb_array_length(s.val -> 'items'))
            FROM jsonb_array_elements(
              CASE WHEN jsonb_typeof(r.ingredients) = 'array'
                   THEN r.ingredients ELSE '[]'::jsonb END
            ) AS s(val)
          ), 0) AS ingredient_count
      ) score
    ) = ANY($${values.push(levels)}::text[])`);
  }

  if (query.keyword) {
    const keywordParam = `$${values.push(`%${query.keyword}%`)}`;
    conditions.push(`(
      r.name ILIKE ${keywordParam}
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(r.ingredients) = 'array' THEN r.ingredients
            ELSE '[]'::jsonb
          END
        ) AS ingredient_section(section_value)
        CROSS JOIN jsonb_array_elements_text(
          CASE
            WHEN jsonb_typeof(ingredient_section.section_value->'items') = 'array'
            THEN ingredient_section.section_value->'items'
            ELSE '[]'::jsonb
          END
        ) AS ingredient_item(item_value)
        WHERE ingredient_item.item_value ILIKE ${keywordParam}
      )
    )`);
  }

  return {
    sql: conditions.join(' AND '),
    values,
  };
}

function getOrderByClause(sort: RecipeListQuery['sort']) {
  if (sort === 'oldest') {
    return 'r.created_at ASC, r.id ASC';
  }

  if (sort === 'popular') {
    return '"scrapCount" DESC, r.created_at DESC, r.id DESC';
  }

  return 'r.created_at DESC, r.id DESC';
}

function toPagination(query: RecipeScrapListQuery) {
  return {
    limit: query.size,
    offset: (query.page - 1) * query.size,
  };
}

export async function getRecipeList(queryInput: unknown, context: ListRecipesContext = {}) {
  const query = recipeListQuerySchema.parse(queryInput);
  const { sql: whereClause, values: whereValues } = buildWhereClause(query);
  const offset = (query.page - 1) * query.size;

  const countRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS "totalCount"
      FROM recipes r
      WHERE ${whereClause}
    `,
    ...whereValues,
  );
  const totalCount = toNumber(countRows[0]?.totalCount);
  const rowValues = [...whereValues];
  const isSavedExpression = context.userId
    ? `EXISTS (
        SELECT 1
        FROM recipe_scraps saved
        WHERE saved.recipe_id = r.id
          AND saved.user_id = $${rowValues.push(context.userId)}::uuid
      )`
    : 'FALSE';
  const limitParam = `$${rowValues.push(query.size)}`;
  const offsetParam = `$${rowValues.push(offset)}`;
  const rows = await prisma.$queryRawUnsafe<RecipeListRow[]>(
    `
      SELECT
        r.id::text AS id,
        r.name AS name,
        r.category::text AS category,
        r.cooking_method::text AS "cookingMethod",
        COALESCE(r.thumbnail_url, r.main_image_url) AS "imageUrl",
        COUNT(rs.recipe_id)::int AS "scrapCount",
        ${isSavedExpression} AS "isSaved"
      FROM recipes r
      LEFT JOIN recipe_scraps rs ON rs.recipe_id = r.id
      WHERE ${whereClause}
      GROUP BY r.id
      ORDER BY ${getOrderByClause(query.sort)}
      LIMIT ${limitParam}
      OFFSET ${offsetParam}
    `,
    ...rowValues,
  );

  return recipeListResponseSchema.parse({
    items: rows.map((row) => ({
      ...row,
      scrapCount: toNumber(row.scrapCount),
    })),
    page: query.page,
    size: query.size,
    totalCount,
    hasNextPage: offset + rows.length < totalCount,
  });
}

export async function getScrappedRecipeList(queryInput: unknown, memberId: string) {
  const query = recipeScrapListQuerySchema.parse(queryInput);
  const { limit, offset } = toPagination(query);

  const countRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS "totalCount"
      FROM recipe_scraps user_scrap
      JOIN recipes r ON r.id = user_scrap.recipe_id
      WHERE user_scrap.user_id = $1::uuid
    `,
    memberId,
  );
  const totalCount = toNumber(countRows[0]?.totalCount);

  const rows = await prisma.$queryRawUnsafe<RecipeListRow[]>(
    `
      SELECT
        r.id::text AS id,
        r.name AS name,
        r.category::text AS category,
        r.cooking_method::text AS "cookingMethod",
        COALESCE(r.thumbnail_url, r.main_image_url) AS "imageUrl",
        COUNT(all_scraps.recipe_id)::int AS "scrapCount",
        TRUE AS "isSaved"
      FROM recipe_scraps user_scrap
      JOIN recipes r ON r.id = user_scrap.recipe_id
      LEFT JOIN recipe_scraps all_scraps ON all_scraps.recipe_id = r.id
      WHERE user_scrap.user_id = $1::uuid
      GROUP BY r.id, user_scrap.created_at
      ORDER BY user_scrap.created_at DESC, r.id DESC
      LIMIT $2
      OFFSET $3
    `,
    memberId,
    limit,
    offset,
  );

  return recipeListResponseSchema.parse({
    items: rows.map((row) => ({
      ...row,
      scrapCount: toNumber(row.scrapCount),
    })),
    page: query.page,
    size: query.size,
    totalCount,
    hasNextPage: offset + rows.length < totalCount,
  });
}

export async function getMyRecipeList(queryInput: unknown, memberId: string) {
  const query = recipeScrapListQuerySchema.parse(queryInput);
  const { limit, offset } = toPagination(query);

  const countRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS "totalCount"
      FROM recipes r
      WHERE r.source = 'USER'
        AND r.user_id = $1::uuid
    `,
    memberId,
  );
  const totalCount = toNumber(countRows[0]?.totalCount);

  const rows = await prisma.$queryRawUnsafe<RecipeListRow[]>(
    `
      SELECT
        r.id::text AS id,
        r.name AS name,
        r.category::text AS category,
        r.cooking_method::text AS "cookingMethod",
        COALESCE(r.thumbnail_url, r.main_image_url) AS "imageUrl",
        COUNT(all_scraps.recipe_id)::int AS "scrapCount",
        EXISTS (
          SELECT 1
          FROM recipe_scraps saved
          WHERE saved.recipe_id = r.id
            AND saved.user_id = $1::uuid
        ) AS "isSaved"
      FROM recipes r
      LEFT JOIN recipe_scraps all_scraps ON all_scraps.recipe_id = r.id
      WHERE r.source = 'USER'
        AND r.user_id = $1::uuid
      GROUP BY r.id
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $2
      OFFSET $3
    `,
    memberId,
    limit,
    offset,
  );

  return recipeListResponseSchema.parse({
    items: rows.map((row) => ({
      ...row,
      scrapCount: toNumber(row.scrapCount),
    })),
    page: query.page,
    size: query.size,
    totalCount,
    hasNextPage: offset + rows.length < totalCount,
  });
}

export async function getRecipeDetail(
  recipeIdInput: unknown,
  context: GetRecipeDetailContext = {},
) {
  const { recipeId } = recipeDetailParamsSchema.parse({ recipeId: recipeIdInput });
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      source: { in: ['PUBLIC', 'USER'] },
    },
    select: {
      id: true,
      name: true,
      category: true,
      cookingMethod: true,
      mainImageUrl: true,
      ingredients: true,
      sodiumTip: true,
      user: {
        select: {
          nickname: true,
        },
      },
      recipeSteps: {
        orderBy: {
          stepNumber: 'asc',
        },
        select: {
          imageUrl: true,
          content: true,
        },
      },
      recipeScraps: context.userId
        ? {
            where: {
              userId: context.userId,
            },
            select: {
              userId: true,
            },
          }
        : false,
      _count: {
        select: {
          recipeScraps: true,
        },
      },
    },
  });

  if (!recipe) {
    throw errors.notFound('레시피를 찾을 수 없습니다.');
  }

  return recipeDetailResponseSchema.parse({
    scrap: {
      scrapCount: recipe._count.recipeScraps,
      isSaved: context.userId ? recipe.recipeScraps.length > 0 : false,
    },
    recipe: {
      id: recipe.id,
      authorNickname: recipe.user?.nickname ?? null,
      name: recipe.name,
      category: recipe.category,
      cookingMethod: recipe.cookingMethod,
      mainImageUrl: recipe.mainImageUrl,
      ingredients: recipe.ingredients,
      steps: recipe.recipeSteps.map((step) => ({
        imageUrl: step.imageUrl,
        description: step.content,
      })),
      sodiumTip: recipe.sodiumTip,
    },
  });
}

export async function createRecipe(input: CreateRecipeInput) {
  const body = recipeCreateBodySchema.parse(input.body);
  const recipeId = randomUUID();
  const uploadedImages: { key: string; url: string }[] = [];

  try {
    const mainImage = await uploadRecipeImage({
      file: input.mainImage,
      memberId: input.memberId,
      recipeId,
      kind: 'main',
    });
    uploadedImages.push(mainImage);

    const stepImageUrls = new Map<number, string>();
    for (const [stepIndex, file] of input.stepImages.entries()) {
      if (stepIndex < 0 || stepIndex >= body.steps.length) {
        throw errors.validation('조리 단계 이미지 index가 올바르지 않습니다.');
      }

      const uploadedStepImage = await uploadRecipeImage({
        file,
        memberId: input.memberId,
        recipeId,
        kind: 'step',
        stepIndex,
      });
      uploadedImages.push(uploadedStepImage);
      stepImageUrls.set(stepIndex, uploadedStepImage.url);
    }

    await prisma.$transaction(async (tx) => {
      await tx.recipe.create({
        data: {
          id: recipeId,
          source: 'USER',
          userId: input.memberId,
          name: body.name,
          category: body.category,
          cookingMethod: body.cookingMethod,
          ingredients: body.ingredients,
          mainImageUrl: mainImage.url,
          thumbnailUrl: null,
          sodiumTip: body.sodiumTip,
          recipeSteps: {
            create: body.steps.map((step, index) => ({
              stepNumber: index + 1,
              content: step.description,
              imageUrl: stepImageUrls.get(index) ?? null,
            })),
          },
        },
      });
    });

    return recipeCreateResponseSchema.parse({ recipeId });
  } catch (error) {
    await deleteRecipeImages(uploadedImages);
    throw error;
  }
}

export async function updateRecipe(input: UpdateRecipeInput) {
  const { recipeId } = recipeDetailParamsSchema.parse({ recipeId: input.recipeId });
  const body = recipeUpdateBodySchema.parse(input.body);
  const uploadedImages: { key: string; url: string }[] = [];
  const oldImageUrlsToDelete = new Set<string>();

  const recipe = input.editableRecipe ?? (await getEditableRecipe(input.memberId, recipeId));

  if (Boolean(input.mainImage) === Boolean(body.mainImageUrl)) {
    throw errors.validation('mainImage 또는 mainImageUrl 중 하나만 전송해야 합니다.');
  }

  const existingStepImageUrls = new Set(
    recipe.recipeSteps.flatMap((step) => (step.imageUrl ? [step.imageUrl] : [])),
  );

  for (const [stepIndex] of input.stepImages.entries()) {
    if (stepIndex < 0 || stepIndex >= body.steps.length) {
      throw errors.validation('조리 단계 이미지 index가 올바르지 않습니다.');
    }
  }

  body.steps.forEach((step, index) => {
    if (step.imageUrl && input.stepImages.has(index)) {
      throw errors.validation(
        '기존 조리 단계 이미지 URL과 새 이미지 파일을 동시에 보낼 수 없습니다.',
      );
    }

    if (step.imageUrl && !existingStepImageUrls.has(step.imageUrl)) {
      throw errors.validation('조리 단계 이미지 URL이 올바르지 않습니다.');
    }
  });

  if (body.mainImageUrl && body.mainImageUrl !== recipe.mainImageUrl) {
    throw errors.validation('대표 이미지 URL이 올바르지 않습니다.');
  }

  try {
    let nextMainImageUrl = recipe.mainImageUrl;
    if (input.mainImage) {
      const uploadedMainImage = await uploadRecipeImage({
        file: input.mainImage,
        memberId: input.memberId,
        recipeId,
        kind: 'main',
      });
      uploadedImages.push(uploadedMainImage);
      nextMainImageUrl = uploadedMainImage.url;
      oldImageUrlsToDelete.add(recipe.mainImageUrl);
    }

    const stepImageUrls = new Map<number, string>();
    for (const [stepIndex, file] of input.stepImages.entries()) {
      const uploadedStepImage = await uploadRecipeImage({
        file,
        memberId: input.memberId,
        recipeId,
        kind: 'step',
        stepIndex,
      });
      uploadedImages.push(uploadedStepImage);
      stepImageUrls.set(stepIndex, uploadedStepImage.url);
    }

    const keptStepImageUrls = new Set<string>();
    const nextSteps = body.steps.map((step, index) => {
      const nextImageUrl = stepImageUrls.get(index) ?? step.imageUrl ?? null;

      if (nextImageUrl && existingStepImageUrls.has(nextImageUrl)) {
        keptStepImageUrls.add(nextImageUrl);
      }

      return {
        stepNumber: index + 1,
        content: step.description,
        imageUrl: nextImageUrl,
      };
    });

    existingStepImageUrls.forEach((url) => {
      if (!keptStepImageUrls.has(url)) {
        oldImageUrlsToDelete.add(url);
      }
    });

    await prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id: recipeId },
        data: {
          name: body.name,
          category: body.category,
          cookingMethod: body.cookingMethod,
          ingredients: body.ingredients,
          mainImageUrl: nextMainImageUrl,
          thumbnailUrl: null,
          sodiumTip: body.sodiumTip,
          recipeSteps: {
            deleteMany: {},
            create: nextSteps,
          },
        },
      });
    });

    try {
      await deleteRecipeImagesByUrls([...oldImageUrlsToDelete]);
    } catch (deleteError) {
      console.error(deleteError);
    }

    return recipeUpdateResponseSchema.parse({ recipeId });
  } catch (error) {
    await deleteRecipeImages(uploadedImages);
    throw error;
  }
}

export async function getEditableRecipe(
  memberId: string,
  recipeIdInput: unknown,
): Promise<EditableRecipe> {
  const { recipeId } = recipeDetailParamsSchema.parse({ recipeId: recipeIdInput });
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      id: true,
      source: true,
      userId: true,
      mainImageUrl: true,
      recipeSteps: {
        orderBy: { stepNumber: 'asc' },
        select: {
          imageUrl: true,
        },
      },
    },
  });

  if (!recipe) {
    throw errors.notFound('레시피를 찾을 수 없습니다.');
  }

  if (recipe.source !== 'USER' || recipe.userId !== memberId) {
    throw errors.forbidden('수정 권한이 없습니다.');
  }

  return recipe;
}

export async function deleteRecipe(memberId: string, recipeIdInput: unknown) {
  const { recipeId } = recipeDetailParamsSchema.parse({ recipeId: recipeIdInput });
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      id: true,
      source: true,
      userId: true,
      mainImageUrl: true,
      recipeSteps: {
        select: {
          imageUrl: true,
        },
      },
    },
  });

  if (!recipe) {
    throw errors.notFound('레시피를 찾을 수 없습니다.');
  }

  if (recipe.source !== 'USER' || recipe.userId !== memberId) {
    throw errors.forbidden('삭제 권한이 없습니다.');
  }

  const imageUrlsToDelete = [
    recipe.mainImageUrl,
    ...recipe.recipeSteps.flatMap((step) => (step.imageUrl ? [step.imageUrl] : [])),
  ];

  await prisma.recipe.delete({
    where: { id: recipeId },
  });

  try {
    await deleteRecipeImagesByUrls(imageUrlsToDelete);
  } catch (deleteError) {
    console.error(deleteError);
  }

  return recipeDeleteResponseSchema.parse(null);
}

export async function scrapRecipe(memberId: string, recipeId: string): Promise<void> {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
  if (!recipe) throw errors.notFound('레시피를 찾을 수 없습니다.');

  const existing = await prisma.recipeScrap.findFirst({ where: { recipeId, userId: memberId } });
  if (!existing) {
    await prisma.recipeScrap.create({ data: { recipeId, userId: memberId } });
  }
}

export async function unscrapRecipe(memberId: string, recipeId: string): Promise<void> {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
  if (!recipe) throw errors.notFound('레시피를 찾을 수 없습니다.');

  await prisma.recipeScrap.deleteMany({ where: { recipeId, userId: memberId } });
}
