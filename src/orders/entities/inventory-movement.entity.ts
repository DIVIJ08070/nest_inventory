import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  movement_id: number;

  @Column()
  tenant_id: number;

  @Column()
  product_id: number;

  @Column()
  order_id: number;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column()
  quantity: number;

  @Column({ type: 'varchar', length: 255 })
  note: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
