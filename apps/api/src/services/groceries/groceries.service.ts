import {
  createGroceryBodySchema,
  groceryListResponseSchema,
  grocerySummaryResponseSchema,
  putGroceryBudgetBodySchema,
  updateGroceryBodySchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { errors } from '@/shared/lib/error';

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

export async function getGrocerySummary(memberId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [budgetRecord, spentResult] = await Promise.all([
    prisma.groceryBudget.findUnique({
      where: { userId_year_month: { userId: memberId, year, month } },
      select: { budget: true },
    }),
    prisma.groceryPurchaseItem.aggregate({
      where: { userId: memberId, purchasedAt: { gte: start, lt: end } },
      _sum: { price: true },
    }),
  ]);

  return grocerySummaryResponseSchema.parse({
    budget: budgetRecord?.budget ?? null,
    spent: spentResult._sum.price ?? 0,
  });
}

export async function getGroceryList(memberId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const items = await prisma.groceryPurchaseItem.findMany({
    where: { userId: memberId, purchasedAt: { gte: start, lt: end } },
    orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      name: true,
      price: true,
      quantityText: true,
      purchasedAt: true,
    },
  });

  const groups = new Map<
    string,
    {
      date: string;
      dailyTotal: number;
      items: {
        id: string;
        name: string;
        price: number;
        quantityText: string | null;
      }[];
    }
  >();

  for (const item of items) {
    const date = item.purchasedAt.toISOString().slice(0, 10);
    const group = groups.get(date) ?? { date, dailyTotal: 0, items: [] };

    group.dailyTotal += item.price;
    group.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantityText: item.quantityText,
    });

    groups.set(date, group);
  }

  return groceryListResponseSchema.parse([...groups.values()]);
}

export async function createGroceryItem(memberId: string, bodyInput: unknown): Promise<void> {
  const body = createGroceryBodySchema.parse(bodyInput);

  await prisma.groceryPurchaseItem.create({
    data: {
      userId: memberId,
      name: body.name,
      price: body.price,
      purchasedAt: new Date(`${body.purchaseDate}T00:00:00.000Z`),
      quantityText: body.quantityText ?? null,
    },
  });
}

export async function updateGroceryItem(
  memberId: string,
  groceryId: string,
  bodyInput: unknown,
): Promise<void> {
  const body = updateGroceryBodySchema.parse(bodyInput);

  const result = await prisma.groceryPurchaseItem.updateMany({
    where: { id: groceryId, userId: memberId },
    data: {
      name: body.name,
      price: body.price,
      purchasedAt: new Date(`${body.purchaseDate}T00:00:00.000Z`),
      quantityText: body.quantityText ?? null,
    },
  });

  if (result.count === 0) {
    throw errors.notFound('장보기 내역을 찾을 수 없습니다.');
  }
}
