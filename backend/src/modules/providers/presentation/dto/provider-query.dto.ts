import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ProviderQueryDto {
  @ApiPropertyOptional({
    description: 'Số thứ tự trang hiện tại (bắt đầu từ 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description:
      'Số bản ghi trên mỗi trang (mặc định 10, tối đa 100; nếu vượt quá 100 sẽ tự động fallback về 100)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num > 100 ? 100 : num;
    }
    return value;
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tên nhà cung cấp',
    example: 'Pegasus',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
