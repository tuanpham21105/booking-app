import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Schedule } from '../../domain/entities/schedule.entity';

export class ScheduleListItemDto {
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
}

export class SchedulePaginationMetaDto {
  @ApiProperty({ description: 'Tổng số bản ghi', example: 1 })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page: number;

  @ApiProperty({ description: 'Số lượng bản ghi trên một trang', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang', example: 1 })
  totalPages: number;

  @ApiProperty({ description: 'Có trang tiếp theo hay không', example: false })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Có trang trước đó hay không', example: false })
  hasPreviousPage: boolean;
}

export class SchedulePaginationResponseDto {
  @ApiProperty({ description: 'Danh sách lịch hẹn', type: [ScheduleListItemDto] })
  data: ScheduleListItemDto[];

  @ApiProperty({
    description: 'Thông tin phân trang',
    type: SchedulePaginationMetaDto,
  })
  meta: SchedulePaginationMetaDto;

  static from(
    schedules: Schedule[],
    total: number,
    page: number,
    limit: number,
  ): SchedulePaginationResponseDto {
    const totalPages = Math.ceil(total / limit) || 1;
    const bookedSlots = 0;

    return {
      data: schedules.map((s) => ({
        id: s.id!,
        serviceId: s.serviceId,
        serviceName: s.service?.name,
        date: s.date,
        startTime: s.startTime,
        duration: s.duration,
        totalSlots: s.totalSlots,
        bookedSlots,
        availableSlots: Math.max(0, s.totalSlots - bookedSlots),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
