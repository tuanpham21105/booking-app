import { Provider } from '../entities/provider.entity';

/**
 * Port trừu tượng định nghĩa hợp đồng thao tác dữ liệu của Provider.
 * Các adapter tầng infrastructure bắt buộc phải hiện thực hóa port này.
 */
export abstract class ProviderRepository {
  abstract findById(id: number): Promise<Provider | null>;
  abstract findByName(name: string): Promise<Provider | null>;
  abstract findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Provider[], number]>;
  abstract create(name: string, description?: string | null): Promise<Provider>;
  abstract update(
    id: number,
    name?: string,
    description?: string | null,
  ): Promise<Provider | null>;
  abstract delete(id: number): Promise<boolean>;
}
