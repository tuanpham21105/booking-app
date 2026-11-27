import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Schedule } from '../../domain/entities/schedule.entity';

export class ScheduleDetailResponseDto {
  @ApiProperty({ description: 'ID lịch hẹn', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID dịch vụ', example: 1 })
  serviceId: number;

  @ApiPropertyOptional({
    description: 'Tên dịch vụ',
    example: 'Thuê sân cầu lông VIP',
  })
  serviceName?: string;

  @ApiProperty({ description: 'Ngày diễn ra lịch hẹn', example: '2026-11-25' })
  date: string;

  @ApiProperty({ description: 'Thời gian bắt đầu khung giờ', example: '08:00:00' })
  startTime: string;

  @ApiProperty({ description: 'Thời lượng diễn ra (giờ)', example: 2 })
  duration: number;

  @ApiProperty({ description: 'Tổng số chỗ tối đa trong khung giờ', example: 5 })
  totalSlots: number;

  @ApiProperty({ description: 'Số chỗ đã được đặt', example: 0 })
  bookedSlots: number;

  @ApiProperty({ description: 'Số chỗ còn trống', example: 5 })
  availableSlots: number;

  @ApiPropertyOptional({ description: 'Thời điểm tạo bản ghi' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Thời điểm cập nhật gần nhất' })
  updatedAt?: Date;

  static fromEntity(schedule: Schedule): ScheduleDetailResponseDto {
    const bookedSlots = 0;
    const availableSlots = Math.max(0, schedule.totalSlots - bookedSlots);

    const dto = new ScheduleDetailResponseDto();
    dto.id = schedule.id!;
    dto.serviceId = schedule.serviceId;
    dto.serviceName = schedule.service?.name;
    dto.date = schedule.date;
    dto.startTime = schedule.startTime;
    dto.duration = schedule.duration;
    dto.totalSlots = schedule.totalSlots;
    dto.bookedSlots = bookedSlots;
    dto.availableSlots = availableSlots;
    dto.createdAt = schedule.createdAt;
    dto.updatedAt = schedule.updatedAt;
    return dto;
  }
}
