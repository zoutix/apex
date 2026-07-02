import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const recipeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  servings: z.number().int().positive().default(1),
  isPublic: z.boolean().default(false),
  ingredients: z.array(z.object({
    foodId: z.string().uuid(),
    quantityG: z.number().positive(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = recipeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten() }, { status: 400 });
    }

    const { name, description, servings, isPublic, ingredients } = validated.data;

    const recipe = await prisma.recipe.create({
      data: {
        userId: session.userId,
        name,
        description,
        servings,
        isPublic,
        ingredients: {
          create: ingredients.map(ing => ({
            foodId: ing.foodId,
            quantityG: ing.quantityG,
          })),
        },
      },
      include: {
        ingredients: { include: { food: true } },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
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
  const type = searchParams.get('type') || 'me';

  try {
    const whereClause = type === 'public' 
      ? { isPublic: true } 
      : { userId: session.userId };

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      include: {
        ingredients: { include: { food: true } },
        user: {
          select: { firstName: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
