import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../../application/services/health.service';
import { HealthCheckResponseDto } from '../dto/health-check-response.dto';
import { Public } from '@nestjs/authentication';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của hệ thống' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hệ thống hoạt động bình thường',
    type: HealthCheckResponseDto,
  })
  async check(): Promise<HealthCheckResponseDto> {
    return this.healthService.checkHealth();
  }
}
