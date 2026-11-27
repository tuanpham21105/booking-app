import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Schedule } from '../../domain/entities/schedule.entity';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository.port';
import { ServiceRepository } from '../../../services/domain/repositories/service.repository.port';
import { CreateScheduleDto, UpdateScheduleDto } from '../dto';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  /**
   * Tạo khung giờ lịch mới cho dịch vụ (UC-07, BR-02, BR-05).
   * - Kiểm tra sự tồn tại của dịch vụ liên kết.
   * - Chặn tạo lịch cho ngày trong quá khứ.
   * - Kiểm tra chống trùng/chồng lấn khung giờ trong ngày theo quy tắc BR-05.
   */
  async create(dto: CreateScheduleDto): Promise<Schedule> {
    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new NotFoundException('Dịch vụ không tồn tại trong hệ thống');
    }

    if (dto.totalSlots <= 0) {
      throw new BadRequestException('Tổng số chỗ tối đa phải lớn hơn 0');
    }

    if (dto.duration <= 0) {
      throw new BadRequestException('Thời lượng phải lớn hơn 0');
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (dto.date < today) {
      throw new BadRequestException('Không thể tạo lịch cho ngày trong quá khứ');
    }

    // Thuật toán kiểm tra giao thoa/chồng lấn thời gian trong ngày (BR-05)
    await this.validateNoTimeOverlap(
      dto.serviceId,
      dto.date,
      dto.startTime,
      dto.duration,
    );

    const schedule = await this.scheduleRepository.create(
      dto.serviceId,
      dto.date,
      dto.startTime,
      dto.duration,
      dto.totalSlots,
    );

    schedule.service = service;
    return schedule;
  }

  /**
   * Lấy danh sách lịch phân trang, hỗ trợ lọc theo serviceId, date, khoảng ngày fromDate - toDate (UC-07).
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    serviceId?: number,
    date?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<[Schedule[], number]> {
    return await this.scheduleRepository.findAll(
      page,
      limit,
      serviceId,
      date,
      fromDate,
      toDate,
    );
  }

  /**
   * Xem chi tiết một lịch hẹn theo ID (UC-07).
   */
  async findById(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}`);
    }
    return schedule;
  }

  /**
   * Cập nhật thông tin lịch hẹn (UC-07, BR-02, BR-05).
   * - Kiểm tra tổng số chỗ mới không nhỏ hơn số chỗ đã đặt trước đó.
   * - Kiểm tra chống trùng/chồng lấn khung giờ mới nếu có cập nhật startTime hoặc duration.
   */
  async update(id: number, dto: UpdateScheduleDto): Promise<Schedule> {
    const existing = await this.findById(id);

    if (dto.totalSlots !== undefined) {
      if (dto.totalSlots <= 0) {
        throw new BadRequestException('Tổng số chỗ tối đa phải lớn hơn 0');
      }
      // Giai đoạn hiện tại chưa có bookings, bookedSlots = 0
      const bookedSlots = 0;
      if (dto.totalSlots < bookedSlots) {
        throw new BadRequestException(
          'Tổng số chỗ mới nhỏ hơn số chỗ đã đặt trước đó',
        );
      }
    }

    if (dto.duration !== undefined && dto.duration <= 0) {
      throw new BadRequestException('Thời lượng phải lớn hơn 0');
    }

    const newStartTime = dto.startTime ?? existing.startTime;
    const newDuration = dto.duration ?? existing.duration;

    if (dto.startTime !== undefined || dto.duration !== undefined) {
      await this.validateNoTimeOverlap(
        existing.serviceId,
        existing.date,
        newStartTime,
        newDuration,
        id,
      );
    }

    const updated = await this.scheduleRepository.update(
      id,
      dto.startTime,
      dto.duration,
      dto.totalSlots,
    );

    if (updated) {
      const reloaded = await this.scheduleRepository.findById(id);
      return reloaded ?? updated;
    }

    return updated!;
  }

  /**
   * Xóa lịch hẹn theo ID (UC-07, BR-04).
   */
  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.scheduleRepository.delete(id);
  }

  /**
   * Thuật toán kiểm tra giao thoa/chồng lấn thời gian trong ngày (BR-05):
   * Hai khung giờ [S1, E1] và [S2, E2] chồng lấn khi: max(S1, S2) < min(E1, E2)
   */
  private async validateNoTimeOverlap(
    serviceId: number,
    date: string,
    startTime: string,
    duration: number,
    excludeScheduleId?: number,
  ): Promise<void> {
    const existingSchedules =
      await this.scheduleRepository.findByServiceAndDate(serviceId, date);

    const s2 = this.parseTimeToMinutes(startTime);
    const e2 = s2 + duration * 60;

    for (const schedule of existingSchedules) {
      if (excludeScheduleId && schedule.id === excludeScheduleId) {
        continue;
      }

      const s1 = this.parseTimeToMinutes(schedule.startTime);
      const e1 = s1 + schedule.duration * 60;

      if (Math.max(s1, s2) < Math.min(e1, e2)) {
        throw new ConflictException(
          'Khung giờ bị trùng hoặc chồng lấn với lịch khác của cùng dịch vụ trong ngày',
        );
      }
    }
  }

  /**
   * Chuyển đổi định dạng giờ 'HH:mm:ss' hoặc 'HH:mm' sang số phút tính từ 00:00.
   */
  private parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
  }
}
