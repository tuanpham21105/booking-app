import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Tổng số bản ghi thỏa mãn điều kiện', example: 25 })
  total: number;

  @ApiProperty({ description: 'Số thứ tự trang hiện tại', example: 1 })
  page: number;

  @ApiProperty({ description: 'Số bản ghi trên mỗi trang', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Có trang tiếp theo hay không', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Có trang phía trước hay không', example: false })
  hasPreviousPage: boolean;
}

export class ProviderListItemResponseDto {
  @ApiProperty({ description: 'ID nhà cung cấp', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Trung Tâm Thể Thao Pegasus',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả thông tin giới thiệu nhà cung cấp',
    example: 'Cung cấp hệ thống sân thể thao',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Số lượng dịch vụ trực thuộc',
    example: 0,
    default: 0,
  })
  servicesCount: number;

  @ApiPropertyOptional({
    description: 'Thời điểm tạo bản ghi',
    example: '2026-11-24T08:00:00.000Z',
  })
  createdAt?: Date;
}

export class ProviderPaginationResponseDto {
  @ApiProperty({
    description: 'Danh sách nhà cung cấp',
    type: [ProviderListItemResponseDto],
  })
  data: ProviderListItemResponseDto[];

  @ApiProperty({
    description: 'Siêu dữ liệu phân trang',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
