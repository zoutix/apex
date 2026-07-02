import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  const targetDate = dateParam ? new Date(dateParam) : new Date();
  targetDate.setUTCHours(0, 0, 0, 0);

  try {
    const dailyLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: targetDate,
        },
      },
      include: {
        mealItems: {
          include: {
            food: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        exerciseLogs: true,
      },
    });

    if (!dailyLog) {
      const goals = await prisma.goal.findUnique({ where: { userId: session.userId } });
      return NextResponse.json({
        date: targetDate,
        waterMl: 0,
        steps: 0,
        mealItems: [],
        exerciseLogs: [],
        totals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        goals: goals || { dailyCalories: 2000, proteinG: 150, carbsG: 200, fatG: 65, waterMl: 2500, stepGoal: 10000 },
      });
    }

    const totals = dailyLog.mealItems.reduce(
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

    const exerciseCalories = dailyLog.exerciseLogs.reduce((acc, ex) => acc + ex.caloriesBurned, 0);

    const goals = await prisma.goal.findUnique({ where: { userId: session.userId } });

    return NextResponse.json({
      ...dailyLog,
      totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        exerciseCalories,
        netCalories: Math.round(totals.calories - exerciseCalories),
      },
      goals: goals || { dailyCalories: 2000, proteinG: 150, carbsG: 200, fatG: 65, waterMl: 2500, stepGoal: 10000 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
