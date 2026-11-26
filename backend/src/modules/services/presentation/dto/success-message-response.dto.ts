import { ApiProperty } from '@nestjs/swagger';

export class SuccessMessageResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Thông điệp phản hồi',
    example: 'Xóa dịch vụ thành công',
  })
  message: string;
}
