import { Injectable, NotFoundException } from '@nestjs/common';
import { Service } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository.port';
import { ProviderRepository } from '../../../providers/domain/repositories/provider.repository.port';
import { CreateServiceDto, UpdateServiceDto } from '../dto';

@Injectable()
export class ServicesService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly providerRepository: ProviderRepository,
  ) {}

  /**
   * Tạo dịch vụ mới cho nhà cung cấp (UC-06).
   * Kiểm tra sự tồn tại của nhà cung cấp liên kết.
   */
  async create(dto: CreateServiceDto): Promise<Service> {
    const provider = await this.providerRepository.findById(dto.providerId);
    if (!provider) {
      throw new NotFoundException('Nhà cung cấp không tồn tại trong hệ thống');
    }

    const service = await this.serviceRepository.create(
      dto.providerId,
      dto.name,
      dto.price,
      dto.description,
    );

    service.provider = provider;
    return service;
  }

  /**
   * Lấy danh sách dịch vụ phân trang, tìm kiếm theo tên hoặc lọc theo providerId (UC-04).
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    providerId?: number,
  ): Promise<[Service[], number]> {
    return await this.serviceRepository.findAll(page, limit, search, providerId);
  }

  /**
   * Xem chi tiết một dịch vụ theo ID (UC-04).
   */
  async findById(id: number): Promise<Service> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID ${id}`);
    }
    return service;
  }

  /**
   * Cập nhật thông tin dịch vụ (UC-06).
   * Kiểm tra nhà cung cấp mới nếu có thay đổi providerId.
   */
  async update(id: number, dto: UpdateServiceDto): Promise<Service> {
    await this.findById(id);

    if (dto.providerId !== undefined) {
      const provider = await this.providerRepository.findById(dto.providerId);
      if (!provider) {
        throw new NotFoundException('Nhà cung cấp không tồn tại trong hệ thống');
      }
    }

    const updated = await this.serviceRepository.update(
      id,
      dto.providerId,
      dto.name,
      dto.price,
      dto.description,
    );

    // Refresh provider relationship if needed
    if (updated) {
      const reloaded = await this.serviceRepository.findById(id);
      return reloaded ?? updated;
    }

    return updated!;
  }

  /**
   * Xóa dịch vụ theo ID (UC-06).
   * Cascade xóa lịch và booking liên quan qua Foreign Key DB.
   */
  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.serviceRepository.delete(id);
  }
}
