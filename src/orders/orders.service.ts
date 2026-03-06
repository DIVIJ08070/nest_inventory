import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthedUser } from 'src/Common/types/authed-user';
import { Product } from 'src/products/entities/product.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { OrderItem } from './entities/order-item.entity';

import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

type OrderConfirmationJob = {
  email: string;
  orderId: number;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryRepo: Repository<InventoryMovement>,

    @InjectQueue('notifications')
    private readonly notificationQueue: Queue<OrderConfirmationJob>,
  ) {}

  async createOrder(user: AuthedUser, dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;

      const order = queryRunner.manager.create(Order, {
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
        order_status: 'pending',
        subtotal_amount: '0.00',
        tax_amount: '0.00',
        discount_amount: '0.00',
        shipping_amount: '0.00',
        grand_total: '0.00',
        status: 1,
      });

      await queryRunner.manager.save(order);

      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: {
            product_id: item.product_id,
            tenant_id: user.tenant_id,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) throw new Error('product not found');

        if (product.stock < item.quantity) throw new Error('not enough stock');

        const price = Number(product.price);
        const lineSubtotal = price * item.quantity;

        subtotal += lineSubtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order_id: order.order_id,
          product_id: product.product_id,
          quantity: item.quantity,
          unit_price: price.toFixed(2),
          line_subtotal: lineSubtotal.toFixed(2),
          line_total: lineSubtotal.toFixed(2),
          status: 1,
        });

        await queryRunner.manager.save(orderItem);

        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        const move = queryRunner.manager.create(InventoryMovement, {
          tenant_id: user.tenant_id,
          product_id: product.product_id,
          order_id: order.order_id,
          type: 'order',
          quantity: item.quantity,
          note: 'stock deducted for order',
          status: 1,
        });

        await queryRunner.manager.save(move);
      }

      order.subtotal_amount = subtotal.toFixed(2);
      order.grand_total = subtotal.toFixed(2);

      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      console.log('Order committed, pushing job to queue');

      await this.notificationQueue.add('order-confirmation', {
        email: 'test@test.com',
        orderId: order.order_id,
      });

      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async findMyOrders(user: AuthedUser) {
    return this.orderRepo.find({
      where: {
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
      },
      order: { order_id: 'DESC' },
    });
  }
  async getOrder(user: AuthedUser, orderId: number) {
    return this.orderRepo.findOne({
      where: {
        order_id: orderId,
        tenant_id: user.tenant_id,
      },
    });
  }
  async getAllOrders(user: AuthedUser) {
    return this.orderRepo.find({
      where: { tenant_id: user.tenant_id },
      order: { order_id: 'DESC' },
    });
  }
  async updateStatus(orderId: number, status: string) {
    const order = await this.orderRepo.findOne({
      where: { order_id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.order_status = status;

    return this.orderRepo.save(order);
  }
}
