import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { ServiceOrmEntity } from '../../../../services/infrastructure/persistence/entities/service.orm-entity';

@Entity('providers')
export class ProviderOrmEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Index({ unique: true })
  @Column({ name: 'name', type: 'varchar', length: 150, unique: true, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

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

  @OneToMany('ServiceOrmEntity', 'provider')
  services: ServiceOrmEntity[];
}
