import { apiClient } from '@/lib/api-client';

export interface RecipeIngredientPayload {
  foodId: string;
  quantityG: number;
}

export interface RecipePayload {
  name: string;
  description?: string;
  servings: number;
  isPublic: boolean;
  ingredients: RecipeIngredientPayload[];
}

export interface RecipeIngredientResponse extends RecipeIngredientPayload {
  id: string;
  recipeId: string;
  food: {
    id: string;
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    servingSize: number;
  };
}

export interface RecipeResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  servings: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredientResponse[];
  user?: {
    firstName: string | null;
    avatarUrl: string | null;
  };
}

export const recipeService = {
  createRecipe: async (payload: RecipePayload): Promise<RecipeResponse> => {
    const { data } = await apiClient.post<RecipeResponse>('/recipes', payload);
    return data;
  },

  getMyRecipes: async (): Promise<RecipeResponse[]> => {
    const { data } = await apiClient.get<RecipeResponse[]>('/recipes?type=me');
    return data;
  },

  getPublicRecipes: async (): Promise<RecipeResponse[]> => {
    const { data } = await apiClient.get<RecipeResponse[]>('/recipes?type=public');
    return data;
  },
};
