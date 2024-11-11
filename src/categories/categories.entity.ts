import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Meals } from '@meals/meals.entity';
import { CategoryName } from './categories.types';

@Entity()
export class Categories {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: CategoryName,
    unique: true,
  })
  name!: CategoryName;

  @OneToMany(() => Meals, (meal) => meal.category)
  meals!: Meals[];
}
