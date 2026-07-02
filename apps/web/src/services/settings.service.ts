import { apiClient } from '@/lib/api-client';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';

export interface ProfileSettings {
  id: string;
  userId: string;
  heightCm: number | null;
  weightKg: number | null;
  gender: Gender | null;
  age: number | null;
  activityLevel: ActivityLevel;
  targetWeightKg: number | null;
  weeklyGoalKg: number;
}

export type UpdateSettingsPayload = Partial<Omit<ProfileSettings, 'id' | 'userId'>>;

export const settingsService = {
  getSettings: async (): Promise<ProfileSettings> => {
    const { data } = await apiClient.get<ProfileSettings>('/settings');
    return data;
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<ProfileSettings> => {
    const { data } = await apiClient.put<ProfileSettings>('/settings', payload);
    return data;
  },
};
