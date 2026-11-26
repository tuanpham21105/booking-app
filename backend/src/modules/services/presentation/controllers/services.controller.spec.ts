import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from '../../application/services/services.service';
import { Service } from '../../domain/entities/service.entity';
import { Provider } from '../../../providers/domain/entities/provider.entity';
import { CreateServiceDto, ServiceQueryDto, UpdateServiceDto } from '../dto';

class MockServicesService {
  services: Service[] = [];
  lastFindAllParams?: {
    page?: number;
    limit?: number;
    search?: string;
    providerId?: number;
  };
  lastFindByIdParam?: number;
  lastCreateDto?: CreateServiceDto;
  lastUpdateParam?: { id: number; dto: UpdateServiceDto };
  lastDeleteParam?: number;

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    providerId?: number,
  ): Promise<[Service[], number]> {
    this.lastFindAllParams = { page, limit, search, providerId };
    return [this.services, this.services.length];
  }

  async findById(id: number): Promise<Service> {
    this.lastFindByIdParam = id;
    const found = this.services.find((s) => s.id === id);
    if (!found) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID ${id}`);
    }
    return found;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    this.lastCreateDto = dto;
    const service = new Service(
      dto.providerId,
      dto.name,
      dto.price,
      dto.description ?? null,
      this.services.length + 1,
      new Date(),
      new Date(),
      new Provider('Pegasus', null, dto.providerId),
    );
    this.services.push(service);
    return service;
  }

  async update(id: number, dto: UpdateServiceDto): Promise<Service> {
    this.lastUpdateParam = { id, dto };
    const service = await this.findById(id);
    if (dto.providerId !== undefined) service.providerId = dto.providerId;
    if (dto.name !== undefined) service.name = dto.name;
    if (dto.price !== undefined) service.price = dto.price;
    if (dto.description !== undefined) service.description = dto.description;
    return service;
  }

  async delete(id: number): Promise<void> {
    this.lastDeleteParam = id;
    await this.findById(id);
    const index = this.services.findIndex((s) => s.id === id);
    this.services.splice(index, 1);
  }
}

describe('ServicesController', () => {
  let controller: ServicesController;
  let mockService: MockServicesService;

  beforeEach(async () => {
    mockService = new MockServicesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated services list', async () => {
      mockService.services = [
        new Service(
          1,
          'Sân VIP',
          150000,
          'Mô tả',
          1,
          new Date(),
          new Date(),
          new Provider('Pegasus', null, 1),
        ),
      ];

      const query: ServiceQueryDto = { page: 1, limit: 10, search: 'VIP', providerId: 1 };
      const result = await controller.findAll(query);

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].name).toBe('Sân VIP');
      expect(result.data[0].providerName).toBe('Pegasus');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return service detail response', async () => {
      mockService.services = [
        new Service(
          1,
          'Sân VIP',
          150000,
          'Mô tả',
          1,
          new Date(),
          new Date(),
          new Provider('Pegasus', null, 1),
        ),
      ];

      const result = await controller.findById(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Sân VIP');
      expect(result.provider?.name).toBe('Pegasus');
      expect(result.upcomingSchedules).toEqual([]);
    });

    it('should throw NotFoundException when service does not exist', async () => {
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return service detail response', async () => {
      const dto: CreateServiceDto = {
        providerId: 1,
        name: 'Sân Cầu Lông Mới',
        price: 180000,
        description: 'Chi tiết sân',
      };

      const result = await controller.create(dto);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Sân Cầu Lông Mới');
      expect(result.price).toBe(180000);
      expect(result.provider?.name).toBe('Pegasus');
    });
  });

  describe('update', () => {
    it('should update and return updated service detail', async () => {
      mockService.services = [
        new Service(1, 'Sân Cũ', 150000, 'Mô tả', 1, new Date(), new Date()),
      ];

      const dto: UpdateServiceDto = {
        name: 'Sân Cập Nhật',
        price: 200000,
      };

      const result = await controller.update(1, dto);
      expect(result.name).toBe('Sân Cập Nhật');
      expect(result.price).toBe(200000);
    });
  });

  describe('delete', () => {
    it('should delete service and return success message', async () => {
      mockService.services = [
        new Service(1, 'Sân Cũ', 150000, null, 1, new Date(), new Date()),
      ];

      const result = await controller.delete(1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Xóa dịch vụ thành công');
      expect(mockService.services.length).toBe(0);
    });
  });
});
