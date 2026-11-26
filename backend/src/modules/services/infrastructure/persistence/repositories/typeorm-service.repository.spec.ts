import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmServiceRepository } from './typeorm-service.repository';
import { ServiceOrmEntity } from '../entities/service.orm-entity';
import { ProviderOrmEntity } from '../../../../providers/infrastructure/persistence/entities/provider.orm-entity';

class MockServiceOrmRepository {
  findOneResult: ServiceOrmEntity | null = null;
  findAndCountResult: [ServiceOrmEntity[], number] = [[], 0];
  createdEntity?: Partial<ServiceOrmEntity>;
  savedEntity?: ServiceOrmEntity;
  deletedId?: number;

  async findOne(): Promise<ServiceOrmEntity | null> {
    return this.findOneResult;
  }

  async findAndCount(): Promise<[ServiceOrmEntity[], number]> {
    return this.findAndCountResult;
  }

  create(entity: Partial<ServiceOrmEntity>): ServiceOrmEntity {
    this.createdEntity = entity;
    const orm = new ServiceOrmEntity();
    orm.id = 1;
    orm.providerId = entity.providerId!;
    orm.name = entity.name!;
    orm.price = entity.price!;
    orm.description = entity.description ?? null;
    orm.createdAt = new Date('2026-11-26T00:00:00.000Z');
    orm.updatedAt = new Date('2026-11-26T00:00:00.000Z');
    return orm;
  }

  async save(entity: ServiceOrmEntity): Promise<ServiceOrmEntity> {
    this.savedEntity = entity;
    return entity;
  }

  async delete(id: number): Promise<{ affected?: number }> {
    this.deletedId = id;
    return { affected: id === 999 ? 0 : 1 };
  }
}

describe('TypeOrmServiceRepository', () => {
  let repository: TypeOrmServiceRepository;
  let mockOrm: MockServiceOrmRepository;

  beforeEach(async () => {
    mockOrm = new MockServiceOrmRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmServiceRepository,
        {
          provide: getRepositoryToken(ServiceOrmEntity),
          useValue: mockOrm,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmServiceRepository>(TypeOrmServiceRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return null when not found', async () => {
      mockOrm.findOneResult = null;
      const result = await repository.findById(1);
      expect(result).toBeNull();
    });

    it('should return domain service with provider when found', async () => {
      const orm = new ServiceOrmEntity();
      orm.id = 1;
      orm.providerId = 10;
      orm.name = 'Sân Cầu Lông VIP';
      orm.price = 150000;
      orm.description = 'Mô tả';
      orm.createdAt = new Date();
      orm.updatedAt = new Date();

      const providerOrm = new ProviderOrmEntity();
      providerOrm.id = 10;
      providerOrm.name = 'Pegasus Sports';
      orm.provider = providerOrm;

      mockOrm.findOneResult = orm;

      const result = await repository.findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Sân Cầu Lông VIP');
      expect(result?.provider?.name).toBe('Pegasus Sports');
    });
  });

  describe('findAll', () => {
    it('should return list of services and total count', async () => {
      const orm = new ServiceOrmEntity();
      orm.id = 1;
      orm.providerId = 1;
      orm.name = 'Sân 1';
      orm.price = 100000;

      mockOrm.findAndCountResult = [[orm], 1];

      const [services, total] = await repository.findAll(1, 10, 'Sân', 1);
      expect(total).toBe(1);
      expect(services.length).toBe(1);
      expect(services[0].id).toBe(1);
    });
  });

  describe('create', () => {
    it('should create and return domain service', async () => {
      const result = await repository.create(1, 'Sân VIP', 150000, 'Mô tả');
      expect(result).toBeDefined();
      expect(result.name).toBe('Sân VIP');
      expect(result.price).toBe(150000);
      expect(result.providerId).toBe(1);
    });
  });

  describe('update', () => {
    it('should return null if service not found', async () => {
      mockOrm.findOneResult = null;
      const result = await repository.update(999, 1, 'New Name');
      expect(result).toBeNull();
    });

    it('should update and return updated service', async () => {
      const existing = new ServiceOrmEntity();
      existing.id = 1;
      existing.providerId = 1;
      existing.name = 'Old Name';
      existing.price = 100000;
      mockOrm.findOneResult = existing;

      const result = await repository.update(1, 2, 'New Name', 200000, 'New Desc');
      expect(result).toBeDefined();
      expect(result?.name).toBe('New Name');
      expect(result?.price).toBe(200000);
      expect(result?.providerId).toBe(2);
      expect(result?.description).toBe('New Desc');
    });
  });

  describe('delete', () => {
    it('should return true when affected > 0', async () => {
      const result = await repository.delete(1);
      expect(result).toBe(true);
    });

    it('should return false when affected = 0', async () => {
      const result = await repository.delete(999);
      expect(result).toBe(false);
    });
  });
});
