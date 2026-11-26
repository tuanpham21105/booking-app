import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderServiceItemDto {
  @ApiProperty({ description: 'ID dịch vụ', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tên dịch vụ', example: 'Thuê sân cầu lông VIP' })
  name: string;

  @ApiProperty({ description: 'Đơn giá niêm yết (VNĐ)', example: 150000 })
  price: number;
}

export class ProviderDetailResponseDto {
  @ApiProperty({ description: 'ID nhà cung cấp', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Trung Tâm Thể Thao Pegasus',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả thông tin giới thiệu nhà cung cấp',
    example: 'Cung cấp hệ thống sân cầu lông và tennis chuẩn quốc tế.',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Thời điểm tạo bản ghi',
    example: '2026-11-24T08:00:00.000Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Thời điểm cập nhật gần nhất',
    example: '2026-11-24T08:00:00.000Z',
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Danh mục dịch vụ trực thuộc nhà cung cấp',
    type: [ProviderServiceItemDto],
    default: [],
  })
  services: ProviderServiceItemDto[];
}
