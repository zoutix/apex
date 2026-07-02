import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateWorkoutDto, LogWorkoutDto } from './dto/exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get('search')
  search(@Query('q') q: string, @Query('type') type?: string) {
    return this.exerciseService.searchExercises(q, type);
  }

  @Get('workouts')
  getMyWorkouts(@Req() req: any) {
    return this.exerciseService.getUserWorkouts(req.user.id);
  }

  @Post('workouts')
  createWorkout(@Body() dto: CreateWorkoutDto, @Req() req: any) {
    return this.exerciseService.createCustomWorkout(dto, req.user.id);
  }

  @Post('log')
  logWorkout(@Body() dto: LogWorkoutDto, @Req() req: any) {
    return this.exerciseService.logWorkout(dto, req.user.id);
  }
}
