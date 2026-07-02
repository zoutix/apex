import { apiClient } from '@/lib/api-client';

export type ExerciseType = 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'CUSTOM';

export interface ExercisePayload {
  name: string;
  type: ExerciseType;
  durationMin: number;
  caloriesBurned: number;
  date?: string;
}

export interface ExerciseLogResponse {
  id: string;
  name: string;
  type: ExerciseType;
  durationMin: number;
  caloriesBurned: number;
  createdAt: string;
}

export const exerciseService = {
  logExercise: async (payload: ExercisePayload): Promise<ExerciseLogResponse> => {
    const { data } = await apiClient.post<ExerciseLogResponse>('/exercises', payload);
    return data;
  },

  getHistory: async (limit: number = 10): Promise<ExerciseLogResponse[]> => {
    const { data } = await apiClient.get<ExerciseLogResponse[]>(`/exercises?limit=${limit}`);
    return data;
  },
};
