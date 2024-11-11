import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meals } from './meals.entity';
import { CategoriesService } from '@categories/categories.service';
import { CategoryName } from '@categories/categories.types';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meals)
    private mealsRepository: Repository<Meals>,
    private categoriesService: CategoriesService,
  ) {}

  async getMeals(categoryName: string): Promise<Meals[]> {
    if (!categoryName) {
      return await this.mealsRepository.find({
        relations: ['category'],
      });
    }

    if (!Object.values(CategoryName).includes(categoryName as CategoryName)) {
      throw new BadRequestException(`Invalid category name: ${categoryName}`);
    }

    const category = await this.categoriesService.findCategoryByName(
      categoryName,
    );

    if (!category) {
      throw new NotFoundException(`Category ${categoryName} not found`);
    }

    return await this.mealsRepository.find({
      where: { category: category },
      relations: ['category'],
    });
  }

  async findMealById(mealId: string): Promise<Meals> {
    const meal = await this.mealsRepository.findOne({
      where: { id: mealId },
    });

    if (!meal) {
      throw new NotFoundException(`Meal with ID ${mealId} not found`);
    }

    return meal;
  }

  private async checkIfMealsExist(): Promise<boolean> {
    const mealCount = await this.mealsRepository.count();
    return mealCount > 0;
  }

  async seedMeals(): Promise<void> {
    const mealsExist = await this.checkIfMealsExist();

    if (mealsExist) {
      return;
    }

    console.log('Seeding meals...');

    const ramenCategory = await this.categoriesService.findOrCreateCategory(
      CategoryName.RAMEN,
    );
    const sushiCategory = await this.categoriesService.findOrCreateCategory(
      CategoryName.SUSHI,
    );

    const meals: Partial<Meals>[] = [
      {
        name: 'Spicy Miso Tonkotsu Ramen',
        price: 14.99,
        category: ramenCategory,
      },
      {
        name: 'Shoyu Ramen with Grilled Chicken',
        price: 12.49,
        category: ramenCategory,
      },
      {
        name: 'Chirashi Sushi',
        price: 22.99,
        category: sushiCategory,
      },
      {
        name: 'Uni and Toro Sushi',
        price: 30.99,
        category: sushiCategory,
      },
    ];

    await this.mealsRepository.save(meals);
    console.log('Meals seeding completed!');
  }
}
