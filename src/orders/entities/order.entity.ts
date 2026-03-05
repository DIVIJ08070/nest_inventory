import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column()
  tenant_id: number;

  @Column()
  customer_id: number;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  order_status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal_amount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax_amount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_amount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shipping_amount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grand_total: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'timestamp', default: () => 'current_timestamp' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'current_timestamp',
    onUpdate: 'current_timestamp',
  })
  updated_at: Date;
}
