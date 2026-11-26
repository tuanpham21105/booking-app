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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Can } from '@nestjs/authorization';
import { RolePolicy } from '../../../../common';
import { UserRole } from '../../../users';
import { ProvidersService } from '../../application/services/providers.service';
import { Provider } from '../../domain/entities/provider.entity';
import {
  CreateProviderDto,
  ProviderDetailResponseDto,
  ProviderPaginationResponseDto,
  ProviderQueryDto,
  SuccessMessageResponseDto,
  UpdateProviderDto,
} from '../dto';

@ApiBearerAuth()
@ApiTags('Providers')
@Controller('providers')
@Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Xem danh sách nhà cung cấp phân trang, tìm kiếm theo tên (UC-05).
   */
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách nhà cung cấp phân trang, tìm kiếm theo tên',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách nhà cung cấp kèm siêu dữ liệu phân trang',
    type: ProviderPaginationResponseDto,
  })
  async findAll(@Query() query: ProviderQueryDto): Promise<ProviderPaginationResponseDto> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const [providers, total] = await this.providersService.findAll(
      page,
      limit,
      query.search,
    );
    const totalPages = Math.ceil(total / limit);

    return {
      data: providers.map((provider) => ({
        id: provider.id!,
        name: provider.name,
        description: provider.description ?? null,
        servicesCount: 0,
        createdAt: provider.createdAt,
      })),
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
   * Xem thông tin chi tiết một nhà cung cấp theo ID (UC-05).
   */
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết thông tin nhà cung cấp theo ID' })
  @ApiParam({ name: 'id', description: 'ID nhà cung cấp', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết nhà cung cấp',
    type: ProviderDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy nhà cung cấp' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ProviderDetailResponseDto> {
    const provider = await this.providersService.findById(id);
    return this.toProviderDetailResponse(provider);
  }

  /**
   * Thêm mới nhà cung cấp (UC-05).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm mới nhà cung cấp dịch vụ' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo mới nhà cung cấp thành công',
    type: ProviderDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên nhà cung cấp đã tồn tại trong hệ thống',
  })
  async create(@Body() dto: CreateProviderDto): Promise<ProviderDetailResponseDto> {
    const created = await this.providersService.create(dto);
    return this.toProviderDetailResponse(created);
  }

  /**
   * Cập nhật thông tin nhà cung cấp (UC-05).
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
  @ApiParam({ name: 'id', description: 'ID nhà cung cấp', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông tin nhà cung cấp thành công',
    type: ProviderDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên nhà cung cấp bị trùng với bản ghi khác',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy nhà cung cấp' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProviderDto,
  ): Promise<ProviderDetailResponseDto> {
    const updated = await this.providersService.update(id, dto);
    return this.toProviderDetailResponse(updated);
  }

  /**
   * Xóa nhà cung cấp (UC-05).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa nhà cung cấp theo ID' })
  @ApiParam({ name: 'id', description: 'ID nhà cung cấp cần xóa', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa nhà cung cấp thành công',
    type: SuccessMessageResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy nhà cung cấp' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<SuccessMessageResponseDto> {
    await this.providersService.delete(id);
    return {
      success: true,
      message: 'Xóa nhà cung cấp thành công',
    };
  }

  private toProviderDetailResponse(provider: Provider): ProviderDetailResponseDto {
    return {
      id: provider.id!,
      name: provider.name,
      description: provider.description ?? null,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
      services: [],
    };
  }
}
