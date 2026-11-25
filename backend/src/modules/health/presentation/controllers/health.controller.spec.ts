import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from '../../application/services/health.service';
import { HealthCheckResponseDto } from '../dto/health-check-response.dto';

class MockHealthService {
  called = false;
  response: HealthCheckResponseDto = {
    status: 'ok',
    timestamp: '2026-11-25T07:15:00.000Z',
    database: 'connected',
  };

  async checkHealth(): Promise<HealthCheckResponseDto> {
    this.called = true;
    return this.response;
  }
}

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthService: MockHealthService;

  beforeEach(async () => {
    mockHealthService = new MockHealthService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check response from healthService', async () => {
    const result = await controller.check();

    expect(mockHealthService.called).toBe(true);
    expect(result).toEqual({
      status: 'ok',
      timestamp: '2026-11-25T07:15:00.000Z',
      database: 'connected',
    });
  });
});
