import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from '@categories/categories.service';
import { CategoryName } from '@categories/categories.types';
import { MealsService } from '@meals/meals.service';
import { Meals } from '@meals/meals.entity';

describe('MealsService', () => {
  let service: MealsService;
  let mealsRepository: jest.Mocked<Repository<Meals>>;
  let categoriesService: Partial<CategoriesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        {
          provide: getRepositoryToken(Meals),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findCategoryByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
    mealsRepository = module.get(getRepositoryToken(Meals));
    categoriesService = module.get(CategoriesService);
  });

  it('should throw NotFoundException if category not found', async () => {
    const categoryName = CategoryName.RAMEN;
    (categoriesService.findCategoryByName as jest.Mock).mockResolvedValue(null);
    await expect(service.getMeals(categoryName)).rejects.toThrowError(
      new NotFoundException(`Category ${categoryName} not found`),
    );
  });

  it('should throw BadRequestException for invalid category name', async () => {
    const invalidCategoryName = 'INVALID_CATEGORY';

    await expect(service.getMeals(invalidCategoryName)).rejects.toThrowError(
      new BadRequestException(`Invalid category name: ${invalidCategoryName}`),
    );
  });

  it('should return all meals when no category is provided', async () => {
    const mockMeals = [
      {
        id: '1',
        name: 'Meal 1',
        price: 10,
        category: { name: CategoryName.RAMEN },
      } as Meals,
      {
        id: '2',
        name: 'Meal 2',
        price: 20,
        category: { name: CategoryName.SUSHI },
      } as Meals,
    ];
    mealsRepository.find.mockResolvedValue(mockMeals);

    const result = await service.getMeals('');
    expect(result).toEqual(mockMeals);
    expect(mealsRepository.find).toHaveBeenCalledWith({
      relations: ['category'],
    });
  });

  it('should throw BadRequestException if category name is invalid', async () => {
    const invalidCategoryName = 'INVALID_CATEGORY';

    await expect(service.getMeals(invalidCategoryName)).rejects.toThrow(
      new BadRequestException(`Invalid category name: ${invalidCategoryName}`),
    );
  });

  it('should return meals filtered by category', async () => {
    const categoryName = CategoryName.RAMEN;
    const mockCategory = { id: 'cat1', name: categoryName };
    const mockMeals = [
      { id: '1', name: 'Meal 1', price: 10, category: mockCategory } as Meals,
    ];
    (categoriesService.findCategoryByName as jest.Mock).mockResolvedValue(
      mockCategory,
    );
    mealsRepository.find.mockResolvedValue(mockMeals);

    const result = await service.getMeals(categoryName);
    expect(result).toEqual(mockMeals);
    expect(mealsRepository.find).toHaveBeenCalledWith({
      where: { category: mockCategory },
      relations: ['category'],
    });
  });
});
