import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { CategoryName } from './categories.types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
  ) {}

  async getCategories(): Promise<Categories[]> {
    return await this.categoriesRepository.find();
  }

  async findCategoryByName(name: string): Promise<Categories | undefined> {
    const category = await this.categoriesRepository.findOne({
      where: { name: name as CategoryName },
    });

    return category ?? undefined;
  }

  async findOrCreateCategory(name: CategoryName): Promise<Categories> {
    let category = await this.categoriesRepository.findOne({ where: { name } });

    if (!category) {
      console.log(`Creating ${name} category...`);
      category = await this.categoriesRepository.save({ name });
    }

    return category;
  }
}
