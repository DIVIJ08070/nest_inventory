import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('orders')
export class Order {
  @ApiProperty({
    example: 1,
    description: 'Unique order ID',
  })
  @PrimaryGeneratedColumn()
  order_id: number;

  @ApiProperty({
    example: 1,
    description: 'Tenant ID for multi-tenant system',
  })
  @Column()
  tenant_id: number;

  @ApiProperty({
    example: 5,
    description: 'Customer user ID',
  })
  @Column()
  customer_id: number;

  @ApiProperty({
    example: 'pending',
    description: 'Order status',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  })
  @Column({ type: 'varchar', length: 30, default: 'pending' })
  order_status: string;

  @ApiProperty({
    example: '1000.00',
    description: 'Subtotal before tax/discount',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal_amount: string;

  @ApiProperty({
    example: '100.00',
    description: 'Tax amount',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax_amount: string;

  @ApiProperty({
    example: '50.00',
    description: 'Discount amount applied',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_amount: string;

  @ApiProperty({
    example: '40.00',
    description: 'Shipping cost',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shipping_amount: string;

  @ApiProperty({
    example: '1090.00',
    description: 'Final order total',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grand_total: string;

  @ApiProperty({
    example: 1,
    description: 'Record status (1 active, 0 deleted)',
  })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({
    example: '2026-03-06T10:00:00.000Z',
    description: 'Order creation time',
  })
  @Column({ type: 'timestamp', default: () => 'current_timestamp' })
  created_at: Date;

  @ApiProperty({
    example: '2026-03-06T10:00:00.000Z',
    description: 'Last update time',
  })
  @Column({
    type: 'timestamp',
    default: () => 'current_timestamp',
    onUpdate: 'current_timestamp',
  })
  updated_at: Date;
}
