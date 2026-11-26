import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmProviderRepository } from './typeorm-provider.repository';
import { ProviderOrmEntity } from '../entities/provider.orm-entity';
import { Provider } from '../../../domain/entities/provider.entity';

class MockProviderOrmRepository {
  findOneResult: ProviderOrmEntity | null = null;
  lastFindOneWhere?: Record<string, unknown>;

  findAndCountResult: [ProviderOrmEntity[], number] = [[], 0];
  lastSkip?: number;
  lastTake?: number;
  lastWhere?: unknown;

  createdEntity?: Partial<ProviderOrmEntity>;
  savedEntity?: ProviderOrmEntity;
  deletedId?: number;

  lastFindOneRelations?: unknown;

  async findOne(options: {
    where: Record<string, unknown>;
    relations?: unknown;
  }): Promise<ProviderOrmEntity | null> {
    this.lastFindOneWhere = options.where;
    this.lastFindOneRelations = options.relations;
    return this.findOneResult;
  }

  async findAndCount(options: {
    skip?: number;
    take?: number;
    order?: Record<string, string>;
    where?: unknown;
  }): Promise<[ProviderOrmEntity[], number]> {
    this.lastSkip = options.skip;
    this.lastTake = options.take;
    this.lastWhere = options.where;
    return this.findAndCountResult;
  }

  create(entity: Partial<ProviderOrmEntity>): ProviderOrmEntity {
    this.createdEntity = entity;
    const orm = new ProviderOrmEntity();
    orm.id = 1;
    orm.name = entity.name!;
    orm.description = entity.description ?? null;
    orm.createdAt = new Date('2026-11-26T00:00:00.000Z');
    orm.updatedAt = new Date('2026-11-26T00:00:00.000Z');
    return orm;
  }

  async save(entity: ProviderOrmEntity): Promise<ProviderOrmEntity> {
    this.savedEntity = entity;
    return entity;
  }

  async delete(id: number): Promise<{ affected?: number }> {
    this.deletedId = id;
    return { affected: id === 999 ? 0 : 1 };
  }
}

describe('TypeOrmProviderRepository', () => {
  let repository: TypeOrmProviderRepository;
  let mockOrmRepo: MockProviderOrmRepository;

  const createMockOrmEntity = (): ProviderOrmEntity => {
    const entity = new ProviderOrmEntity();
    entity.id = 1;
    entity.name = 'Pegasus Center';
    entity.description = 'Sports center';
    entity.createdAt = new Date('2026-11-26T00:00:00.000Z');
    entity.updatedAt = new Date('2026-11-26T00:00:00.000Z');
    return entity;
  };

  beforeEach(async () => {
    mockOrmRepo = new MockProviderOrmRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmProviderRepository,
        {
          provide: getRepositoryToken(ProviderOrmEntity),
          useValue: mockOrmRepo,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmProviderRepository>(TypeOrmProviderRepository);
  });

  describe('findById', () => {
    it('tìm kiếm theo ID và chuyển đổi sang Domain Entity', async () => {
      mockOrmRepo.findOneResult = createMockOrmEntity();

      const result = await repository.findById(1);

      expect(mockOrmRepo.lastFindOneWhere).toEqual({ id: 1 });
      expect(result).toBeInstanceOf(Provider);
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Pegasus Center');
    });

    it('trả về null khi không tìm thấy entity', async () => {
      mockOrmRepo.findOneResult = null;

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('tìm kiếm theo tên và chuyển đổi sang Domain Entity', async () => {
      mockOrmRepo.findOneResult = createMockOrmEntity();

      const result = await repository.findByName('Pegasus Center');

      expect(mockOrmRepo.lastFindOneWhere).toEqual({ name: 'Pegasus Center' });
      expect(result).toBeInstanceOf(Provider);
      expect(result?.name).toBe('Pegasus Center');
    });
  });

  describe('findAll', () => {
    it('phân trang và tìm kiếm theo tên với ILike', async () => {
      mockOrmRepo.findAndCountResult = [[createMockOrmEntity()], 1];

      const [list, total] = await repository.findAll(1, 10, 'Pegasus');

      expect(mockOrmRepo.lastSkip).toBe(0);
      expect(mockOrmRepo.lastTake).toBe(10);
      expect(list).toHaveLength(1);
      expect(total).toBe(1);
      expect(list[0]).toBeInstanceOf(Provider);
    });

    it('hoạt động chính xác khi không truyền search', async () => {
      mockOrmRepo.findAndCountResult = [[createMockOrmEntity()], 1];

      const [list, total] = await repository.findAll(2, 5);

      expect(mockOrmRepo.lastSkip).toBe(5);
      expect(mockOrmRepo.lastTake).toBe(5);
      expect(list).toHaveLength(1);
      expect(total).toBe(1);
    });
  });

  describe('create', () => {
    it('tạo và lưu entity vào cơ sở dữ liệu', async () => {
      const result = await repository.create('Pegasus Center', 'Sports center');

      expect(mockOrmRepo.createdEntity).toEqual({
        name: 'Pegasus Center',
        description: 'Sports center',
      });
      expect(mockOrmRepo.savedEntity).toBeDefined();
      expect(result).toBeInstanceOf(Provider);
      expect(result.name).toBe('Pegasus Center');
    });
  });

  describe('update', () => {
    it('cập nhật entity khi tìm thấy', async () => {
      mockOrmRepo.findOneResult = createMockOrmEntity();

      const result = await repository.update(1, 'Updated Name', 'Updated Desc');

      expect(result).toBeInstanceOf(Provider);
      expect(result?.name).toBe('Updated Name');
      expect(result?.description).toBe('Updated Desc');
    });

    it('trả về null khi không tìm thấy entity để cập nhật', async () => {
      mockOrmRepo.findOneResult = null;

      const result = await repository.update(999, 'Updated Name');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('trả về true khi xóa thành công', async () => {
      const result = await repository.delete(1);

      expect(mockOrmRepo.deletedId).toBe(1);
      expect(result).toBe(true);
    });

    it('trả về false khi không có bản ghi nào bị ảnh hưởng', async () => {
      const result = await repository.delete(999);

      expect(mockOrmRepo.deletedId).toBe(999);
      expect(result).toBe(false);
    });
  });
});
