import { putGroceryBudgetBodySchema } from '@repo/contract';
import { prisma } from '@repo/db';

export async function upsertGroceryBudget(
  memberId: string,
  year: number,
  month: number,
  bodyInput: unknown,
): Promise<void> {
  const body = putGroceryBudgetBodySchema.parse(bodyInput);

  await prisma.groceryBudget.upsert({
    where: { userId_year_month: { userId: memberId, year, month } },
    update: { budget: body.budget },
    create: { userId: memberId, year, month, budget: body.budget },
  });
}
