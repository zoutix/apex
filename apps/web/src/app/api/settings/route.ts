import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const settingsSchema = z.object({
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  age: z.number().int().positive().optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE']).optional(),
  targetWeightKg: z.number().positive().optional(),
  weeklyGoalKg: z.number().min(-2).max(2).optional(),
});

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: {},
      create: { userId: session.userId },
    });

    return NextResponse.json(profile);
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
    const validated = settingsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: validated.data,
      create: {
        userId: session.userId,
        ...validated.data,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
