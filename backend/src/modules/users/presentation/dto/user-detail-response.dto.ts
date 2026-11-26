import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../domain/enums/user-role.enum';

export class UserDetailResponseDto {
  @ApiProperty({ description: 'ID người dùng', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Họ và tên người dùng',
    example: 'Trần Thị Nhân Viên',
  })
  fullName: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: 'staff1@bookingapp.com',
  })
  email: string;

  @ApiProperty({
    description: 'Vai trò người dùng',
    enum: UserRole,
    example: UserRole.STAFF,
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Thời điểm tạo tài khoản',
    example: '2026-11-24T10:00:00.000Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Thời điểm cập nhật gần nhất',
    example: '2026-11-24T10:00:00.000Z',
  })
  updatedAt?: Date;
}
