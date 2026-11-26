import { Service } from '../entities/service.entity';

/**
 * Port trừu tượng định nghĩa các hành vi thao tác dữ liệu của Service Entity.
 * Tầng Application chỉ phụ thuộc vào Port này, tuân thủ nguyên tắc Dependency Inversion (DIP).
 */
export abstract class ServiceRepository {
  abstract findById(id: number): Promise<Service | null>;
  abstract findAll(
    page?: number,
    limit?: number,
    search?: string,
    providerId?: number,
  ): Promise<[Service[], number]>;
  abstract create(
    providerId: number,
    name: string,
    price: number,
    description?: string | null,
  ): Promise<Service>;
  abstract update(
    id: number,
    providerId?: number,
    name?: string,
    price?: number,
    description?: string | null,
  ): Promise<Service | null>;
  abstract delete(id: number): Promise<boolean>;
}
