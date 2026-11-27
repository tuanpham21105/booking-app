import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmScheduleRepository } from './typeorm-schedule.repository';
import { ScheduleOrmEntity } from '../entities/schedule.orm-entity';
import { ServiceOrmEntity } from '../../../../services/infrastructure/persistence/entities/service.orm-entity';

class MockScheduleOrmRepository {
  findOneResult: ScheduleOrmEntity | null = null;
  findAndCountResult: [ScheduleOrmEntity[], number] = [[], 0];
  findResult: ScheduleOrmEntity[] = [];
  createdEntity?: Partial<ScheduleOrmEntity>;
  savedEntity?: ScheduleOrmEntity;
  deletedId?: number;

  async findOne(): Promise<ScheduleOrmEntity | null> {
    return this.findOneResult;
  }

  async findAndCount(): Promise<[ScheduleOrmEntity[], number]> {
    return this.findAndCountResult;
  }

  async find(): Promise<ScheduleOrmEntity[]> {
    return this.findResult;
  }

  create(entity: Partial<ScheduleOrmEntity>): ScheduleOrmEntity {
    this.createdEntity = entity;
    const orm = new ScheduleOrmEntity();
    orm.id = 1;
    orm.serviceId = entity.serviceId!;
    orm.date = entity.date!;
    orm.startTime = entity.startTime!;
    orm.duration = entity.duration!;
    orm.totalSlots = entity.totalSlots!;
    orm.createdAt = new Date('2026-11-27T00:00:00.000Z');
    orm.updatedAt = new Date('2026-11-27T00:00:00.000Z');
    return orm;
  }

  async save(entity: ScheduleOrmEntity): Promise<ScheduleOrmEntity> {
    this.savedEntity = entity;
    return entity;
  }

  async delete(id: number): Promise<{ affected?: number }> {
    this.deletedId = id;
    return { affected: id === 999 ? 0 : 1 };
  }
}

describe('TypeOrmScheduleRepository', () => {
  let repository: TypeOrmScheduleRepository;
  let mockOrm: MockScheduleOrmRepository;

  beforeEach(async () => {
    mockOrm = new MockScheduleOrmRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmScheduleRepository,
        {
          provide: getRepositoryToken(ScheduleOrmEntity),
          useValue: mockOrm,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmScheduleRepository>(TypeOrmScheduleRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return null when schedule not found', async () => {
      mockOrm.findOneResult = null;
      const result = await repository.findById(1);
      expect(result).toBeNull();
    });

    it('should return domain schedule with service when found', async () => {
      const orm = new ScheduleOrmEntity();
      orm.id = 1;
      orm.serviceId = 5;
      orm.date = '2026-11-28';
      orm.startTime = '09:00:00';
      orm.duration = 2;
      orm.totalSlots = 10;
      orm.createdAt = new Date();
      orm.updatedAt = new Date();

      const serviceOrm = new ServiceOrmEntity();
      serviceOrm.id = 5;
      serviceOrm.providerId = 1;
      serviceOrm.name = 'Cầu lông';
      serviceOrm.price = 100000;
      orm.service = serviceOrm;

      mockOrm.findOneResult = orm;

      const result = await repository.findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.serviceId).toBe(5);
      expect(result?.service?.name).toBe('Cầu lông');
    });
  });

  describe('findAll', () => {
    it('should query with filters and return schedules with count', async () => {
      const orm = new ScheduleOrmEntity();
      orm.id = 1;
      orm.serviceId = 5;
      orm.date = '2026-11-28';
      orm.startTime = '09:00:00';
      orm.duration = 2;
      orm.totalSlots = 10;
      orm.createdAt = new Date();
      orm.updatedAt = new Date();

      mockOrm.findAndCountResult = [[orm], 1];

      const [schedules, total] = await repository.findAll(
        1,
        10,
        5,
        '2026-11-28',
      );

      expect(total).toBe(1);
      expect(schedules).toHaveLength(1);
      expect(schedules[0].id).toBe(1);
    });

    it('should query with date range fromDate and toDate', async () => {
      mockOrm.findAndCountResult = [[], 0];

      const [schedules, total] = await repository.findAll(
        1,
        10,
        undefined,
        undefined,
        '2026-11-01',
        '2026-11-30',
      );

      expect(total).toBe(0);
      expect(schedules).toHaveLength(0);
    });

    it('should query with only fromDate or only toDate', async () => {
      mockOrm.findAndCountResult = [[], 0];

      await repository.findAll(1, 10, undefined, undefined, '2026-11-01');
      await repository.findAll(1, 10, undefined, undefined, undefined, '2026-11-30');

      expect(mockOrm.findAndCountResult[1]).toBe(0);
    });
  });

  describe('findByServiceAndDate', () => {
    it('should return list of schedules for given service and date', async () => {
      const orm1 = new ScheduleOrmEntity();
      orm1.id = 1;
      orm1.serviceId = 5;
      orm1.date = '2026-11-28';
      orm1.startTime = '08:00:00';
      orm1.duration = 1;
      orm1.totalSlots = 5;

      const orm2 = new ScheduleOrmEntity();
      orm2.id = 2;
      orm2.serviceId = 5;
      orm2.date = '2026-11-28';
      orm2.startTime = '10:00:00';
      orm2.duration = 2;
      orm2.totalSlots = 8;

      mockOrm.findResult = [orm1, orm2];

      const result = await repository.findByServiceAndDate(5, '2026-11-28');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('create', () => {
    it('should create and save a new schedule', async () => {
      const result = await repository.create(5, '2026-11-28', '09:00:00', 2, 10);

      expect(mockOrm.createdEntity).toEqual({
        serviceId: 5,
        date: '2026-11-28',
        startTime: '09:00:00',
        duration: 2,
        totalSlots: 10,
      });
      expect(result.id).toBe(1);
      expect(result.serviceId).toBe(5);
    });
  });

  describe('update', () => {
    it('should return null when schedule to update is not found', async () => {
      mockOrm.findOneResult = null;
      const result = await repository.update(999, '10:00:00', 3, 15);
      expect(result).toBeNull();
    });

    it('should update fields and save schedule', async () => {
      const orm = new ScheduleOrmEntity();
      orm.id = 1;
      orm.serviceId = 5;
      orm.date = '2026-11-28';
      orm.startTime = '09:00:00';
      orm.duration = 2;
      orm.totalSlots = 10;
      mockOrm.findOneResult = orm;

      const result = await repository.update(1, '10:00:00', 3, 15);

      expect(result).toBeDefined();
      expect(mockOrm.savedEntity?.startTime).toBe('10:00:00');
      expect(mockOrm.savedEntity?.duration).toBe(3);
      expect(mockOrm.savedEntity?.totalSlots).toBe(15);
    });
  });

  describe('delete', () => {
    it('should return true when delete is successful', async () => {
      const result = await repository.delete(1);
      expect(result).toBe(true);
      expect(mockOrm.deletedId).toBe(1);
    });

    it('should return false when no record was deleted', async () => {
      const result = await repository.delete(999);
      expect(result).toBe(false);
    });
  });
});
