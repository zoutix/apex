import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto } from './dto/recipe.dto';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  async createRecipe(dto: CreateRecipeDto, userId: string) {
    return this.prisma.recipe.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        servings: dto.servings,
        isPublic: dto.isPublic,
        ingredients: {
          create: dto.ingredients.map(ing => ({
            foodId: ing.foodId,
            quantityG: ing.quantityG,
          })),
        },
      },
      include: {
        ingredients: { include: { food: true } },
      },
    });
  }

  async getUserRecipes(userId: string) {
    return this.prisma.recipe.findMany({
      where: { userId },
      include: { ingredients: { include: { food: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicRecipes() {
    return this.prisma.recipe.findMany({
      where: { isPublic: true },
      include: { 
        ingredients: { include: { food: true } },
        user: { select: { firstName: true, avatarUrl: true } }
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Helper to calculate macros per serving (can be expanded)
  calculateMacrosPerServing(recipe: any) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    recipe.ingredients.forEach((ing: any) => {
      const ratio = ing.quantityG / ing.food.servingSize;
      totalCalories += ing.food.calories * ratio;
      totalProtein += ing.food.proteinG * ratio;
      totalCarbs += ing.food.carbsG * ratio;
      totalFat += ing.food.fatG * ratio;
    });

    return {
      calories: Math.round(totalCalories / recipe.servings),
      proteinG: Math.round(totalProtein / recipe.servings),
      carbsG: Math.round(totalCarbs / recipe.servings),
      fatG: Math.round(totalFat / recipe.servings),
    };
  }
}
