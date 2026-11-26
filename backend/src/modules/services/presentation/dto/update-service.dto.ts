import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'ID nhà cung cấp sở hữu', example: 1 })
  @IsOptional()
  @IsInt({ message: 'providerId phải là số nguyên' })
  providerId?: number;

  @ApiPropertyOptional({
    description: 'Tên dịch vụ',
    example: 'Thuê sân cầu lông VIP Sáng',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Tên dịch vụ phải là chuỗi' })
  @MaxLength(150, { message: 'Tên dịch vụ không được vượt quá 150 ký tự' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Đơn giá niêm yết (VNĐ)',
    example: 120000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(0, { message: 'Đơn giá phải lớn hơn hoặc bằng 0' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết nội dung dịch vụ',
    example: 'Áp dụng khung giờ sáng với mức giá ưu đãi.',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả dịch vụ phải là chuỗi' })
  description?: string;
}
