import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

class MockDataSource {
  isInitialized = true;
  queryCalls: string[] = [];
  shouldFail = false;

  async query(queryString: string): Promise<unknown> {
    this.queryCalls.push(queryString);
    if (this.shouldFail) {
      throw new Error('Connection failed');
    }
    return [{ '?column?': 1 }];
  }
}

describe('HealthService', () => {
  let service: HealthService;
  let mockDataSource: MockDataSource;

  beforeEach(async () => {
    mockDataSource = new MockDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health status ok when database is initialized and query succeeds', async () => {
    const result = await service.checkHealth();

    expect(mockDataSource.queryCalls).toEqual(['SELECT 1']);
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(typeof result.timestamp).toBe('string');
    expect(new Date(result.timestamp).getTime()).not.toBeNaN();
  });

  it('should throw ServiceUnavailableException when database is not initialized', async () => {
    mockDataSource.isInitialized = false;

    await expect(service.checkHealth()).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(service.checkHealth()).rejects.toThrow(
      'Không thể kết nối đến cơ sở dữ liệu',
    );
  });

  it('should throw ServiceUnavailableException when query fails', async () => {
    mockDataSource.shouldFail = true;

    await expect(service.checkHealth()).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(service.checkHealth()).rejects.toThrow(
      'Không thể kết nối đến cơ sở dữ liệu',
    );
  });
});
