import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProviderDto {
  @ApiPropertyOptional({
    description: 'Tên nhà cung cấp cập nhật (tối đa 150 ký tự, không trùng lặp)',
    example: 'Trung Tâm Thể Thao Pegasus Premium',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  @MaxLength(150, { message: 'Tên nhà cung cấp tối đa 150 ký tự' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả thông tin nhà cung cấp cập nhật',
    example: 'Cung cấp hệ thống sân cầu lông chuẩn BWF và phòng gym cao cấp.',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}
