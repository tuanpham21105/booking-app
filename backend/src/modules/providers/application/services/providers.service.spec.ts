import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProviderRepository } from '../../domain/repositories/provider.repository.port';
import { Provider } from '../../domain/entities/provider.entity';
import { CreateProviderDto, UpdateProviderDto } from '../dto';

class MockProviderRepository extends ProviderRepository {
  providers: Map<number, Provider> = new Map();
  nextId = 1;

  lastFindAllPage?: number;
  lastFindAllLimit?: number;
  lastFindAllSearch?: string;
  updateReturnsNull = false;

  async findById(id: number): Promise<Provider | null> {
    const provider = this.providers.get(id);
    if (!provider) return null;
    return new Provider(
      provider.name,
      provider.description,
      provider.id,
      provider.createdAt,
      provider.updatedAt,
    );
  }

  async findByName(name: string): Promise<Provider | null> {
    for (const provider of this.providers.values()) {
      if (provider.name.toLowerCase() === name.toLowerCase()) {
        return new Provider(
          provider.name,
          provider.description,
          provider.id,
          provider.createdAt,
          provider.updatedAt,
        );
      }
    }
    return null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<[Provider[], number]> {
    this.lastFindAllPage = page;
    this.lastFindAllLimit = limit;
    this.lastFindAllSearch = search;

    let all = Array.from(this.providers.values()).map(
      (p) => new Provider(p.name, p.description, p.id, p.createdAt, p.updatedAt),
    );

    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      all = all.filter((p) => p.name.toLowerCase().includes(term));
    }

    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return [paginated, total];
  }

  async create(name: string, description?: string | null): Promise<Provider> {
    const provider = new Provider(
      name,
      description ?? null,
      this.nextId++,
      new Date(),
      new Date(),
    );
    this.providers.set(provider.id!, provider);
    return new Provider(
      provider.name,
      provider.description,
      provider.id,
      provider.createdAt,
      provider.updatedAt,
    );
  }

  async update(
    id: number,
    name?: string,
    description?: string | null,
  ): Promise<Provider | null> {
    if (this.updateReturnsNull) {
      return null;
    }
    const provider = this.providers.get(id);
    if (!provider) return null;

    if (name !== undefined) provider.name = name;
    if (description !== undefined) provider.description = description;
    provider.updatedAt = new Date();

    this.providers.set(id, provider);
    return new Provider(
      provider.name,
      provider.description,
      provider.id,
      provider.createdAt,
      provider.updatedAt,
    );
  }

  async delete(id: number): Promise<boolean> {
    return this.providers.delete(id);
  }

  clear() {
    this.providers.clear();
    this.nextId = 1;
  }
}

describe('ProvidersService', () => {
  let service: ProvidersService;
  let repository: MockProviderRepository;

  beforeEach(async () => {
    repository = new MockProviderRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: ProviderRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  describe('create', () => {
    it('tạo nhà cung cấp mới thành công khi tên chưa tồn tại', async () => {
      const dto: CreateProviderDto = {
        name: 'Trung Tâm Thể Thao Pegasus',
        description: 'Sân cầu lông và tennis',
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe(dto.name);
      expect(result.description).toBe(dto.description);
    });

    it('ném lỗi ConflictException khi tên nhà cung cấp đã tồn tại', async () => {
      const dto: CreateProviderDto = {
        name: 'Trung Tâm Thể Thao Pegasus',
      };
      await service.create(dto);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Tên nhà cung cấp đã tồn tại trong hệ thống',
      );
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.create({ name: 'Alpha Sport', description: 'Alpha Desc' });
      await service.create({ name: 'Beta Fitness', description: 'Beta Desc' });
      await service.create({ name: 'Gamma Center', description: 'Gamma Desc' });
    });

    it('trả về danh sách nhà cung cấp phân trang và tổng số bản ghi', async () => {
      const [providers, total] = await service.findAll(1, 2);

      expect(providers).toHaveLength(2);
      expect(total).toBe(3);
      expect(repository.lastFindAllPage).toBe(1);
      expect(repository.lastFindAllLimit).toBe(2);
    });

    it('tìm kiếm theo từ khóa tên nhà cung cấp', async () => {
      const [providers, total] = await service.findAll(1, 10, 'Beta');

      expect(providers).toHaveLength(1);
      expect(total).toBe(1);
      expect(providers[0].name).toBe('Beta Fitness');
    });

    it('sử dụng giá trị mặc định page=1 và limit=10 khi không truyền', async () => {
      const [providers, total] = await service.findAll();

      expect(providers).toHaveLength(3);
      expect(total).toBe(3);
      expect(repository.lastFindAllPage).toBe(1);
      expect(repository.lastFindAllLimit).toBe(10);
    });
  });

  describe('findById', () => {
    it('trả về nhà cung cấp khi tìm thấy theo ID', async () => {
      const created = await service.create({ name: 'Pegasus Club' });

      const found = await service.findById(created.id!);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Pegasus Club');
    });

    it('ném lỗi NotFoundException khi không tìm thấy nhà cung cấp', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        'Không tìm thấy nhà cung cấp với ID 999',
      );
    });
  });

  describe('update', () => {
    let createdProvider: Provider;

    beforeEach(async () => {
      createdProvider = await service.create({
        name: 'Pegasus Club',
        description: 'Mô tả ban đầu',
      });
      await service.create({ name: 'Existing Another Name' });
    });

    it('cập nhật thành công tên và mô tả', async () => {
      const dto: UpdateProviderDto = {
        name: 'Pegasus Premium Club',
        description: 'Mô tả mới',
      };

      const updated = await service.update(createdProvider.id!, dto);

      expect(updated.name).toBe('Pegasus Premium Club');
      expect(updated.description).toBe('Mô tả mới');
    });

    it('cho phép cập nhật nếu giữ nguyên tên cũ của chính nhà cung cấp đó', async () => {
      const dto: UpdateProviderDto = {
        name: 'Pegasus Club',
        description: 'Chỉ cập nhật mô tả',
      };

      const updated = await service.update(createdProvider.id!, dto);

      expect(updated.name).toBe('Pegasus Club');
      expect(updated.description).toBe('Chỉ cập nhật mô tả');
    });

    it('ném lỗi ConflictException khi đổi tên trùng với nhà cung cấp khác', async () => {
      const dto: UpdateProviderDto = {
        name: 'Existing Another Name',
      };

      await expect(service.update(createdProvider.id!, dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(createdProvider.id!, dto)).rejects.toThrow(
        'Tên nhà cung cấp đã tồn tại trong hệ thống',
      );
    });

    it('ném lỗi NotFoundException khi cập nhật nhà cung cấp không tồn tại', async () => {
      await expect(
        service.update(999, { name: 'Non Existent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném lỗi NotFoundException khi repository trả về null lúc cập nhật', async () => {
      repository.updateReturnsNull = true;

      await expect(
        service.update(createdProvider.id!, { name: 'Some Name' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(createdProvider.id!, { name: 'Some Name' }),
      ).rejects.toThrow(`Không tìm thấy nhà cung cấp với ID ${createdProvider.id}`);
    });
  });

  describe('delete', () => {
    it('xóa nhà cung cấp thành công khi ID tồn tại', async () => {
      const created = await service.create({ name: 'To Be Deleted' });

      await service.delete(created.id!);

      await expect(service.findById(created.id!)).rejects.toThrow(NotFoundException);
    });

    it('ném lỗi NotFoundException khi xóa nhà cung cấp không tồn tại', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow(
        'Không tìm thấy nhà cung cấp với ID 999',
      );
    });
  });
});
