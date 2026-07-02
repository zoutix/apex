import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService, UpdateSettingsPayload } from '@/services/settings.service';
import { toast } from 'react-hot-toast';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsService.updateSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      toast.success('Settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update settings.');
    },
  });
};
