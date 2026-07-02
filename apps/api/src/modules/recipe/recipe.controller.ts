import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  createRecipe(@Body() dto: CreateRecipeDto, @Req() req: any) {
    return this.recipeService.createRecipe(dto, req.user.id);
  }

  @Get('me')
  getMyRecipes(@Req() req: any) {
    return this.recipeService.getUserRecipes(req.user.id);
  }

  @Get('public')
  getPublicRecipes() {
    return this.recipeService.getPublicRecipes();
  }
}
