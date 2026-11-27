import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu khung giờ mới (HH:mm:ss hoặc HH:mm)',
    example: '08:30:00',
  })
  @IsOptional()
  @IsString({ message: 'startTime phải là chuỗi' })
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'startTime phải có định dạng HH:mm:ss hoặc HH:mm',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Khoảng thời gian diễn ra mới (giờ)',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'duration phải là số nguyên' })
  @Min(1, { message: 'duration phải lớn hơn 0' })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Tổng số chỗ tối đa mới',
    example: 6,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'totalSlots phải là số nguyên' })
  @Min(1, { message: 'totalSlots phải lớn hơn 0' })
  totalSlots?: number;
}
