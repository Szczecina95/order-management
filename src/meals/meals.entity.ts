import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Categories } from '@categories/categories.entity';

@Entity('meals')
export class Meals {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @ManyToOne(() => Categories, (category) => category.meals)
  category!: Categories;
}
