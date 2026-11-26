import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({
    description: 'Tên nhà cung cấp (duy nhất, không trùng lặp)',
    example: 'Trung Tâm Thể Thao Pegasus',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  @MaxLength(150, { message: 'Tên nhà cung cấp tối đa 150 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả thông tin giới thiệu về nhà cung cấp',
    example: 'Cung cấp hệ thống sân cầu lông và tennis chuẩn quốc tế.',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}
