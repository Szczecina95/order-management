import { Controller, Get, Query } from '@nestjs/common';
import { MealsService } from './meals.service';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get('/')
  getMeals(@Query('category') category: string) {
    return this.mealsService.getMeals(category);
  }
}
