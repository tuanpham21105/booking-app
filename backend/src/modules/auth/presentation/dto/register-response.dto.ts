import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../users/domain/enums/user-role.enum';

export class RegisteredUserDto {
  @ApiProperty({ description: 'ID người dùng', example: 2 })
  id: number;

  @ApiProperty({ description: 'Họ và tên', example: 'Nguyễn Văn A' })
  fullName: string;

  @ApiProperty({ description: 'Địa chỉ email', example: 'nguyenvana@example.com' })
  email: string;

  @ApiProperty({ description: 'Vai trò người dùng', enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;

  @ApiProperty({ description: 'Thời điểm tạo tài khoản', example: '2026-11-24T16:00:00.000Z' })
  createdAt: Date;
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'Thông tin tài khoản vừa đăng ký', type: RegisteredUserDto })
  user: RegisteredUserDto;

  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
