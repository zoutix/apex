"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { ActivityLevel, Gender, UpdateSettingsPayload } from "@/services/settings.service";
import { Loader2 } from "lucide-react";

const settingsSchema = z.object({
  heightCm: z.number().min(50, "Height must be at least 50cm").max(250, "Height must be under 250cm").optional(),
  weightKg: z.number().min(20, "Weight must be at least 20kg").max(300, "Weight must be under 300kg").optional(),
  age: z.number().min(13, "You must be at least 13").max(120, "Invalid age").optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE']),
  targetWeightKg: z.number().min(20).max(300).optional(),
  weeklyGoalKg: z.number().min(-2).max(2),
});

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate, isPending } = useUpdateSettings();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateSettingsPayload>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      activityLevel: 'SEDENTARY',
      weeklyGoalKg: 0.5,
    }
  });

  useEffect(() => {
    if (settings) {
      reset({
        heightCm: settings.heightCm || undefined,
        weightKg: settings.weightKg || undefined,
        age: settings.age || undefined,
        gender: settings.gender || undefined,
        activityLevel: settings.activityLevel,
        targetWeightKg: settings.targetWeightKg || undefined,
        weeklyGoalKg: settings.weeklyGoalKg,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: UpdateSettingsPayload) => {
    mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and fitness goals.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Body Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="heightCm"
              control={control}
              render={({ field }) => (
                <Input
                  label="Height (cm)"
                  type="number"
                  placeholder="175"
                  error={errors.heightCm?.message as string}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              )}
            />
            <Controller
              name="weightKg"
              control={control}
              render={({ field }) => (
                <Input
                  label="Current Weight (kg)"
                  type="number"
                  placeholder="75.5"
                  error={errors.weightKg?.message as string}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              )}
            />
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <Input
                  label="Age"
                  type="number"
                  placeholder="28"
                  error={errors.age?.message as string}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                />
              )}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  label="Gender"
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  placeholder="Select gender"
                />
              )}
            />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Fitness Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="activityLevel"
              control={control}
              render={({ field }) => (
                <Select
                  label="Activity Level"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'SEDENTARY', label: 'Sedentary' },
                    { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active' },
                    { value: 'MODERATELY_ACTIVE', label: 'Moderately Active' },
                    { value: 'VERY_ACTIVE', label: 'Very Active' },
                    { value: 'EXTRA_ACTIVE', label: 'Extra Active' },
                  ]}
                />
              )}
            />
            <Controller
              name="targetWeightKg"
              control={control}
              render={({ field }) => (
                <Input
                  label="Target Weight (kg)"
                  type="number"
                  placeholder="70"
                  error={errors.targetWeightKg?.message as string}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              )}
            />
            <Controller
              name="weeklyGoalKg"
              control={control}
              render={({ field }) => (
                <Select
                  label="Weekly Goal (kg/week)"
                  value={String(field.value)}
                  onValueChange={(val) => field.onChange(parseFloat(val))}
                  options={[
                    { value: '-1.0', label: 'Lose 1.0 kg/week' },
                    { value: '-0.5', label: 'Lose 0.5 kg/week' },
                    { value: '0', label: 'Maintain weight' },
                    { value: '0.5', label: 'Gain 0.5 kg/week' },
                    { value: '1.0', label: 'Gain 1.0 kg/week' },
                  ]}
                />
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isPending} size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
