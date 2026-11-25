import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthCheckResponseDto } from '../../presentation/dto';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async checkHealth(): Promise<HealthCheckResponseDto> {
    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('Database is not initialized');
      }

      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException('Không thể kết nối đến cơ sở dữ liệu');
    }
  }
}
