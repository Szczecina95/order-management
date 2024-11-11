import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Orders } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './orders.types';
import { MealsService } from '@meals/meals.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly mealsService: MealsService,
    @InjectQueue('orders') private ordersQueue: Queue,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Orders> {
    let totalPrice = 0;
    const meals = await Promise.all(
      createOrderDto.meals.map(async (meal) => {
        const mealEntity = await this.mealsService.findMealById(meal.id);
        if (!mealEntity)
          throw new NotFoundException(`Meal ${meal.id} not found`);
        const price = parseFloat(mealEntity.price.toString());
        const quantity = parseInt(meal.quantity.toString(), 10);

        if (isNaN(price) || isNaN(quantity)) {
          throw new Error(`Invalid price or quantity for meal ${meal.id}`);
        }

        totalPrice += parseFloat((price * quantity).toFixed(2));
        return mealEntity;
      }),
    );

    const newOrder = this.ordersRepository.create({
      meals,
      status: OrderStatus.NEW,
      totalPrice,
    });

    const savedOrder = await this.ordersRepository.save(newOrder);

    await this.ordersQueue.add('orders', {
      orderId: savedOrder.id,
      status: OrderStatus.NEW,
    });

    return savedOrder;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Orders> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Orders[]> {
    if (status && !Object.values(OrderStatus).includes(status)) {
      throw new NotFoundException('Status not found or invalid');
    }

    if (!status) {
      return this.ordersRepository.find({
        relations: ['meals'],
      });
    }

    return this.ordersRepository.find({
      where: { status },
      relations: ['meals'],
    });
  }

  async getOrderById(orderId: string): Promise<Orders> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['meals'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order ?? null;
  }
}
