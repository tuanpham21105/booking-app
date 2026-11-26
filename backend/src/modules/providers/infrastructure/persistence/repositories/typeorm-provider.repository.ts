import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ProviderRepository } from '../../../domain/repositories/provider.repository.port';
import { Provider } from '../../../domain/entities/provider.entity';
import { ProviderOrmEntity } from '../entities/provider.orm-entity';
import {
  calculatePagination,
  convertToDomain,
  convertToDomainList,
} from '../../../../../common/utils';

@Injectable()
export class TypeOrmProviderRepository extends ProviderRepository {
  constructor(
    @InjectRepository(ProviderOrmEntity)
    private readonly providerOrmRepository: Repository<ProviderOrmEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Provider | null> {
    const entity = await this.providerOrmRepository.findOne({ where: { id } });
    return convertToDomain(Provider, entity);
  }

  async findByName(name: string): Promise<Provider | null> {
    const entity = await this.providerOrmRepository.findOne({ where: { name } });
    return convertToDomain(Provider, entity);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<[Provider[], number]> {
    const { skip, take } = calculatePagination(page, limit);

    let where: FindOptionsWhere<ProviderOrmEntity> | undefined;

    if (search?.trim()) {
      where = { name: ILike(`%${search.trim()}%`) };
    }

    const [entities, total] = await this.providerOrmRepository.findAndCount({
      skip,
      take,
      ...(where !== undefined ? { where } : {}),
      order: { createdAt: 'DESC' },
    });

    return [convertToDomainList(Provider, entities), total];
  }

  async create(name: string, description?: string | null): Promise<Provider> {
    const entity = this.providerOrmRepository.create({
      name,
      description: description ?? null,
    });
    const saved = await this.providerOrmRepository.save(entity);
    return convertToDomain(Provider, saved) as Provider;
  }

  async update(
    id: number,
    name?: string,
    description?: string | null,
  ): Promise<Provider | null> {
    const existing = await this.providerOrmRepository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    if (name !== undefined) existing.name = name;
    if (description !== undefined) existing.description = description;

    const updated = await this.providerOrmRepository.save(existing);
    return convertToDomain(Provider, updated);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.providerOrmRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
