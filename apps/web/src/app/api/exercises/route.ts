import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const exerciseSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'CUSTOM']),
  durationMin: z.number().int().positive(),
  caloriesBurned: z.number().int().min(0),
  date: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = exerciseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const { name, type, durationMin, caloriesBurned, date } = validated.data;
    const logDate = date ? new Date(date) : new Date();
    logDate.setUTCHours(0, 0, 0, 0);

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

    const exerciseLog = await prisma.exerciseLog.create({
      data: {
        userId: session.userId,
        dailyLogId: dailyLog.id,
        name,
        type,
        durationMin,
        caloriesBurned,
      },
    });

    return NextResponse.json(exerciseLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const history = await prisma.exerciseLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
