import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class UserQueryDto {
  @ApiPropertyOptional({
    description: 'Số trang hiện tại (bắt đầu từ 1)',
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
    description: 'Từ khóa tìm kiếm theo họ tên hoặc email',
    example: 'nguyen',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo vai trò tài khoản',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
