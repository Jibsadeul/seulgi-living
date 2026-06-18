import { addFridgeIngredientBodySchema, fridgeIngredientListResponseSchema } from '@repo/contract';
import { prisma } from '@repo/db';

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
