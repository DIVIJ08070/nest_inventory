import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  cart_item_id: number;

  @ApiProperty({ example: 1 })
  @Column()
  cart_id: number;

  @ApiProperty({ example: 5 })
  @Column()
  product_id: number;

  @ApiProperty({ example: 2 })
  @Column()
  quantity: number;

  @ApiProperty({ example: 1, description: '1 active, 0 removed' })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ example: '2026-03-06T10:00:00.000Z' })
  @Column({ type: 'timestamp', default: () => 'current_timestamp' })
  created_at: Date;

  @ApiProperty({ example: '2026-03-06T10:00:00.000Z' })
  @Column({
    type: 'timestamp',
    default: () => 'current_timestamp',
    onUpdate: 'current_timestamp',
  })
  updated_at: Date;
}
