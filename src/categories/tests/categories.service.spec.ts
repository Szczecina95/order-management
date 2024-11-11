import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Categories } from '@categories/categories.entity';
import { CategoriesService } from '@categories/categories.service';
import { CategoryName } from '@categories/categories.types';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: jest.Mocked<Repository<Categories>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Categories),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository = module.get(getRepositoryToken(Categories));
  });

  it('should return all categories', async () => {
    const mockCategories = [
      { id: '1', name: CategoryName.RAMEN } as Categories,
      { id: '2', name: CategoryName.SUSHI } as Categories,
    ];
    categoriesRepository.find.mockResolvedValue(mockCategories);

    const result = await service.getCategories();
    expect(result).toEqual(mockCategories);
    expect(categoriesRepository.find).toHaveBeenCalled();
  });

  it('should return a category by name', async () => {
    const mockCategory = { id: '1', name: CategoryName.RAMEN } as Categories;
    categoriesRepository.findOne.mockResolvedValue(mockCategory);

    const result = await service.findCategoryByName(CategoryName.RAMEN);
    expect(result).toEqual(mockCategory);
    expect(categoriesRepository.findOne).toHaveBeenCalledWith({
      where: { name: CategoryName.RAMEN },
    });
  });

  it('should return undefined if category by name not found', async () => {
    categoriesRepository.findOne.mockResolvedValue(null);

    const result = await service.findCategoryByName(CategoryName.RAMEN);
    expect(result).toBeUndefined();
  });

  it('should create a new category if not found', async () => {
    const mockCategory = { id: '1', name: CategoryName.SUSHI } as Categories;
    categoriesRepository.findOne.mockResolvedValue(null);
    categoriesRepository.save.mockResolvedValue(mockCategory);

    const result = await service.findOrCreateCategory(CategoryName.SUSHI);
    expect(result).toEqual(mockCategory);
    expect(categoriesRepository.save).toHaveBeenCalledWith({
      name: CategoryName.SUSHI,
    });
  });

  it('should return existing category without creating a new one', async () => {
    const mockCategory = { id: '1', name: CategoryName.RAMEN } as Categories;
    categoriesRepository.findOne.mockResolvedValue(mockCategory);

    const result = await service.findOrCreateCategory(CategoryName.RAMEN);
    expect(result).toEqual(mockCategory);
    expect(categoriesRepository.save).not.toHaveBeenCalled();
  });
});
