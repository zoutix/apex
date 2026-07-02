import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkoutDto, LogWorkoutDto, SearchExerciseDto } from './dto/exercise.dto';

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async searchExercises(query: string, type?: string) {
    return this.prisma.exercise.findMany({
      where: {
        AND: [
          { name: { contains: query, mode: 'insensitive' } },
          type ? { type: type as any } : {},
        ],
      },
      take: 25,
    });
  }

  async createCustomWorkout(dto: CreateWorkoutDto, userId: string) {
    return this.prisma.workout.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        isTemplate: true,
        exercises: {
          create: dto.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            order: index,
            targetSets: ex.sets,
            targetReps: ex.reps,
            restSeconds: ex.restSeconds,
          })),
        },
      },
      include: { exercises: true },
    });
  }

  async logWorkout(dto: LogWorkoutDto, userId: string) {
    return this.prisma.workoutLog.create({
      data: {
        userId,
        workoutId: dto.workoutId,
        durationMin: dto.durationMin,
        totalCaloriesBurned: dto.caloriesBurned,
        notes: dto.notes,
        sets: {
          create: dto.sets.map(set => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            reps: set.reps,
            weightKg: set.weightKg,
            durationSec: set.durationSec,
          })),
        },
      },
      include: { sets: true },
    });
  }

  async getUserWorkouts(userId: string) {
    return this.prisma.workout.findMany({
      where: { userId, isTemplate: true },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
