import { Controller, Get, Post, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { FoodService } from './food.service';
import { LogFoodDto, CreateFoodDto } from './dto/food.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('foods')
@UseGuards(JwtAuthGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get('search')
  search(@Query('q') query: string, @Req() req: any) {
    return this.foodService.searchFoods(query, req.user.id);
  }

  @Get('barcode/:code')
  lookupBarcode(@Param('code') code: string, @Req() req: any) {
    return this.foodService.lookupBarcode(code, req.user.id);
  }

  @Get('recent')
  getRecent(@Req() req: any) {
    return this.foodService.getRecentFoods(req.user.id);
  }

  @Get('favorites')
  getFavorites(@Req() req: any) {
    return this.foodService.getFavoriteFoods(req.user.id);
  }

  @Post()
  createCustom(@Body() dto: CreateFoodDto, @Req() req: any) {
    return this.foodService.createCustomFood(dto, req.user.id);
  }

  @Post('log')
  logFood(@Body() dto: LogFoodDto, @Req() req: any) {
    return this.foodService.logFood(dto, req.user.id);
  }

  @Post('favorites/:foodId/toggle')
  toggleFavorite(@Param('foodId') foodId: string, @Req() req: any) {
    return this.foodService.toggleFavorite(foodId, req.user.id);
  }
}
