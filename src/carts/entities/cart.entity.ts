import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('carts')
export class Cart {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  cart_id: number;

  @ApiProperty({ example: 1 })
  @Column()
  tenant_id: number;

  @ApiProperty({ example: 2 })
  @Column()
  customer_id: number;

  @ApiProperty({ example: 1, description: '1 active, 0 inactive' })
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
