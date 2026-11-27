import { ApiProperty } from '@nestjs/swagger';

export class SuccessMessageResponseDto {
  @ApiProperty({ description: 'Mã trạng thái HTTP', example: 200 })
  statusCode: number;

  @ApiProperty({
    description: 'Thông điệp phản hồi',
    example: 'Xóa lịch và booking liên kết thành công',
  })
  message: string;
}
