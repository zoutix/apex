import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const logFoodSchema = z.object({
  foodId: z.string().uuid(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  servings: z.number().positive(),
  date: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = logFoodSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const { foodId, mealType, servings, date } = validated.data;
    const logDate = date ? new Date(date) : new Date();
    logDate.setUTCHours(0, 0, 0, 0);

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }

    const dailyLog = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: session.userId,
          date: logDate,
        },
      },
      update: {},
      create: {
        userId: session.userId,
        date: logDate,
      },
    });

    const mealItem = await prisma.mealItem.create({
      data: {
        dailyLogId: dailyLog.id,
        foodId,
        mealType,
        servings,
      },
      include: { food: true },
    });

    return NextResponse.json(mealItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
