import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ScheduleQueryDto {
  @ApiPropertyOptional({
    description: 'Số trang hiện tại (bắt đầu từ 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  @Max(100, { message: 'limit tối đa là 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo ID dịch vụ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'serviceId phải là số nguyên' })
  serviceId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ngày cụ thể (YYYY-MM-DD)',
    example: '2026-11-25',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date phải có định dạng YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({
    description: 'Lọc từ ngày (YYYY-MM-DD)',
    example: '2026-11-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'fromDate phải có định dạng YYYY-MM-DD' })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Lọc đến ngày (YYYY-MM-DD)',
    example: '2026-11-30',
  })
  @IsOptional()
  @IsDateString({}, { message: 'toDate phải có định dạng YYYY-MM-DD' })
  toDate?: string;
}
