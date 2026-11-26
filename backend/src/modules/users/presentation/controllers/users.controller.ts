import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserDto,
  ResetPasswordDto,
  SuccessMessageResponseDto,
  UpdateUserDto,
  UserDetailResponseDto,
  UserPaginationResponseDto,
  UserQueryDto,
} from '../dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Xem danh sách tài khoản phân trang, tìm kiếm và lọc theo vai trò (UC-03).
   */
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tài khoản phân trang, tìm kiếm và lọc theo vai trò',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách tài khoản kèm siêu dữ liệu phân trang',
    type: UserPaginationResponseDto,
  })
  async findAll(@Query() query: UserQueryDto): Promise<UserPaginationResponseDto> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const [users, total] = await this.usersService.findAll(
      page,
      limit,
      query.search,
      query.role,
    );
    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => this.toUserDetailResponse(user)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Xem thông tin chi tiết một tài khoản theo ID (UC-03).
   */
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết thông tin tài khoản theo ID' })
  @ApiParam({ name: 'id', description: 'ID tài khoản người dùng', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết người dùng',
    type: UserDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy người dùng' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserDetailResponseDto> {
    const user = await this.usersService.findById(id);
    return this.toUserDetailResponse(user);
  }

  /**
   * Tạo tài khoản mới (Customer hoặc Staff) (UC-03, BR-01).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mới tài khoản người dùng (Customer hoặc Staff)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo tài khoản thành công',
    type: UserDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc cố tình tạo vai trò Admin (BR-01)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email đã tồn tại trong hệ thống',
  })
  async create(@Body() dto: CreateUserDto): Promise<UserDetailResponseDto> {
    const user = await this.usersService.create(dto);
    return this.toUserDetailResponse(user);
  }

  /**
   * Chỉnh sửa thông tin tài khoản (UC-03, BR-01).
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Chỉnh sửa thông tin tài khoản' })
  @ApiParam({ name: 'id', description: 'ID tài khoản người dùng', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật tài khoản thành công',
    type: UserDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc vi phạm quy tắc Admin (BR-01)',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy người dùng' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email mới đã tồn tại trong hệ thống',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDetailResponseDto> {
    const user = await this.usersService.update(id, dto);
    return this.toUserDetailResponse(user);
  }

  /**
   * Đặt lại mật khẩu tài khoản (UC-03, BR-01).
   */
  @Patch(':id/reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu cho tài khoản' })
  @ApiParam({ name: 'id', description: 'ID tài khoản người dùng', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đặt lại mật khẩu thành công',
    type: SuccessMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không được phép đặt lại mật khẩu cho tài khoản Admin (BR-01)',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy người dùng' })
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ): Promise<SuccessMessageResponseDto> {
    await this.usersService.resetPassword(id, dto);
    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    };
  }

  /**
   * Xóa tài khoản người dùng (UC-03, BR-01).
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài khoản người dùng' })
  @ApiParam({ name: 'id', description: 'ID tài khoản người dùng', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa tài khoản thành công',
    type: SuccessMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không được phép xóa tài khoản Admin (BR-01)',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy người dùng' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<SuccessMessageResponseDto> {
    await this.usersService.delete(id);
    return {
      success: true,
      message: 'Xóa tài khoản thành công',
    };
  }

  private toUserDetailResponse(user: User): UserDetailResponseDto {
    return {
      id: user.id!,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
