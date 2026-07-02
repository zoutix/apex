import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { recipeService, RecipePayload } from '@/services/recipe.service';

export const useMyRecipes = () => {
  return useQuery({
    queryKey: ['recipes', 'me'],
    queryFn: () => recipeService.getMyRecipes(),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePublicRecipes = () => {
  return useQuery({
    queryKey: ['recipes', 'public'],
    queryFn: () => recipeService.getPublicRecipes(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecipePayload) => recipeService.createRecipe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to save recipe.');
    },
  });
};
