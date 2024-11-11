import { IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  meals!: { id: string; quantity: number }[];
}
