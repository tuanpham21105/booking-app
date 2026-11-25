import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../../application/services/health.service';
import { HealthCheckResponseDto } from '../dto/health-check-response.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthCheckResponseDto> {
    return this.healthService.checkHealth();
  }
}
