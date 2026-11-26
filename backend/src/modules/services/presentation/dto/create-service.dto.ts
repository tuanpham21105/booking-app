import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'ID nhà cung cấp sở hữu', example: 1 })
  @IsInt({ message: 'providerId phải là số nguyên' })
  @IsNotEmpty({ message: 'providerId không được để trống' })
  providerId: number;

  @ApiProperty({
    description: 'Tên dịch vụ',
    example: 'Thuê sân cầu lông VIP',
    maxLength: 150,
  })
  @IsString({ message: 'Tên dịch vụ phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  @MaxLength(150, { message: 'Tên dịch vụ không được vượt quá 150 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Đơn giá niêm yết (VNĐ)',
    example: 150000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(0, { message: 'Đơn giá phải lớn hơn hoặc bằng 0' })
  price: number;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết nội dung dịch vụ',
    example: 'Sân trải thảm đạt tiêu chuẩn thi đấu quốc tế, đầy đủ ánh sáng.',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả dịch vụ phải là chuỗi' })
  description?: string;
}
