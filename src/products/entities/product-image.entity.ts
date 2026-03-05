import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  image_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'tinyint', default: 0 })
  is_primary: number;

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
