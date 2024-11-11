import { Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as dotenv from 'dotenv';
import { OrdersService } from '@orders/orders.service';
import { OrderStatus } from '@orders/orders.types';
dotenv.config();

@Injectable()
export class OrdersProcessor {
  private worker: Worker;

  constructor(
    private readonly ordersService: OrdersService,
    @InjectQueue('orders') private readonly ordersQueue: Queue,
  ) {
    this.worker = new Worker('orders', this.handleProcessOrder.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      lockDuration: 1000 * 120,
    });

    this.worker.on('completed', (job) => {
      console.log(`Job completed: ${job.id}`);
      if (!job.isCompleted()) {
        job.moveToCompleted('Order processing complete', '', true);
      }
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job failed: ${job?.id}, error: ${err.message}`);
    });
  }

  async handleProcessOrder(job: Job) {
    const { orderId, status } = job.data;
    console.log('Processing order', orderId, 'with status', status);

    try {
      switch (status) {
        case OrderStatus.NEW:
          console.log(`New order: ${orderId}`);
          await this.scheduleNextStatusUpdate(orderId, OrderStatus.NEW);
          break;

        case OrderStatus.IN_THE_KITCHEN:
          console.log(`Order ${orderId} is being prepared in the kitchen.`);
          await this.scheduleNextStatusUpdate(
            orderId,
            OrderStatus.IN_THE_KITCHEN,
          );
          break;

        case OrderStatus.IN_DELIVERY:
          console.log(`Order ${orderId} is being delivered.`);
          await this.scheduleNextStatusUpdate(orderId, OrderStatus.IN_DELIVERY);
          break;

        case OrderStatus.DONE:
          console.log(`Order ${orderId} has been delivered and is complete.`);
          break;

        default:
          console.error('Unknown status:', status);
          break;
      }

      await this.waitBeforeMarkingComplete(job);
    } catch (error) {
      console.error('Error processing order', error);
      await job.moveToFailed(new Error(error.message), '', true);
    }
  }

  private async waitBeforeMarkingComplete(job: Job) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!job.isCompleted() && !job.isFailed()) {
      try {
        await job.moveToCompleted('Order processing complete', '', true);
      } catch (error) {
        console.error(
          `Error moving job ${job.id} to completed: ${error.message}`,
        );
      }
    } else {
      console.log(`Job ${job.id} is already completed or failed.`);
    }
  }

  private async scheduleNextStatusUpdate(
    orderId: string,
    currentStatus: OrderStatus,
  ) {
    let nextStatus: OrderStatus;
    const delay = 10000;

    switch (currentStatus) {
      case OrderStatus.NEW:
        nextStatus = OrderStatus.IN_THE_KITCHEN;
        break;
      case OrderStatus.IN_THE_KITCHEN:
        nextStatus = OrderStatus.IN_DELIVERY;
        break;
      case OrderStatus.IN_DELIVERY:
        nextStatus = OrderStatus.DONE;
        break;
      case OrderStatus.DONE:
        return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        console.log(`Updating order ${orderId} status to ${nextStatus}`);
        await this.ordersService.updateOrderStatus(orderId, nextStatus);
        if (nextStatus !== OrderStatus.DONE) {
          await this.scheduleNextStatusUpdate(orderId, nextStatus);
        }
        resolve();
      }, delay);
    });
  }
}
