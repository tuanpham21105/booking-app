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
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { RolePolicy } from '../../../../common';
import { UserRole } from '../../../users';
import { SchedulesService } from '../../application/services/schedules.service';
import {
  CreateScheduleDto,
  ScheduleDetailResponseDto,
  SchedulePaginationResponseDto,
  ScheduleQueryDto,
  SuccessMessageResponseDto,
  UpdateScheduleDto,
} from '../dto';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * Xem & Tìm kiếm danh sách lịch hẹn phân trang (UC-04, UC-07).
   * Quyền hạn: Public (Khách vãng lai, Customer, Staff, Admin) theo API Contract v1.0.1.
   */
  @Get()
  @ApiOperation({
    summary: 'Xem danh sách lịch hẹn (Public)',
    description:
      'Lấy danh sách lịch hẹn kèm thông tin số chỗ còn trống, hỗ trợ phân trang và lọc theo dịch vụ, ngày cụ thể hoặc khoảng ngày.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách lịch hẹn kèm phân trang và thông tin chỗ trống',
    type: SchedulePaginationResponseDto,
  })
  @Public()
  async findAll(
    @Query() query: ScheduleQueryDto,
  ): Promise<SchedulePaginationResponseDto> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const [schedules, total] = await this.schedulesService.findAll(
      page,
      limit,
      query.serviceId,
      query.date,
      query.fromDate,
      query.toDate,
    );

    return SchedulePaginationResponseDto.from(schedules, total, page, limit);
  }

  /**
   * Xem chi tiết một lịch hẹn theo ID (UC-04, UC-07).
   * Quyền hạn: Public (Khách vãng lai, Customer, Staff, Admin) theo API Contract v1.0.1.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết lịch hẹn (Public)',
    description:
      'Lấy thông tin chi tiết của một lịch hẹn gồm thời gian bắt đầu, thời lượng, tổng số chỗ, số chỗ đã đặt và số chỗ còn trống.',
  })
  @ApiParam({ name: 'id', description: 'ID lịch hẹn', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết lịch hẹn',
    type: ScheduleDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lịch hẹn',
  })
  @Public()
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ScheduleDetailResponseDto> {
    const schedule = await this.schedulesService.findById(id);
    return ScheduleDetailResponseDto.fromEntity(schedule);
  }

  /**
   * Tạo mới lịch hẹn cho dịch vụ (UC-07, BR-02, BR-05).
   * Quyền hạn: Staff, Admin.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới lịch hẹn (Staff/Admin)',
    description:
      'Tạo khung giờ lịch hẹn mới cho dịch vụ, tự động kiểm tra chống trùng/chồng lấn khung giờ trong ngày theo quy tắc BR-05.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo lịch hẹn mới thành công',
    type: ScheduleDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ hoặc ngày trong quá khứ',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Dịch vụ liên kết không tồn tại',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Khung giờ bị trùng hoặc chồng lấn với lịch khác của cùng dịch vụ trong ngày (BR-05)',
  })
  @ApiBearerAuth()
  @Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
  async create(
    @Body() dto: CreateScheduleDto,
  ): Promise<ScheduleDetailResponseDto> {
    const schedule = await this.schedulesService.create(dto);
    return ScheduleDetailResponseDto.fromEntity(schedule);
  }

  /**
   * Cập nhật thông tin lịch hẹn (UC-07, BR-02, BR-05).
   * Quyền hạn: Staff, Admin.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật lịch hẹn (Staff/Admin)',
    description:
      'Cập nhật khung giờ hoặc số chỗ của lịch hẹn, tự động kiểm tra chống chồng lấn thời gian nếu thay đổi giờ.',
  })
  @ApiParam({ name: 'id', description: 'ID lịch hẹn cần sửa', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật lịch hẹn thành công',
    type: ScheduleDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ hoặc tổng số chỗ mới nhỏ hơn số chỗ đã đặt',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lịch hẹn',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Khung giờ mới bị chồng lấn với lịch khác trong ngày (BR-05)',
  })
  @ApiBearerAuth()
  @Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
  ): Promise<ScheduleDetailResponseDto> {
    const schedule = await this.schedulesService.update(id, dto);
    return ScheduleDetailResponseDto.fromEntity(schedule);
  }

  /**
   * Xóa lịch hẹn theo ID (UC-07, BR-04).
   * Quyền hạn: Staff, Admin.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa lịch hẹn (Staff/Admin)',
    description:
      'Xóa lịch hẹn và tự động dọn dẹp các booking liên kết (cascade delete).',
  })
  @ApiParam({ name: 'id', description: 'ID lịch hẹn cần xóa', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa lịch hẹn thành công',
    type: SuccessMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lịch hẹn cần xóa',
  })
  @ApiBearerAuth()
  @Can(RolePolicy, 'hasRole', () => [[UserRole.STAFF, UserRole.ADMIN]])
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessMessageResponseDto> {
    await this.schedulesService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa lịch và booking liên kết thành công',
    };
  }
}
