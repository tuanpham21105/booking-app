import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../users/domain/enums/user-role.enum';

export class LoginUserDto {
  @ApiProperty({ description: 'ID người dùng', example: 1 })
  id: number;

  @ApiProperty({ description: 'Họ và tên', example: 'Quản Trị Viên' })
  fullName: string;

  @ApiProperty({ description: 'Địa chỉ email', example: 'admin@bookingapp.com' })
  email: string;

  @ApiProperty({ description: 'Vai trò tài khoản', enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Thông tin người dùng đăng nhập', type: LoginUserDto })
  user: LoginUserDto;

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
