import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const bodyMetricSchema = z.object({
  date: z.string().datetime().optional(),
  weightKg: z.number().positive().optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  chestCm: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  armsCm: z.number().positive().optional(),
  legsCm: z.number().positive().optional(),
  neckCm: z.number().positive().optional(),
  hipCm: z.number().positive().optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: 'At least one metric must be provided',
});

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = bodyMetricSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const { date, ...metrics } = validated.data;
    const metricDate = date ? new Date(date) : new Date();
    metricDate.setUTCHours(0, 0, 0, 0);

    const bodyMetric = await prisma.bodyMetric.upsert({
      where: {
        userId_date: {
          userId: session.userId,
          date: metricDate,
        },
      },
      update: { ...metrics },
      create: {
        userId: session.userId,
        date: metricDate,
        ...metrics,
      },
    });

    if (metrics.weightKg) {
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { weightKg: metrics.weightKg },
      });
    }

    return NextResponse.json(bodyMetric, { status: 201 });
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
  const days = parseInt(searchParams.get('days') || '30', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  try {
    const history = await prisma.bodyMetric.findMany({
      where: {
        userId: session.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
