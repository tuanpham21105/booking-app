import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceProviderSummaryDto {
  @ApiProperty({ description: 'ID nhà cung cấp', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Trung Tâm Thể Thao Pegasus',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả nhà cung cấp',
    example: 'Cung cấp hệ thống sân cầu lông và tennis chuẩn quốc tế.',
  })
  description?: string | null;
}

export class ServiceDetailResponseDto {
  @ApiProperty({ description: 'ID dịch vụ', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID nhà cung cấp sở hữu', example: 1 })
  providerId: number;

  @ApiProperty({ description: 'Tên dịch vụ', example: 'Thuê sân cầu lông VIP' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết nội dung dịch vụ',
    example: 'Sân trải thảm đạt tiêu chuẩn thi đấu quốc tế.',
  })
  description?: string | null;

  @ApiProperty({ description: 'Đơn giá niêm yết (VNĐ)', example: 150000 })
  price: number;

  @ApiPropertyOptional({
    description: 'Thời điểm tạo bản ghi',
    example: '2026-11-24T08:30:00.000Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Thời điểm cập nhật gần nhất',
    example: '2026-11-24T08:30:00.000Z',
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Thông tin nhà cung cấp sở hữu',
    type: ServiceProviderSummaryDto,
  })
  provider?: ServiceProviderSummaryDto;

  @ApiProperty({
    description:
      'Danh sách các lịch hẹn còn trống sắp diễn ra (Giai đoạn 5 triển khai chi tiết)',
    type: [Object],
    default: [],
  })
  upcomingSchedules: unknown[];
}
