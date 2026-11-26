import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn A',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Họ và tên tối đa 100 ký tự' })
  fullName: string;

  @ApiProperty({
    description: 'Địa chỉ email người dùng',
    example: 'nguyenvana@example.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(255, { message: 'Email tối đa 255 ký tự' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng ký (tối thiểu 6 ký tự)',
    example: 'Password123@',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  password: string;
}
