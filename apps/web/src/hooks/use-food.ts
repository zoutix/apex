import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foodService, LogFoodPayload } from '@/services/food.service';
import { toast } from 'react-hot-toast';

export const useSearchFoods = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['foods', 'search', query],
    queryFn: () => foodService.searchFoods(query),
    enabled: enabled && query.length > 1,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentFoods = () => {
  return useQuery({
    queryKey: ['foods', 'recent'],
    queryFn: () => foodService.getRecentFoods(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFavoriteFoods = () => {
  return useQuery({
    queryKey: ['foods', 'favorites'],
    queryFn: () => foodService.getFavoriteFoods(),
    staleTime: 1000 * 60 * 5,
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
      toast.error(error.response?.data?.message || 'Failed to log food.');
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (foodId: string) => foodService.toggleFavorite(foodId),
    onMutate: async (foodId: string) => {
      await queryClient.cancelQueries({ queryKey: ['foods'] });
      const previousSearch = queryClient.getQueriesData({ queryKey: ['foods', 'search'] });
      
      queryClient.setQueriesData<{ isFavorite: boolean }[]>({ queryKey: ['foods', 'search'] }, (old) => {
        if (!old) return old;
        return old.map(food => 
          food.id === foodId ? { ...food, isFavorite: !food.isFavorite } : food
        );
      });

      return { previousSearch };
    },
    onError: (err, variables, context) => {
      if (context?.previousSearch) {
        context.previousSearch.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to update favorite status.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
};
