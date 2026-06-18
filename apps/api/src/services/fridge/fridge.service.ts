import { addFridgeIngredientBodySchema } from '@repo/contract';
import { prisma } from '@repo/db';

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
