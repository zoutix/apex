import { z } from 'zod';

export const LogBodyMetricSchema = z.object({
  date: z.string().datetime(),
  weightKg: z.number().positive().optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  chestCm: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  armsCm: z.number().positive().optional(),
  legsCm: z.number().positive().optional(),
});

export type LogBodyMetricDto = z.infer<typeof LogBodyMetricSchema>;
