import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Meals } from '../meals/meals.entity';
import { OrderStatus } from './orders.types';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToMany(() => Meals)
  @JoinTable()
  meals!: Meals[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status!: OrderStatus;
}
