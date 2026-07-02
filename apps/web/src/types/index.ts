export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  firstName?: string;
  lastName?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  steps: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  isFavorite?: boolean;
}
