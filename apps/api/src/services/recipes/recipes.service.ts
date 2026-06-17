import {
  recipeDetailParamsSchema,
  recipeDetailResponseSchema,
  recipeListQuerySchema,
  recipeListResponseSchema,
  type CookingMethod,
  type RecipeCategory,
  type RecipeListQuery,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { errors } from '@/shared/lib/error';

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
