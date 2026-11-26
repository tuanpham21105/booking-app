import type { Service } from '../../../services/domain/entities/service.entity';

/**
 * Domain Provider Entity thiết kế bằng TypeScript thuần,
 * độc lập hoàn toàn với framework và thư viện cơ sở dữ liệu.
 */
export class Provider {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  services?: Service[];

  constructor(
    name: string,
    description?: string | null,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
    services?: Service[],
  ) {
    this.name = name;
    this.description = description;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.services = services;
  }
}
