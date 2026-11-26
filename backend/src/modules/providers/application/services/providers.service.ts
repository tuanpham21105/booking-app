import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Provider } from '../../domain/entities/provider.entity';
import { ProviderRepository } from '../../domain/repositories/provider.repository.port';
import { CreateProviderDto, UpdateProviderDto } from '../dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly providerRepository: ProviderRepository) {}

  /**
   * Tạo nhà cung cấp mới (UC-05).
   * Kiểm tra tính duy nhất của tên nhà cung cấp.
   */
  async create(dto: CreateProviderDto): Promise<Provider> {
    const existing = await this.providerRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Tên nhà cung cấp đã tồn tại trong hệ thống');
    }

    return await this.providerRepository.create(dto.name, dto.description);
  }

  /**
   * Lấy danh sách nhà cung cấp phân trang, hỗ trợ tìm kiếm theo tên (UC-05).
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<[Provider[], number]> {
    return await this.providerRepository.findAll(page, limit, search);
  }

  /**
   * Xem thông tin chi tiết một nhà cung cấp theo ID (UC-05).
   */
  async findById(id: number): Promise<Provider> {
    const provider = await this.providerRepository.findById(id);
    if (!provider) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID ${id}`);
    }
    return provider;
  }

  /**
   * Cập nhật thông tin nhà cung cấp (UC-05).
   * Kiểm tra trùng tên với nhà cung cấp khác nếu cập nhật tên.
   */
  async update(id: number, dto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.findById(id);

    if (dto.name && dto.name !== provider.name) {
      const existing = await this.providerRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Tên nhà cung cấp đã tồn tại trong hệ thống');
      }
    }

    const updated = await this.providerRepository.update(
      id,
      dto.name,
      dto.description,
    );

    if (!updated) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID ${id}`);
    }

    return updated;
  }

  /**
   * Xóa nhà cung cấp (UC-05).
   */
  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.providerRepository.delete(id);
  }
}
