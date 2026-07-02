
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { FoodModule } from './modules/food/food.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [AuthModule, FoodModule, ExerciseModule, RecipeModule, AnalyticsModule],
})
export class AppModule {}
