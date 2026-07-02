import { apiClient } from '@/lib/api-client';

export interface DailyGoals {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
  stepGoal: number;
}

export interface DailyLogTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  exerciseCalories: number;
  netCalories: number;
}

export interface MealItemResponse {
  id: string;
  dailyLogId: string;
  foodId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  servings: number;
  createdAt: string;
  food: {
    id: string;
    name: string;
    brand?: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    servingSize: number;
  };
}

export interface ExerciseLogResponse {
  id: string;
  name: string;
  type: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'CUSTOM';
  durationMin: number;
  caloriesBurned: number;
  createdAt: string;
}

export interface DailyLogResponse {
  id?: string;
  date: string;
  waterMl: number;
  steps: number;
  mealItems: MealItemResponse[];
  exerciseLogs: ExerciseLogResponse[];
  totals: DailyLogTotals;
  goals: DailyGoals;
}

export const dailyLogService = {
  getDailyLog: async (date?: string): Promise<DailyLogResponse> => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const { data } = await apiClient.get<DailyLogResponse>(`/daily-log${query}`);
    return data;
  },

  logWater: async (amountMl: number, date?: string): Promise<void> => {
    await apiClient.post('/daily-log/water', { amountMl, date });
  },

  deleteMealItem: async (mealItemId: string): Promise<void> => {
    await apiClient.delete(`/daily-log/meals/${mealItemId}`);
  },
};
