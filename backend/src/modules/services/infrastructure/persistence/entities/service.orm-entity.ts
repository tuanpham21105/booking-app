import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProviderOrmEntity } from '../../../../providers/infrastructure/persistence/entities/provider.orm-entity';
import type { ScheduleOrmEntity } from '../../../../schedules/infrastructure/persistence/entities/schedule.orm-entity';

@Entity('services')
export class ServiceOrmEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Index()
  @Column({ name: 'provider_id', type: 'integer', nullable: false })
  providerId: number;

  @Index()
  @Column({ name: 'name', type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => (value !== null && value !== undefined ? Number(value) : 0),
    },
  })
  price: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => ProviderOrmEntity, (provider) => provider.services, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderOrmEntity;

  @OneToMany('ScheduleOrmEntity', 'service')
  schedules: ScheduleOrmEntity[];
}
