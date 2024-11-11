import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MealsService } from '@meals/meals.service';

@Injectable()
export class MealsSeederService implements OnApplicationBootstrap {
  constructor(private readonly mealsService: MealsService) {}

  async seedMeals(): Promise<void> {
    await this.mealsService.seedMeals();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.seedMeals();
  }
}
