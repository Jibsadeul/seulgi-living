import { errors } from '@/shared/lib/error';
import {
  recipeDetailParamsSchema,
  recipeDetailResponseSchema,
  recipeListQuerySchema,
  recipeListResponseSchema,
  recipeRecommendationQuerySchema,
  recipeScrapListQuerySchema,
  type CookingMethod,
  type RecipeCategory,
  type RecipeListQuery,
  type RecipeRecommendationType,
  type RecipeScrapListQuery,
} from '@repo/contract';
import { prisma } from '@repo/db';

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

type SimpleRecommendationType = Exclude<RecipeRecommendationType, 'fridge'>;

function getSimpleRecommendationCondition(type: SimpleRecommendationType): string {
  if (type === 'speed')
    return '(SELECT COUNT(*) FROM recipe_steps s WHERE s.recipe_id = r.id) BETWEEN 1 AND 3';
  if (type === 'diet')
    return 'r.calories IS NOT NULL AND r.protein IS NOT NULL AND r.calories <= 150 AND r.protein >= 20';
  return 'r.calories IS NOT NULL AND r.calories >= 400';
}

function getSimpleRecommendationOrderBy(type: SimpleRecommendationType): string {
  if (type === 'diet') return 'r.calories ASC, "scrapCount" DESC, r.id DESC';
  if (type === 'speed')
    return '(SELECT COUNT(*) FROM recipe_steps s WHERE s.recipe_id = r.id) ASC, "scrapCount" DESC, r.id DESC';
  return 'r.created_at DESC, "scrapCount" DESC, r.id DESC';
}

async function getSimpleRecommendations(
  type: SimpleRecommendationType,
  userId: string,
  page: number,
  size: number,
) {
  const offset = (page - 1) * size;
  const condition = getSimpleRecommendationCondition(type);
  const orderBy = getSimpleRecommendationOrderBy(type);

  const countRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `SELECT COUNT(*)::int AS "totalCount" FROM recipes r WHERE ${condition}`,
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
        COUNT(rs.recipe_id)::int AS "scrapCount",
        EXISTS (
          SELECT 1 FROM recipe_scraps saved
          WHERE saved.recipe_id = r.id AND saved.user_id = $1::uuid
        ) AS "isSaved"
      FROM recipes r
      LEFT JOIN recipe_scraps rs ON rs.recipe_id = r.id
      WHERE ${condition}
      GROUP BY r.id
      ORDER BY ${orderBy}
      LIMIT $2
      OFFSET $3
    `,
    userId,
    size,
    offset,
  );

  return recipeListResponseSchema.parse({
    items: rows.map((row) => ({ ...row, scrapCount: toNumber(row.scrapCount) })),
    page,
    size,
    totalCount,
    hasNextPage: offset + rows.length < totalCount,
  });
}

async function getFridgeRecommendations(userId: string, page: number, size: number) {
  const offset = (page - 1) * size;

  const safeIngredientsExpr = `
    CASE WHEN jsonb_typeof(r.ingredients) = 'array' THEN r.ingredients ELSE '[]'::jsonb END
  `;
  const safeItemsExpr = `
    CASE WHEN jsonb_typeof(sec->'items') = 'array' THEN sec->'items' ELSE '[]'::jsonb END
  `;

  const countRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      WITH user_fridge AS (
        SELECT DISTINCT name FROM fridge_ingredients WHERE user_id = $1::uuid
      ),
      recipe_matched_fridge AS (
        SELECT DISTINCT r.id
        FROM recipes r
        JOIN user_fridge f ON true,
        LATERAL jsonb_array_elements(${safeIngredientsExpr}) AS sec,
        LATERAL jsonb_array_elements_text(${safeItemsExpr}) AS item_val
        WHERE item_val ILIKE '%' || f.name || '%'
      )
      SELECT COUNT(*)::int AS "totalCount" FROM recipe_matched_fridge
    `,
    userId,
  );
  const totalCount = toNumber(countRows[0]?.totalCount);

  if (totalCount === 0) {
    return recipeListResponseSchema.parse({
      items: [],
      page,
      size,
      totalCount: 0,
      hasNextPage: false,
    });
  }

  const rows = await prisma.$queryRawUnsafe<RecipeListRow[]>(
    `
      WITH user_fridge AS (
        SELECT DISTINCT name FROM fridge_ingredients WHERE user_id = $1::uuid
      ),
      fridge_count AS (
        SELECT COUNT(*)::int AS total FROM user_fridge
      ),
      recipe_matched_fridge AS (
        SELECT
          r.id,
          COUNT(DISTINCT f.name)::int AS matched_count
        FROM recipes r
        JOIN user_fridge f ON true,
        LATERAL jsonb_array_elements(${safeIngredientsExpr}) AS sec,
        LATERAL jsonb_array_elements_text(${safeItemsExpr}) AS item_val
        WHERE item_val ILIKE '%' || f.name || '%'
        GROUP BY r.id
      )
      SELECT
        r.id::text AS id,
        r.name AS name,
        r.category::text AS category,
        r.cooking_method::text AS "cookingMethod",
        COALESCE(r.thumbnail_url, r.main_image_url) AS "imageUrl",
        COUNT(rs.recipe_id)::int AS "scrapCount",
        EXISTS (
          SELECT 1 FROM recipe_scraps saved
          WHERE saved.recipe_id = r.id AND saved.user_id = $1::uuid
        ) AS "isSaved"
      FROM recipes r
      JOIN recipe_matched_fridge rmf ON rmf.id = r.id
      CROSS JOIN fridge_count fc
      LEFT JOIN recipe_scraps rs ON rs.recipe_id = r.id
      GROUP BY r.id, rmf.matched_count, fc.total
      ORDER BY (rmf.matched_count::float / NULLIF(fc.total, 0)) DESC, "scrapCount" DESC, r.id DESC
      LIMIT $2
      OFFSET $3
    `,
    userId,
    size,
    offset,
  );

  return recipeListResponseSchema.parse({
    items: rows.map((row) => ({ ...row, scrapCount: toNumber(row.scrapCount) })),
    page,
    size,
    totalCount,
    hasNextPage: offset + rows.length < totalCount,
  });
}

export async function getRecommendedRecipes(queryInput: unknown, userId: string) {
  const query = recipeRecommendationQuerySchema.parse(queryInput);
  const { type, page, size } = query;

  if (type === 'fridge') {
    return getFridgeRecommendations(userId, page, size);
  }

  return getSimpleRecommendations(type, userId, page, size);
}
