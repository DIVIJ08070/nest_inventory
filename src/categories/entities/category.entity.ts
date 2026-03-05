import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column()
  tenant_id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true })
  description: string | null;

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
