import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  order_item_id: number;

  @Column()
  order_id: number;

  @Column()
  product_id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  line_subtotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  line_total: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
