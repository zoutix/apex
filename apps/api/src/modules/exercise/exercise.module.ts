
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [PrismaModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
