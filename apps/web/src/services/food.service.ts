import { apiClient } from '@/lib/api-client';
import type { FoodItem } from '@/types';

export interface LogFoodPayload {
  foodId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  servings: number;
  date?: string;
}

export const foodService = {
  searchFoods: async (query: string): Promise<FoodItem[]> => {
    const { data } = await apiClient.get<FoodItem[]>(`/foods/search?q=${encodeURIComponent(query)}`);
    return data;
  },

  getRecentFoods: async (): Promise<FoodItem[]> => {
    const { data } = await apiClient.get<FoodItem[]>('/foods/recent');
    return data;
  },

  getFavoriteFoods: async (): Promise<FoodItem[]> => {
    const { data } = await apiClient.get<FoodItem[]>('/foods/favorites');
    return data;
  },

  logFood: async (payload: LogFoodPayload): Promise<void> => {
    await apiClient.post('/foods/log', payload);
  },

  toggleFavorite: async (foodId: string): Promise<{ isFavorite: boolean }> => {
    const { data } = await apiClient.post<{ isFavorite: boolean }>(`/foods/favorites/${foodId}/toggle`);
    return data;
  },
};
