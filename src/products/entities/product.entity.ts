import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column()
  tenant_id: number;

  @Column()
  vendor_id: number;

  @Column({ type: 'int', nullable: true })
  category_id: number | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

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
