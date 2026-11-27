import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID dịch vụ', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'serviceId phải là số nguyên' })
  @Min(1, { message: 'serviceId phải lớn hơn 0' })
  @IsNotEmpty({ message: 'serviceId không được để trống' })
  serviceId: number;

  @ApiProperty({
    description: 'Ngày diễn ra lịch hẹn (YYYY-MM-DD)',
    example: '2026-11-25',
  })
  @IsDateString({}, { message: 'date phải có định dạng YYYY-MM-DD' })
  @IsNotEmpty({ message: 'date không được để trống' })
  date: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu khung giờ (HH:mm:ss hoặc HH:mm)',
    example: '08:00:00',
  })
  @IsString({ message: 'startTime phải là chuỗi' })
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'startTime phải có định dạng HH:mm:ss hoặc HH:mm',
  })
  @IsNotEmpty({ message: 'startTime không được để trống' })
  startTime: string;

  @ApiProperty({
    description: 'Khoảng thời gian diễn ra (giờ)',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'duration phải là số nguyên' })
  @Min(1, { message: 'duration phải lớn hơn 0' })
  @IsNotEmpty({ message: 'duration không được để trống' })
  duration: number;

  @ApiProperty({
    description: 'Tổng số chỗ tối đa trong khung giờ',
    example: 5,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'totalSlots phải là số nguyên' })
  @Min(1, { message: 'totalSlots phải lớn hơn 0' })
  @IsNotEmpty({ message: 'totalSlots không được để trống' })
  totalSlots: number;
}
