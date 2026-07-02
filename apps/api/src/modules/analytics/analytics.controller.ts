import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { LogBodyMetricDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('body-metrics')
  logMetric(@Body() dto: LogBodyMetricDto, @Req() req: any) {
    return this.analyticsService.logBodyMetric(dto, req.user.id);
  }

  @Get('body-metrics')
  getMetrics(@Query('range') range: 'week' | 'month' | 'year', @Req() req: any) {
    return this.analyticsService.getBodyMetrics(req.user.id, range || 'month');
  }

  @Get('nutrition')
  getNutrition(@Query('range') range: 'week' | 'month' | 'year', @Req() req: any) {
    return this.analyticsService.getNutritionAnalytics(req.user.id, range || 'week');
  }
}
