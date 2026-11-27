import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceOrmEntity } from '../../../../services/infrastructure/persistence/entities/service.orm-entity';

@Entity('schedules')
@Index(['serviceId', 'date'])
export class ScheduleOrmEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Index()
  @Column({ name: 'service_id', type: 'integer', nullable: false })
  serviceId: number;

  @Index()
  @Column({ name: 'date', type: 'date', nullable: false })
  date: string;

  @Column({ name: 'start_time', type: 'time', nullable: false })
  startTime: string;

  @Column({ name: 'duration', type: 'integer', nullable: false })
  duration: number;

  @Column({ name: 'total_slots', type: 'integer', nullable: false })
  totalSlots: number;

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

  @ManyToOne(() => ServiceOrmEntity, (service) => service.schedules, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;
}
