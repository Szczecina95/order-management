import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Orders } from './orders.entity';
import { MealsModule } from '@meals/meals.module';
import { OrdersProcessor } from './queue/orders.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders]),
    MealsModule,
    BullModule.registerQueue({ name: 'orders' }),
  ],
  providers: [OrdersService, OrdersProcessor],
  controllers: [OrdersController],
})
export class OrdersModule {}
