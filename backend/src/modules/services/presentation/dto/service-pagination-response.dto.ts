import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceListItemDto {
  @ApiProperty({ description: 'ID dịch vụ', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID nhà cung cấp', example: 1 })
  providerId: number;

  @ApiPropertyOptional({
    description: 'Tên nhà cung cấp',
    example: 'Trung Tâm Thể Thao Pegasus',
  })
  providerName?: string;

  @ApiProperty({ description: 'Tên dịch vụ', example: 'Thuê sân cầu lông VIP' })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết nội dung dịch vụ' })
  description?: string | null;

  @ApiProperty({ description: 'Đơn giá niêm yết (VNĐ)', example: 150000 })
  price: number;

  @ApiPropertyOptional({ description: 'Thời điểm tạo bản ghi' })
  createdAt?: Date;
}

export class ServicePaginationMetaDto {
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

export class ServicePaginationResponseDto {
  @ApiProperty({ description: 'Danh sách dịch vụ', type: [ServiceListItemDto] })
  data: ServiceListItemDto[];

  @ApiProperty({
    description: 'Thông tin phân trang',
    type: ServicePaginationMetaDto,
  })
  meta: ServicePaginationMetaDto;
}
