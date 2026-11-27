import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository.port';
import { ServiceRepository } from '../../../services/domain/repositories/service.repository.port';
import { Schedule } from '../../domain/entities/schedule.entity';
import { Service } from '../../../services/domain/entities/service.entity';

class MockServiceRepository extends ServiceRepository {
  services: Service[] = [];

  async findById(id: number): Promise<Service | null> {
    return this.services.find((s) => s.id === id) ?? null;
  }

  async findAll(): Promise<[Service[], number]> {
    return [this.services, this.services.length];
  }

  async create(
    providerId: number,
    name: string,
    price: number,
    description?: string | null,
  ): Promise<Service> {
    const s = new Service(
      providerId,
      name,
      price,
      description ?? null,
      this.services.length + 1,
      new Date(),
      new Date(),
    );
    this.services.push(s);
    return s;
  }

  async update(): Promise<Service | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return true;
  }
}

class MockScheduleRepository extends ScheduleRepository {
  schedules: Schedule[] = [];
  lastFindAllParams?: {
    page?: number;
    limit?: number;
    serviceId?: number;
    date?: string;
    fromDate?: string;
    toDate?: string;
  };

  async findById(id: number): Promise<Schedule | null> {
    return this.schedules.find((s) => s.id === id) ?? null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    serviceId?: number,
    date?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<[Schedule[], number]> {
    this.lastFindAllParams = { page, limit, serviceId, date, fromDate, toDate };
    let filtered = [...this.schedules];
    if (serviceId !== undefined) {
      filtered = filtered.filter((s) => s.serviceId === serviceId);
    }
    if (date !== undefined) {
      filtered = filtered.filter((s) => s.date === date);
    }
    return [filtered, filtered.length];
  }

  async findByServiceAndDate(
    serviceId: number,
    date: string,
  ): Promise<Schedule[]> {
    return this.schedules.filter(
      (s) => s.serviceId === serviceId && s.date === date,
    );
  }

  async create(
    serviceId: number,
    date: string,
    startTime: string,
    duration: number,
    totalSlots: number,
  ): Promise<Schedule> {
    const s = new Schedule(
      serviceId,
      date,
      startTime,
      duration,
      totalSlots,
      this.schedules.length + 1,
      new Date(),
      new Date(),
    );
    this.schedules.push(s);
    return s;
  }

  async update(
    id: number,
    startTime?: string,
    duration?: number,
    totalSlots?: number,
  ): Promise<Schedule | null> {
    const s = await this.findById(id);
    if (!s) return null;
    if (startTime !== undefined) s.startTime = startTime;
    if (duration !== undefined) s.duration = duration;
    if (totalSlots !== undefined) s.totalSlots = totalSlots;
    return s;
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.schedules.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.schedules.splice(idx, 1);
    return true;
  }
}

describe('SchedulesService', () => {
  let service: SchedulesService;
  let scheduleRepo: MockScheduleRepository;
  let serviceRepo: MockServiceRepository;

  // Use a future date for tests
  const futureDate = '2099-01-01';

  beforeEach(async () => {
    scheduleRepo = new MockScheduleRepository();
    serviceRepo = new MockServiceRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: ScheduleRepository,
          useValue: scheduleRepo,
        },
        {
          provide: ServiceRepository,
          useValue: serviceRepo,
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);

    // Seed mock service
    await serviceRepo.create(1, 'Sân cầu lông VIP', 100000);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if service does not exist', async () => {
      await expect(
        service.create({
          serviceId: 999,
          date: futureDate,
          startTime: '08:00:00',
          duration: 2,
          totalSlots: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if totalSlots <= 0', async () => {
      await expect(
        service.create({
          serviceId: 1,
          date: futureDate,
          startTime: '08:00:00',
          duration: 2,
          totalSlots: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duration <= 0', async () => {
      await expect(
        service.create({
          serviceId: 1,
          date: futureDate,
          startTime: '08:00:00',
          duration: 0,
          totalSlots: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if date is in the past', async () => {
      await expect(
        service.create({
          serviceId: 1,
          date: '2020-01-01',
          startTime: '08:00:00',
          duration: 2,
          totalSlots: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create schedule successfully when valid and no overlap', async () => {
      const result = await service.create({
        serviceId: 1,
        date: futureDate,
        startTime: '08:00:00',
        duration: 2,
        totalSlots: 10,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.service?.name).toBe('Sân cầu lông VIP');
    });

    describe('BR-05: Overlap detection', () => {
      beforeEach(async () => {
        // Base schedule: 08:00 to 10:00 (duration = 2)
        await service.create({
          serviceId: 1,
          date: futureDate,
          startTime: '08:00:00',
          duration: 2,
          totalSlots: 5,
        });
      });

      it('should throw ConflictException if new schedule starts during existing schedule', async () => {
        // 09:00 - 11:00 overlaps with 08:00 - 10:00
        await expect(
          service.create({
            serviceId: 1,
            date: futureDate,
            startTime: '09:00:00',
            duration: 2,
            totalSlots: 5,
          }),
        ).rejects.toThrow(ConflictException);
      });

      it('should throw ConflictException if new schedule ends during existing schedule', async () => {
        // 07:00 - 09:00 overlaps with 08:00 - 10:00
        await expect(
          service.create({
            serviceId: 1,
            date: futureDate,
            startTime: '07:00:00',
            duration: 2,
            totalSlots: 5,
          }),
        ).rejects.toThrow(ConflictException);
      });

      it('should throw ConflictException if new schedule is completely inside existing schedule', async () => {
        // 08:30 - 09:30 inside 08:00 - 10:00
        await expect(
          service.create({
            serviceId: 1,
            date: futureDate,
            startTime: '08:30:00',
            duration: 1,
            totalSlots: 5,
          }),
        ).rejects.toThrow(ConflictException);
      });

      it('should throw ConflictException if new schedule completely wraps existing schedule', async () => {
        // 07:00 - 11:00 wraps 08:00 - 10:00
        await expect(
          service.create({
            serviceId: 1,
            date: futureDate,
            startTime: '07:00:00',
            duration: 4,
            totalSlots: 5,
          }),
        ).rejects.toThrow(ConflictException);
      });

      it('should allow adjacent schedule that ends exactly when existing schedule starts', async () => {
        // 06:00 - 08:00 touches 08:00 - 10:00
        const result = await service.create({
          serviceId: 1,
          date: futureDate,
          startTime: '06:00:00',
          duration: 2,
          totalSlots: 5,
        });
        expect(result).toBeDefined();
        expect(result.startTime).toBe('06:00:00');
      });

      it('should allow adjacent schedule that starts exactly when existing schedule ends', async () => {
        // 10:00 - 12:00 touches 08:00 - 10:00
        const result = await service.create({
          serviceId: 1,
          date: futureDate,
          startTime: '10:00:00',
          duration: 2,
          totalSlots: 5,
        });
        expect(result).toBeDefined();
        expect(result.startTime).toBe('10:00:00');
      });

      it('should allow schedule on a different date even with same time', async () => {
        const result = await service.create({
          serviceId: 1,
          date: '2099-01-02',
          startTime: '08:00:00',
          duration: 2,
          totalSlots: 5,
        });
        expect(result).toBeDefined();
        expect(result.date).toBe('2099-01-02');
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated schedules', async () => {
      await service.create({
        serviceId: 1,
        date: futureDate,
        startTime: '08:00:00',
        duration: 2,
        totalSlots: 10,
      });

      const [schedules, total] = await service.findAll(1, 10, 1, futureDate);
      expect(total).toBe(1);
      expect(schedules).toHaveLength(1);
      expect(scheduleRepo.lastFindAllParams?.serviceId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if schedule does not exist', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });

    it('should return schedule if found', async () => {
      const created = await service.create({
        serviceId: 1,
        date: futureDate,
        startTime: '08:00:00',
        duration: 2,
        totalSlots: 10,
      });

      const found = await service.findById(created.id!);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
    });
  });

  describe('update', () => {
    let createdSchedule: Schedule;

    beforeEach(async () => {
      createdSchedule = await service.create({
        serviceId: 1,
        date: futureDate,
        startTime: '08:00:00',
        duration: 2,
        totalSlots: 10,
      });
      // Another schedule on same day: 14:00 - 16:00
      await service.create({
        serviceId: 1,
        date: futureDate,
        startTime: '14:00:00',
        duration: 2,
        totalSlots: 10,
      });
    });

    it('should throw NotFoundException if schedule does not exist', async () => {
      await expect(
        service.update(999, { totalSlots: 20 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if totalSlots <= 0', async () => {
      await expect(
        service.update(createdSchedule.id!, { totalSlots: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duration <= 0', async () => {
      await expect(
        service.update(createdSchedule.id!, { duration: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new time overlaps with another schedule', async () => {
      // Move 08:00-10:00 to 14:30-16:30 (overlaps with 14:00-16:00)
      await expect(
        service.update(createdSchedule.id!, {
          startTime: '14:30:00',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should update successfully when new time does not overlap', async () => {
      const updated = await service.update(createdSchedule.id!, {
        startTime: '10:30:00',
        duration: 1,
        totalSlots: 15,
      });

      expect(updated.startTime).toBe('10:30:00');
      expect(updated.duration).toBe(1);
      expect(updated.totalSlots).toBe(15);
    });

    it('should allow updating other fields without changing time', async () => {
      const updated = await service.update(createdSchedule.id!, {
        totalSlots: 20,
      });
      expect(updated.totalSlots).toBe(20);
      expect(updated.startTime).toBe('08:00:00');
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if schedule does not exist', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('should delete schedule successfully', async () => {
      const created = await service.create({
        serviceId: 1,
        date: futureDate,
        startTime: '08:00:00',
        duration: 2,
        totalSlots: 10,
      });

      await service.delete(created.id!);
      await expect(service.findById(created.id!)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
