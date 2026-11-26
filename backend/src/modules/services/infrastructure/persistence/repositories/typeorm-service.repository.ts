import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ServiceRepository } from '../../../domain/repositories/service.repository.port';
import { Service } from '../../../domain/entities/service.entity';
import { Provider } from '../../../../providers/domain/entities/provider.entity';
import { ServiceOrmEntity } from '../entities/service.orm-entity';
import {
  calculatePagination,
  convertToDomain,
} from '../../../../../common/utils';

@Injectable()
export class TypeOrmServiceRepository extends ServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly serviceOrmRepository: Repository<ServiceOrmEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Service | null> {
    const entity = await this.serviceOrmRepository.findOne({
      where: { id },
      relations: { provider: true },
    });

    if (!entity) {
      return null;
    }

    const service = convertToDomain(Service, entity);
    if (entity.provider) {
      service.provider = convertToDomain(Provider, entity.provider);
    }

    return service;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    providerId?: number,
  ): Promise<[Service[], number]> {
    const { skip, take } = calculatePagination(page, limit);

    const where: FindOptionsWhere<ServiceOrmEntity> = {};

    if (providerId !== undefined) {
      where.providerId = providerId;
    }

    if (search?.trim()) {
      where.name = ILike(`%${search.trim()}%`);
    }

    const [entities, total] = await this.serviceOrmRepository.findAndCount({
      skip,
      take,
      ...(Object.keys(where).length > 0 ? { where } : {}),
      relations: { provider: true },
      order: { createdAt: 'DESC' },
    });

    const services = entities.map((entity) => {
      const service = convertToDomain(Service, entity);
      if (entity.provider) {
        service.provider = convertToDomain(Provider, entity.provider);
      }
      return service;
    });

    return [services, total];
  }

  async create(
    providerId: number,
    name: string,
    price: number,
    description?: string | null,
  ): Promise<Service> {
    const entity = this.serviceOrmRepository.create({
      providerId,
      name,
      price,
      description: description ?? null,
    });

    const saved = await this.serviceOrmRepository.save(entity);
    return convertToDomain(Service, saved) as Service;
  }

  async update(
    id: number,
    providerId?: number,
    name?: string,
    price?: number,
    description?: string | null,
  ): Promise<Service | null> {
    const existing = await this.serviceOrmRepository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    if (providerId !== undefined) existing.providerId = providerId;
    if (name !== undefined) existing.name = name;
    if (price !== undefined) existing.price = price;
    if (description !== undefined) existing.description = description;

    const updated = await this.serviceOrmRepository.save(existing);
    return convertToDomain(Service, updated);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.serviceOrmRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
