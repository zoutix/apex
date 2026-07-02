import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsRange } from '@/services/analytics.service';

export const useNutritionAnalytics = (range: AnalyticsRange) => {
  return useQuery({
    queryKey: ['analytics', 'nutrition', range],
    queryFn: () => analyticsService.getNutritionAnalytics(range),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBodyMetrics = (range: AnalyticsRange) => {
  return useQuery({
    queryKey: ['analytics', 'body', range],
    queryFn: () => analyticsService.getBodyMetrics(range),
    staleTime: 1000 * 60 * 5,
  });
};
