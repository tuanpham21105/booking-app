import { ApiProperty } from '@nestjs/swagger';
import { UserDetailResponseDto } from './user-detail-response.dto';

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

export class UserPaginationResponseDto {
  @ApiProperty({
    description: 'Danh sách người dùng',
    type: [UserDetailResponseDto],
  })
  data: UserDetailResponseDto[];

  @ApiProperty({
    description: 'Siêu dữ liệu phân trang',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
