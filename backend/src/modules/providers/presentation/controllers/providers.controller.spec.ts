import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from '../../application/services/providers.service';
import { Provider } from '../../domain/entities/provider.entity';
import { CreateProviderDto, ProviderQueryDto, UpdateProviderDto } from '../dto';

class MockProvidersService {
  providers: Provider[] = [];
  lastFindAllParams?: {
    page?: number;
    limit?: number;
    search?: string;
  };
  lastFindByIdParam?: number;
  lastCreateDto?: CreateProviderDto;
  lastUpdateParam?: { id: number; dto: UpdateProviderDto };
  lastDeleteParam?: number;

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<[Provider[], number]> {
    this.lastFindAllParams = { page, limit, search };
    return [this.providers, this.providers.length];
  }

  async findById(id: number): Promise<Provider> {
    this.lastFindByIdParam = id;
    const found = this.providers.find((p) => p.id === id);
    if (!found) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID ${id}`);
    }
    return found;
  }

  async create(dto: CreateProviderDto): Promise<Provider> {
    this.lastCreateDto = dto;
    const provider = new Provider(
      dto.name,
      dto.description ?? null,
      this.providers.length + 1,
      new Date(),
      new Date(),
    );
    this.providers.push(provider);
    return provider;
  }

  async update(id: number, dto: UpdateProviderDto): Promise<Provider> {
    this.lastUpdateParam = { id, dto };
    const provider = await this.findById(id);
    if (dto.name !== undefined) provider.name = dto.name;
    if (dto.description !== undefined) provider.description = dto.description;
    return provider;
  }

  async delete(id: number): Promise<void> {
    this.lastDeleteParam = id;
    await this.findById(id);
    this.providers = this.providers.filter((p) => p.id !== id);
  }
}

describe('ProvidersController', () => {
  let controller: ProvidersController;
  let mockService: MockProvidersService;

  const sampleProvider = new Provider(
    'Trung Tâm Thể Thao Pegasus',
    'Mô tả trung tâm thể thao',
    1,
    new Date('2026-11-26T00:00:00.000Z'),
    new Date('2026-11-26T00:00:00.000Z'),
  );

  beforeEach(async () => {
    mockService = new MockProvidersService();
    mockService.providers = [sampleProvider];

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProvidersController>(ProvidersController);
  });

  describe('findAll', () => {
    it('trả về danh sách nhà cung cấp kèm phân trang và servicesCount = 0', async () => {
      const result = await controller.findAll({ page: 1, limit: 10, search: 'Pegasus' });

      expect(mockService.lastFindAllParams).toEqual({
        page: 1,
        limit: 10,
        search: 'Pegasus',
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].name).toBe('Trung Tâm Thể Thao Pegasus');
      expect(result.data[0].servicesCount).toBe(0);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('tự động fallback limit về 100 nếu limit > 100', async () => {
      await controller.findAll({ page: 1, limit: 200 });

      expect(mockService.lastFindAllParams?.limit).toBe(100);
    });

    it('chuyển đổi limit vượt quá 100 thành 100 qua plainToInstance trong ProviderQueryDto', () => {
      const dto = plainToInstance(ProviderQueryDto, { limit: '250', page: '2' });
      expect(dto.limit).toBe(100);
      expect(dto.page).toBe(2);
    });

    it('giữ nguyên limit hợp lệ <= 100 qua plainToInstance trong ProviderQueryDto', () => {
      const dto = plainToInstance(ProviderQueryDto, { limit: '50' });
      expect(dto.limit).toBe(50);
    });

    it('giữ nguyên giá trị không phải số qua plainToInstance trong ProviderQueryDto', () => {
      const dto = plainToInstance(ProviderQueryDto, { limit: 'invalid' });
      expect(Number.isNaN(dto.limit)).toBe(true);
    });
  });

  describe('findById', () => {
    it('trả về chi tiết nhà cung cấp kèm mảng services rỗng', async () => {
      const result = await controller.findById(1);

      expect(mockService.lastFindByIdParam).toBe(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Trung Tâm Thể Thao Pegasus');
      expect(result.description).toBe('Mô tả trung tâm thể thao');
      expect(result.services).toEqual([]);
    });

    it('ném lỗi NotFoundException khi không tìm thấy', async () => {
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('gọi service.create và trả về chi tiết nhà cung cấp mới', async () => {
      const dto: CreateProviderDto = {
        name: 'Sân Cầu Lông ABC',
        description: 'Sân hiện đại',
      };

      const result = await controller.create(dto);

      expect(mockService.lastCreateDto).toEqual(dto);
      expect(result.name).toBe('Sân Cầu Lông ABC');
      expect(result.services).toEqual([]);
    });
  });

  describe('update', () => {
    it('gọi service.update và trả về thông tin cập nhật', async () => {
      const dto: UpdateProviderDto = {
        name: 'Pegasus Premium',
      };

      const result = await controller.update(1, dto);

      expect(mockService.lastUpdateParam).toEqual({ id: 1, dto });
      expect(result.name).toBe('Pegasus Premium');
      expect(result.services).toEqual([]);
    });
  });

  describe('delete', () => {
    it('gọi service.delete và trả về SuccessMessageResponseDto', async () => {
      const result = await controller.delete(1);

      expect(mockService.lastDeleteParam).toBe(1);
      expect(result).toEqual({
        success: true,
        message: 'Xóa nhà cung cấp thành công',
      });
    });
  });
});
