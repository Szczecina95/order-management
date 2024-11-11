import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CategoriesController } from '@categories/categories.controller';
import { Categories } from '@categories/categories.entity';
import { CategoriesService } from '@categories/categories.service';
import { CategoryName } from '@categories/categories.types';

describe('CategoriesController', () => {
  let app: INestApplication;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            getCategories: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /categories - should return all categories', async () => {
    const mockCategories: Categories[] = [
      { id: '1', name: CategoryName.RAMEN } as Categories,
      { id: '2', name: CategoryName.SUSHI } as Categories,
    ];

    jest.spyOn(service, 'getCategories').mockResolvedValue(mockCategories);

    const response = await request(app.getHttpServer()).get('/categories/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategories);
    expect(service.getCategories).toHaveBeenCalled();
  });
});
