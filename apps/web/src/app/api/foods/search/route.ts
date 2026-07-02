import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query parameter is required and must be at least 2 characters' }, { status: 400 });
  }

  try {
    const foods = await prisma.foodItem.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { barcode: { equals: q } },
        ],
      },
      take: 25,
      orderBy: { name: 'asc' },
      include: {
        favorites: {
          select: { id: true },
        },
      },
    });

    const mappedFoods = foods.map(food => ({
      ...food,
      isFavorite: food.favorites.length > 0,
      favorites: undefined,
    }));

    return NextResponse.json(mappedFoods);
  } catch (error) {
    console.error('Failed to search foods:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
