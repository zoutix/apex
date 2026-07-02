import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const waterSchema = z.object({
  amountMl: z.number().int().positive(),
  date: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = waterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const { amountMl, date } = validated.data;
    const logDate = date ? new Date(date) : new Date();
    logDate.setUTCHours(0, 0, 0, 0);

    const updatedDailyLog = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: session.userId,
          date: logDate,
        },
      },
      update: {
        waterMl: { increment: amountMl },
      },
      create: {
        userId: session.userId,
        date: logDate,
        waterMl: amountMl,
      },
    });

    return NextResponse.json({ waterMl: updatedDailyLog.waterMl });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
