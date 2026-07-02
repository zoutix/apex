import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogBodyMetricDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async logBodyMetric(dto: LogBodyMetricDto, userId: string) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    return this.prisma.bodyMetric.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: { ...dto },
      create: { ...dto, userId, date },
    });
  }

  async getBodyMetrics(userId: string, range: 'week' | 'month' | 'year') {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.bodyMetric.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getNutritionAnalytics(userId: string, range: 'week' | 'month' | 'year') {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch daily logs within the range
    const logs = await this.prisma.dailyLog.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      include: {
        mealItems: { include: { food: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Aggregate data for charts
    return logs.map(log => {
      const totals = log.mealItems.reduce((acc, item) => {
        const ratio = item.servings; // assuming servings is a multiplier of base 100g
        return {
          calories: acc.calories + (item.food.calories * ratio),
          protein: acc.protein + (item.food.proteinG * ratio),
          carbs: acc.carbs + (item.food.carbsG * ratio),
          fat: acc.fat + (item.food.fatG * ratio),
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

      return {
        date: log.date,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        water: log.waterMl,
        steps: log.steps,
      };
    });
  }
}
