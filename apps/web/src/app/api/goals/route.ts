import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const updateGoalsSchema = z.object({
  dailyCalories: z.number().int().positive().optional(),
  proteinG: z.number().positive().optional(),
  carbsG: z.number().positive().optional(),
  fatG: z.number().positive().optional(),
  waterMl: z.number().int().positive().optional(),
  stepGoal: z.number().int().positive().optional(),
});

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const goals = await prisma.goal.upsert({
      where: { userId: session.userId },
      update: {},
      create: { userId: session.userId },
    });

    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateGoalsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const updatedGoals = await prisma.goal.upsert({
      where: { userId: session.userId },
      update: validated.data,
      create: {
        userId: session.userId,
        ...validated.data,
      },
    });

    return NextResponse.json(updatedGoals);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
