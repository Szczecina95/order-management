import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  INestApplication,
} from '@nestjs/common';
import request from 'supertest';
import { MealsService } from '@meals/meals.service';
import { MealsController } from '@meals/meals.controller';
import { CategoryName } from '@categories/categories.types';

describe('MealsController', () => {
  let app: INestApplication;
  let mealsService: MealsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealsController],
      providers: [
        MealsService,
        {
          provide: MealsService,
          useValue: {
            getMeals: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    mealsService = module.get<MealsService>(MealsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return meals for a valid category', async () => {
    const category = CategoryName.RAMEN;

    const mockCategory = {
      id: '1',
      name: CategoryName.RAMEN,
      meals: [],
    };

    const meals = [
      {
        id: '1',
        name: 'Spicy Miso Tonkotsu Ramen',
        price: 14.99,
        category: mockCategory,
      },
      {
        id: '2',
        name: 'Shoyu Ramen with Grilled Chicken',
        price: 12.49,
        category: mockCategory,
      },
    ];

    jest.spyOn(mealsService, 'getMeals').mockResolvedValue(meals);

    const response = await request(app.getHttpServer())
      .get('/meals')
      .query({ category })
      .expect(200);

    expect(response.body).toEqual(meals);
  });

  it('should throw BadRequestException for an invalid category', async () => {
    const category = 'INVALID_CATEGORY';

    jest
      .spyOn(mealsService, 'getMeals')
      .mockRejectedValue(
        new BadRequestException(`Invalid category name: ${category}`),
      );

    const response = await request(app.getHttpServer())
      .get('/meals')
      .query({ category })
      .expect(400);

    expect(response.body.message).toBe(`Invalid category name: ${category}`);
  });

  it('should throw NotFoundException if category not found', async () => {
    const category = CategoryName.RAMEN;

    jest
      .spyOn(mealsService, 'getMeals')
      .mockRejectedValue(
        new NotFoundException(`Category ${category} not found`),
      );

    const response = await request(app.getHttpServer())
      .get('/meals')
      .query({ category })
      .expect(404);

    expect(response.body.message).toBe(`Category ${category} not found`);
  });
});
