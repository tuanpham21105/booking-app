import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceRepository } from '../../domain/repositories/service.repository.port';
import { ProviderRepository } from '../../../providers/domain/repositories/provider.repository.port';
import { Service } from '../../domain/entities/service.entity';
import { Provider } from '../../../providers/domain/entities/provider.entity';

class MockServiceRepository extends ServiceRepository {
  services: Service[] = [];
  lastFindAllParams?: {
    page?: number;
    limit?: number;
    search?: string;
    providerId?: number;
  };
  lastUpdateParams?: {
    id: number;
    providerId?: number;
    name?: string;
    price?: number;
    description?: string | null;
  };

  async findById(id: number): Promise<Service | null> {
    return this.services.find((s) => s.id === id) ?? null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    providerId?: number,
  ): Promise<[Service[], number]> {
    this.lastFindAllParams = { page, limit, search, providerId };
    let filtered = [...this.services];
    if (providerId !== undefined) {
      filtered = filtered.filter((s) => s.providerId === providerId);
    }
    if (search) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return [filtered, filtered.length];
  }

  async create(
    providerId: number,
    name: string,
    price: number,
    description?: string | null,
  ): Promise<Service> {
    const service = new Service(
      providerId,
      name,
      price,
      description ?? null,
      this.services.length + 1,
      new Date(),
      new Date(),
    );
    this.services.push(service);
    return service;
  }

  async update(
    id: number,
    providerId?: number,
    name?: string,
    price?: number,
    description?: string | null,
  ): Promise<Service | null> {
    this.lastUpdateParams = { id, providerId, name, price, description };
    const service = await this.findById(id);
    if (!service) return null;
    if (providerId !== undefined) service.providerId = providerId;
    if (name !== undefined) service.name = name;
    if (price !== undefined) service.price = price;
    if (description !== undefined) service.description = description;
    return service;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.services.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.services.splice(index, 1);
    return true;
  }
}

class MockProviderRepository extends ProviderRepository {
  providers: Provider[] = [];

  async findById(id: number): Promise<Provider | null> {
    return this.providers.find((p) => p.id === id) ?? null;
  }
  async findByName(name: string): Promise<Provider | null> {
    return this.providers.find((p) => p.name === name) ?? null;
  }
  async findAll(): Promise<[Provider[], number]> {
    return [this.providers, this.providers.length];
  }
  async create(name: string, description?: string | null): Promise<Provider> {
    const provider = new Provider(
      name,
      description,
      this.providers.length + 1,
      new Date(),
      new Date(),
    );
    this.providers.push(provider);
    return provider;
  }
  async update(): Promise<Provider | null> {
    return null;
  }
  async delete(): Promise<boolean> {
    return true;
  }
}

describe('ServicesService', () => {
  let service: ServicesService;
  let serviceRepository: MockServiceRepository;
  let providerRepository: MockProviderRepository;

  beforeEach(async () => {
    serviceRepository = new MockServiceRepository();
    providerRepository = new MockProviderRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: ServiceRepository, useValue: serviceRepository },
        { provide: ProviderRepository, useValue: providerRepository },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if provider does not exist', async () => {
      await expect(
        service.create({
          providerId: 999,
          name: 'Thuê sân cầu lông VIP',
          price: 150000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully create service when provider exists', async () => {
      const provider = await providerRepository.create('Pegasus');
      const result = await service.create({
        providerId: provider.id!,
        name: 'Thuê sân cầu lông VIP',
        price: 150000,
        description: 'Sân tiêu chuẩn thi đấu',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Thuê sân cầu lông VIP');
      expect(result.providerId).toBe(provider.id);
      expect(result.provider?.name).toBe('Pegasus');
    });
  });

  describe('findAll', () => {
    it('should return services and total count', async () => {
      serviceRepository.services.push(
        new Service(1, 'Sân VIP 1', 100000, null, 1),
        new Service(2, 'Sân VIP 2', 200000, null, 2),
      );

      const [services, total] = await service.findAll(1, 10, 'VIP', 1);
      expect(total).toBe(1);
      expect(services.length).toBe(1);
      expect(services[0].id).toBe(1);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if service does not exist', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });

    it('should return service when found', async () => {
      const item = new Service(1, 'Sân VIP', 150000, null, 1);
      serviceRepository.services.push(item);

      const found = await service.findById(1);
      expect(found).toBeDefined();
      expect(found.id).toBe(1);
      expect(found.name).toBe('Sân VIP');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if service not found', async () => {
      await expect(
        service.update(999, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if new providerId does not exist', async () => {
      serviceRepository.services.push(new Service(1, 'Sân VIP', 150000, null, 1));

      await expect(
        service.update(1, { providerId: 888 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update service details successfully', async () => {
      const provider1 = await providerRepository.create('Pegasus 1');
      const provider2 = await providerRepository.create('Pegasus 2');
      const item = new Service(provider1.id!, 'Sân VIP', 150000, null, 1);
      serviceRepository.services.push(item);

      const updated = await service.update(1, {
        providerId: provider2.id,
        name: 'Sân VIP Pro',
        price: 200000,
        description: 'Mới nâng cấp',
      });

      expect(updated.name).toBe('Sân VIP Pro');
      expect(updated.price).toBe(200000);
      expect(updated.providerId).toBe(provider2.id);
      expect(updated.description).toBe('Mới nâng cấp');
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if service does not exist', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('should delete service successfully', async () => {
      serviceRepository.services.push(new Service(1, 'Sân VIP', 150000, null, 1));
      await service.delete(1);
      expect(serviceRepository.services.length).toBe(0);
    });
  });
});
