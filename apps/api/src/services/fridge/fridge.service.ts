import {
  addFridgeIngredientBodySchema,
  fridgeIngredientListResponseSchema,
  updateFridgeIngredientBodySchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { errors } from '@/shared/lib/error';

export async function getFridgeIngredients(memberId: string) {
  const ingredients = await prisma.fridgeIngredient.findMany({
    where: { userId: memberId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      imageKey: true,
      category: true,
      quantity: true,
      unit: true,
      createdAt: true,
    },
  });

  return fridgeIngredientListResponseSchema.parse({
    items: ingredients.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function addFridgeIngredient(memberId: string, bodyInput: unknown): Promise<void> {
  const body = addFridgeIngredientBodySchema.parse(bodyInput);

  await prisma.fridgeIngredient.create({
    data: {
      userId: memberId,
      name: body.name,
      imageKey: body.imageKey,
      category: body.category,
      quantity: body.quantity,
      unit: body.unit,
    },
  });
}

export async function updateFridgeIngredient(
  memberId: string,
  ingredientId: string,
  bodyInput: unknown,
): Promise<void> {
  const body = updateFridgeIngredientBodySchema.parse(bodyInput);

  const result = await prisma.fridgeIngredient.updateMany({
    where: {
      id: ingredientId,
      userId: memberId,
    },
    data: body,
  });

  if (result.count === 0) {
    throw errors.notFound('냉장고 재료를 찾을 수 없습니다.');
  }
}
