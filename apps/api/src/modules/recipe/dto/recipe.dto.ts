import { z } from 'zod';

export const CreateRecipeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  servings: z.number().int().positive().default(1),
  isPublic: z.boolean().default(false),
  ingredients: z.array(z.object({
    foodId: z.string().uuid(),
    quantityG: z.number().positive(), // in grams
  })).min(1),
});

export type CreateRecipeDto = z.infer<typeof CreateRecipeSchema>;
