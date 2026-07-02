import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogFoodDto, CreateFoodDto } from './dto/food.dto';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async searchFoods(query: string, userId: string) {
    const foods = await this.prisma.foodItem.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 25,
      orderBy: { name: 'asc' },
      include: {
        favorites: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // Map to include a simple 'isFavorite' boolean
    return foods.map(food => ({
      ...food,
      isFavorite: food.favorites.length > 0,
      favorites: undefined,
    }));
  }

  async lookupBarcode(barcode: string, userId: string) {
    const food = await this.prisma.foodItem.findUnique({
      where: { barcode },
      include: {
        favorites: { where: { userId }, select: { id: true } },
      },
    });

    if (!food) throw new NotFoundException('Food item not found for this barcode');
    
    return {
      ...food,
      isFavorite: food.favorites.length > 0,
      favorites: undefined,
    };
  }

  async createCustomFood(dto: CreateFoodDto, userId: string) {
    return this.prisma.foodItem.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });
  }

  async logFood(dto: LogFoodDto, userId: string) {
    const date = dto.date ? new Date(dto.date) : new Date();
    date.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find or create today's DailyLog
    const dailyLog = await this.prisma.dailyLog.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: {},
      create: { userId, date },
    });

    return this.prisma.mealItem.create({
      data: {
        dailyLogId: dailyLog.id,
        foodId: dto.foodId,
        mealType: dto.mealType,
        servings: dto.servings,
      },
      include: { food: true },
    });
  }

  async getRecentFoods(userId: string) {
    const recentLogs = await this.prisma.mealItem.findMany({
      where: { dailyLog: { userId } },
      include: { food: true },
      orderBy: { createdAt: 'desc' },
      distinct: ['foodId'],
      take: 10,
    });

    return recentLogs.map(log => log.food);
  }

  async getFavoriteFoods(userId: string) {
    const favorites = await this.prisma.favoriteFood.findMany({
      where: { userId },
      include: { food: true },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(fav => fav.food);
  }

  async toggleFavorite(foodId: string, userId: string) {
    const existing = await this.prisma.favoriteFood.findUnique({
      where: { userId_foodId: { userId, foodId } },
    });

    if (existing) {
      await this.prisma.favoriteFood.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    } else {
      await this.prisma.favoriteFood.create({
        data: { userId, foodId },
      });
      return { isFavorite: true };
    }
  }
}
