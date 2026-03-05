import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { SalesReportService } from './sales-report.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [SalesReportService],
})
export class ReportsModule {}
