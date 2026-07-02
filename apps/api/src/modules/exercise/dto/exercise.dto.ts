import { z } from 'zod';

export const SearchExerciseSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'CUSTOM']).optional(),
});

export const CreateWorkoutSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
    restSeconds: z.number().int().positive().optional(),
  })),
});

export const LogWorkoutSchema = z.object({
  workoutId: z.string().uuid().optional(),
  durationMin: z.number().int().positive(),
  caloriesBurned: z.number().int().min(0),
  notes: z.string().optional(),
  sets: z.array(z.object({
    exerciseId: z.string().uuid(),
    setNumber: z.number().int().positive(),
    reps: z.number().int().positive().optional(),
    weightKg: z.number().positive().optional(),
    durationSec: z.number().int().positive().optional(),
  })),
});

export type CreateWorkoutDto = z.infer<typeof CreateWorkoutSchema>;
export type LogWorkoutDto = z.infer<typeof LogWorkoutSchema>;
