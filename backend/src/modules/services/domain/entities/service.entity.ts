import { Provider } from '../../../providers/domain/entities/provider.entity';
import type { Schedule } from '../../../schedules/domain/entities/schedule.entity';

/**
 * Domain Service Entity thiết kế bằng TypeScript thuần,
 * độc lập hoàn toàn với framework và thư viện cơ sở dữ liệu.
 */
export class Service {
  id?: number;
  providerId: number;
  name: string;
  description?: string | null;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  provider?: Provider;
  schedules?: Schedule[];

  constructor(
    providerId: number,
    name: string,
    price: number,
    description?: string | null,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
    provider?: Provider,
    schedules?: Schedule[],
  ) {
    this.providerId = providerId;
    this.name = name;
    this.price = price;
    this.description = description;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.provider = provider;
    this.schedules = schedules;
  }
}
