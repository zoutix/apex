import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || 'week';
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  try {
    const logs = await prisma.dailyLog.findMany({
      where: {
        userId: session.userId,
        date: { gte: startDate },
      },
      include: {
        mealItems: { include: { food: true } },
        exerciseLogs: true,
      },
      orderBy: { date: 'asc' },
    });

    const analyticsData = logs.map(log => {
      const totals = log.mealItems.reduce(
        (acc, item) => {
          const ratio = item.servings;
          return {
            calories: acc.calories + item.food.calories * ratio,
            protein: acc.protein + item.food.proteinG * ratio,
            carbs: acc.carbs + item.food.carbsG * ratio,
            fat: acc.fat + item.food.fatG * ratio,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const exerciseCalories = log.exerciseLogs.reduce((acc, ex) => acc + ex.caloriesBurned, 0);

      return {
        date: log.date.toISOString(),
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        water: log.waterMl,
        steps: log.steps,
        exerciseCalories,
      };
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
