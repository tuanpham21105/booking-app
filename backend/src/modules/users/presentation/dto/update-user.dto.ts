import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Họ và tên người dùng',
    example: 'Trần Thị Nhân Viên Cập Nhật',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Họ và tên tối đa 100 ký tự' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ email mới',
    example: 'staff_new@bookingapp.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Vai trò người dùng (STAFF hoặc CUSTOMER, cấm ADMIN)',
    enum: UserRole,
    example: UserRole.STAFF,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;
}
