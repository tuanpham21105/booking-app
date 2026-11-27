import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from '../../application/services/schedules.service';
import { Schedule } from '../../domain/entities/schedule.entity';
import { Service } from '../../../services/domain/entities/service.entity';
import {
  CreateScheduleDto,
  ScheduleQueryDto,
  UpdateScheduleDto,
} from '../dto';

class MockSchedulesService {
  schedules: Schedule[] = [];
  lastFindAllParams?: {
    page?: number;
    limit?: number;
    serviceId?: number;
    date?: string;
    fromDate?: string;
    toDate?: string;
  };
  lastFindByIdParam?: number;
  lastCreateDto?: CreateScheduleDto;
  lastUpdateParam?: { id: number; dto: UpdateScheduleDto };
  lastDeleteParam?: number;

  async findAll(
    page: number = 1,
    limit: number = 10,
    serviceId?: number,
    date?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<[Schedule[], number]> {
    this.lastFindAllParams = { page, limit, serviceId, date, fromDate, toDate };
    return [this.schedules, this.schedules.length];
  }

  async findById(id: number): Promise<Schedule> {
    this.lastFindByIdParam = id;
    const found = this.schedules.find((s) => s.id === id);
    if (!found) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}`);
    }
    return found;
  }

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    this.lastCreateDto = dto;
    const schedule = new Schedule(
      dto.serviceId,
      dto.date,
      dto.startTime,
      dto.duration,
      dto.totalSlots,
      this.schedules.length + 1,
      new Date(),
      new Date(),
      new Service(1, 'Sân cầu lông VIP', 100000, null, dto.serviceId),
    );
    this.schedules.push(schedule);
    return schedule;
  }

  async update(id: number, dto: UpdateScheduleDto): Promise<Schedule> {
    this.lastUpdateParam = { id, dto };
    const schedule = await this.findById(id);
    if (dto.startTime !== undefined) schedule.startTime = dto.startTime;
    if (dto.duration !== undefined) schedule.duration = dto.duration;
    if (dto.totalSlots !== undefined) schedule.totalSlots = dto.totalSlots;
    return schedule;
  }

  async delete(id: number): Promise<void> {
    this.lastDeleteParam = id;
    await this.findById(id);
    const idx = this.schedules.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.schedules.splice(idx, 1);
    }
  }
}

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let mockService: MockSchedulesService;

  beforeEach(async () => {
    mockService = new MockSchedulesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [
        {
          provide: SchedulesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SchedulesController>(SchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated schedules response', async () => {
      const schedule = new Schedule(
        1,
        '2026-11-28',
        '08:00:00',
        2,
        10,
        1,
        new Date(),
        new Date(),
        new Service(1, 'Sân VIP', 150000, null, 1),
      );
      mockService.schedules = [schedule];

      const query: ScheduleQueryDto = {
        page: 1,
        limit: 10,
        serviceId: 1,
        date: '2026-11-28',
      };

      const result = await controller.findAll(query);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].serviceName).toBe('Sân VIP');
      expect(result.data[0].bookedSlots).toBe(0);
      expect(result.data[0].availableSlots).toBe(10);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should use default page and limit when not provided', async () => {
      const query: ScheduleQueryDto = {};
      await controller.findAll(query);

      expect(mockService.lastFindAllParams?.page).toBe(1);
      expect(mockService.lastFindAllParams?.limit).toBe(10);
    });
  });

  describe('findById', () => {
    it('should return schedule details', async () => {
      const schedule = new Schedule(
        1,
        '2026-11-28',
        '08:00:00',
        2,
        10,
        1,
        new Date(),
        new Date(),
        new Service(1, 'Sân VIP', 150000, null, 1),
      );
      mockService.schedules = [schedule];

      const result = await controller.findById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.serviceId).toBe(1);
      expect(result.serviceName).toBe('Sân VIP');
      expect(result.bookedSlots).toBe(0);
      expect(result.availableSlots).toBe(10);
      expect(mockService.lastFindByIdParam).toBe(1);
    });

    it('should throw NotFoundException if schedule does not exist', async () => {
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create schedule and return detail dto', async () => {
      const dto: CreateScheduleDto = {
        serviceId: 1,
        date: '2026-11-28',
        startTime: '08:00:00',
        duration: 2,
        totalSlots: 10,
      };

      const result = await controller.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.serviceId).toBe(1);
      expect(result.startTime).toBe('08:00:00');
      expect(result.totalSlots).toBe(10);
      expect(result.bookedSlots).toBe(0);
      expect(result.availableSlots).toBe(10);
      expect(mockService.lastCreateDto).toEqual(dto);
    });
  });

  describe('update', () => {
    it('should update schedule and return updated detail dto', async () => {
      const schedule = new Schedule(
        1,
        '2026-11-28',
        '08:00:00',
        2,
        10,
        1,
        new Date(),
        new Date(),
      );
      mockService.schedules = [schedule];

      const dto: UpdateScheduleDto = {
        startTime: '09:00:00',
        duration: 3,
        totalSlots: 15,
      };

      const result = await controller.update(1, dto);

      expect(result).toBeDefined();
      expect(result.startTime).toBe('09:00:00');
      expect(result.duration).toBe(3);
      expect(result.totalSlots).toBe(15);
      expect(result.availableSlots).toBe(15);
      expect(mockService.lastUpdateParam).toEqual({ id: 1, dto });
    });

    it('should throw NotFoundException if updating non-existing schedule', async () => {
      await expect(
        controller.update(999, { totalSlots: 20 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete schedule and return success message', async () => {
      const schedule = new Schedule(
        1,
        '2026-11-28',
        '08:00:00',
        2,
        10,
        1,
        new Date(),
        new Date(),
      );
      mockService.schedules = [schedule];

      const result = await controller.delete(1);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Xóa lịch và booking liên kết thành công',
      });
      expect(mockService.lastDeleteParam).toBe(1);
      expect(mockService.schedules).toHaveLength(0);
    });

    it('should throw NotFoundException if deleting non-existing schedule', async () => {
      await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
