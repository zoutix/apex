import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dailyLogService } from '@/services/daily-log.service';
import { foodService, LogFoodPayload } from '@/services/food.service';

export const useDailyLog = (date?: string) => {
  return useQuery({
    queryKey: ['dailyLog', date || 'today'],
    queryFn: () => dailyLogService.getDailyLog(date),
    staleTime: 1000 * 30,
  });
};

export const useLogFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LogFoodPayload) => foodService.logFood(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      queryClient.invalidateQueries({ queryKey: ['foods', 'recent'] });
      toast.success('Food logged successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to log food.');
    },
  });
};

export const useLogWater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amountMl, date }: { amountMl: number; date?: string }) =>
      dailyLogService.logWater(amountMl, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      toast.success('Water updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update water intake.');
    },
  });
};

export const useDeleteMealItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealItemId: string) => dailyLogService.deleteMealItem(mealItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      toast.success('Item removed from diary.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete item.');
    },
  });
};
