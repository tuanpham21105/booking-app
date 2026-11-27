import { Schedule } from '../entities/schedule.entity';

/**
 * Port trừu tượng định nghĩa các hành vi thao tác dữ liệu của Schedule Entity.
 * Tầng Application chỉ phụ thuộc vào Port này, tuân thủ nguyên tắc Dependency Inversion (DIP).
 */
export abstract class ScheduleRepository {
  abstract findById(id: number): Promise<Schedule | null>;
  abstract findAll(
    page?: number,
    limit?: number,
    serviceId?: number,
    date?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<[Schedule[], number]>;
  abstract findByServiceAndDate(
    serviceId: number,
    date: string,
  ): Promise<Schedule[]>;
  abstract create(
    serviceId: number,
    date: string,
    startTime: string,
    duration: number,
    totalSlots: number,
  ): Promise<Schedule>;
  abstract update(
    id: number,
    startTime?: string,
    duration?: number,
    totalSlots?: number,
  ): Promise<Schedule | null>;
  abstract delete(id: number): Promise<boolean>;
}
