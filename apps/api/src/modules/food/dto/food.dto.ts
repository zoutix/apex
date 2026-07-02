import { z } from 'zod';

export const LogFoodSchema = z.object({
  foodId: z.string().uuid(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  servings: z.number().positive(),
  date: z.string().datetime().optional(), // Defaults to today in service
});

export const CreateFoodSchema = z.object({
  name: z.string().min(2),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0),
  carbsG: z.number().min(0),
  fatG: z.number().min(0),
  fiberG: z.number().min(0).optional(),
  sugarG: z.number().min(0).optional(),
  sodiumMg: z.number().min(0).optional(),
  servingSize: z.number().positive().default(100),
});

export type LogFoodDto = z.infer<typeof LogFoodSchema>;
export type CreateFoodDto = z.infer<typeof CreateFoodSchema>;
