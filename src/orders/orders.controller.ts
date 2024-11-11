import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './orders.types';
import { Orders } from './orders.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get('/')
  getOrders(@Query('status') status: OrderStatus): Promise<Orders[]> {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get('/:orderId')
  getOrder(@Param('orderId') orderId: string): Promise<Orders> {
    return this.ordersService.getOrderById(orderId);
  }
}
