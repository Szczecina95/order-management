import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { Meals } from './meals.entity';
import { CategoriesModule } from '@categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Meals]), CategoriesModule],
  providers: [MealsService],
  controllers: [MealsController],
  exports: [MealsService],
})
export class MealsModule {}
