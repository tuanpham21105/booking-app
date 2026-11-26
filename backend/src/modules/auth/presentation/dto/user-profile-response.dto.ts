import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../users/domain/enums/user-role.enum';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'ID người dùng', example: 1 })
  id: number;

  @ApiProperty({ description: 'Họ và tên người dùng', example: 'Quản Trị Viên' })
  fullName: string;

  @ApiProperty({ description: 'Địa chỉ email người dùng', example: 'admin@bookingapp.com' })
  email: string;

  @ApiProperty({ description: 'Vai trò người dùng', enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty({ description: 'Thời điểm tạo tài khoản', example: '2026-11-20T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời điểm cập nhật tài khoản gần nhất', example: '2026-11-24T12:00:00.000Z' })
  updatedAt: Date;
}
