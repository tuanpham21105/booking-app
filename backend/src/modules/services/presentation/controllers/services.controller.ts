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
import { ServicesService } from '../../application/services/services.service';
import { Service } from '../../domain/entities/service.entity';
import {
  CreateServiceDto,
  ServiceDetailResponseDto,
  ServicePaginationResponseDto,
  ServiceQueryDto,
  SuccessMessageResponseDto,
  UpdateServiceDto,
} from '../dto';
import { Public } from '@nestjs/authentication';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Xem & Tìm kiếm danh sách dịch vụ phân trang (UC-04).
   * Quyền hạn: Public (Khách vãng lai, Customer, Staff, Admin).
   */
  @Get()
  @ApiOperation({
    summary: 'Xem và tìm kiếm danh sách dịch vụ (Public)',
    description:
      'Lấy danh sách dịch vụ phân trang, hỗ trợ tìm kiếm theo tên hoặc lọc theo ID nhà cung cấp.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách dịch vụ kèm thông tin nhà cung cấp và phân trang',
    type: ServicePaginationResponseDto,
  })
  @Public()
  async findAll(@Query() query: ServiceQueryDto): Promise<ServicePaginationResponseDto> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const [services, total] = await this.servicesService.findAll(
      page,
      limit,
      query.search,
      query.providerId,
    );
    const totalPages = Math.ceil(total / limit);

    return {
      data: services.map((service) => ({
        id: service.id!,
        providerId: service.providerId,
        providerName: service.provider?.name,
        name: service.name,
        description: service.description ?? null,
        price: Number(service.price),
        createdAt: service.createdAt,
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
   * Xem thông tin chi tiết một dịch vụ theo ID (UC-04).
   * Quyền hạn: Public.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết dịch vụ theo ID (Public)',
    description:
      'Xem thông tin dịch vụ, nhà cung cấp kèm danh sách lịch sắp tới có tính sẵn số chỗ còn trống.',
  })
  @ApiParam({ name: 'id', description: 'ID dịch vụ cần xem', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết dịch vụ',
    type: ServiceDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy dịch vụ' })
  @Public()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ServiceDetailResponseDto> {
    const service = await this.servicesService.findById(id);
    return this.toServiceDetailResponse(service);
  }

  /**
   * Tạo mới dịch vụ cho nhà cung cấp (UC-06).
   * Quyền hạn: Staff, Admin.
   */
  @Post()
  @ApiBearerAuth()
  @Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới dịch vụ cho nhà cung cấp (Staff, Admin)',
    description: 'Tạo một dịch vụ mới trực thuộc một nhà cung cấp trong hệ thống.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo dịch vụ thành công',
    type: ServiceDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Nhà cung cấp không tồn tại' })
  async create(@Body() dto: CreateServiceDto): Promise<ServiceDetailResponseDto> {
    const service = await this.servicesService.create(dto);
    return this.toServiceDetailResponse(service);
  }

  /**
   * Cập nhật thông tin dịch vụ (UC-06).
   * Quyền hạn: Staff, Admin.
   */
  @Patch(':id')
  @ApiBearerAuth()
  @Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
  @ApiOperation({
    summary: 'Cập nhật thông tin dịch vụ (Staff, Admin)',
    description: 'Cập nhật tên, mô tả, giá niêm yết hoặc nhà cung cấp của dịch vụ.',
  })
  @ApiParam({ name: 'id', description: 'ID dịch vụ cần cập nhật', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật dịch vụ thành công',
    type: ServiceDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Dịch vụ hoặc nhà cung cấp không tồn tại' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceDetailResponseDto> {
    const service = await this.servicesService.update(id, dto);
    return this.toServiceDetailResponse(service);
  }

  /**
   * Xóa dịch vụ theo ID (UC-06).
   * Quyền hạn: Staff, Admin.
   */
  @Delete(':id')
  @ApiBearerAuth()
  @Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
  @ApiOperation({
    summary: 'Xóa dịch vụ theo ID (Staff, Admin)',
    description: 'Xóa dịch vụ và cascade xóa các lịch hẹn và booking liên quan.',
  })
  @ApiParam({ name: 'id', description: 'ID dịch vụ cần xóa', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa dịch vụ thành công',
    type: SuccessMessageResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy dịch vụ' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<SuccessMessageResponseDto> {
    await this.servicesService.delete(id);
    return {
      success: true,
      message: 'Xóa dịch vụ thành công',
    };
  }

  private toServiceDetailResponse(service: Service): ServiceDetailResponseDto {
    return {
      id: service.id!,
      providerId: service.providerId,
      name: service.name,
      description: service.description ?? null,
      price: Number(service.price),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      provider: service.provider
        ? {
            id: service.provider.id!,
            name: service.provider.name,
            description: service.provider.description ?? null,
          }
        : undefined,
      upcomingSchedules: [],
    };
  }
}
