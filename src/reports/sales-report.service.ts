import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class SalesReportService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  @Cron('59 23 * * *')
  //   @Cron('*/10 * * * * *')
  async generateDailySales() {
    console.log('Generating Daily Sales Summary...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const orders = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.created_at >= :today', { today })
      .andWhere('o.created_at < :tomorrow', { tomorrow })
      .andWhere('o.status = 1')
      .getMany();

    let totalSales = 0;

    for (const order of orders) {
      totalSales += Number(order.grand_total);
    }

    console.log('Daily Sales Report');
    console.log('Orders:', orders.length);
    console.log('Total Revenue:', totalSales.toFixed(2));
  }
}
