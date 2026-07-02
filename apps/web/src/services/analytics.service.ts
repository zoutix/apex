import { apiClient } from '@/lib/api-client';

export type AnalyticsRange = 'week' | 'month' | 'year';

export interface AnalyticsPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
  exerciseCalories: number;
}

export interface BodyMetricPoint {
  date: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  chestCm: number | null;
  waistCm: number | null;
  armsCm: number | null;
  legsCm: number | null;
  neckCm: number | null;
  hipCm: number | null;
}

export const analyticsService = {
  getNutritionAnalytics: async (range: AnalyticsRange): Promise<AnalyticsPoint[]> => {
    const { data } = await apiClient.get<AnalyticsPoint[]>(`/analytics?range=${range}`);
    return data;
  },

  getBodyMetrics: async (range: AnalyticsRange): Promise<BodyMetricPoint[]> => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    const { data } = await apiClient.get<BodyMetricPoint[]>(`/body-metrics?days=${days}`);
    return data;
  },
};
