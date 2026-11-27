import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ScheduleRepository } from '../../../domain/repositories/schedule.repository.port';
import { Schedule } from '../../../domain/entities/schedule.entity';
import { Service } from '../../../../services/domain/entities/service.entity';
import { ScheduleOrmEntity } from '../entities/schedule.orm-entity';
import {
  calculatePagination,
  convertToDomain,
} from '../../../../../common/utils';

@Injectable()
export class TypeOrmScheduleRepository extends ScheduleRepository {
  constructor(
    @InjectRepository(ScheduleOrmEntity)
    private readonly scheduleOrmRepository: Repository<ScheduleOrmEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Schedule | null> {
    const entity = await this.scheduleOrmRepository.findOne({
      where: { id },
      relations: { service: true },
    });

    if (!entity) {
      return null;
    }

    const schedule = convertToDomain(Schedule, entity);
    if (entity.service) {
      schedule.service = convertToDomain(Service, entity.service);
    }

    return schedule;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    serviceId?: number,
    date?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<[Schedule[], number]> {
    const { skip, take } = calculatePagination(page, limit);

    const where: FindOptionsWhere<ScheduleOrmEntity> = {};

    if (serviceId !== undefined) {
      where.serviceId = serviceId;
    }

    if (date !== undefined) {
      where.date = date;
    } else if (fromDate !== undefined && toDate !== undefined) {
      where.date = Between(fromDate, toDate);
    } else if (fromDate !== undefined) {
      where.date = MoreThanOrEqual(fromDate);
    } else if (toDate !== undefined) {
      where.date = LessThanOrEqual(toDate);
    }

    const [entities, total] = await this.scheduleOrmRepository.findAndCount({
      skip,
      take,
      ...(Object.keys(where).length > 0 ? { where } : {}),
      relations: { service: true },
      order: { date: 'ASC', startTime: 'ASC' },
    });

    const schedules = entities.map((entity) => {
      const schedule = convertToDomain(Schedule, entity);
      if (entity.service) {
        schedule.service = convertToDomain(Service, entity.service);
      }
      return schedule;
    });

    return [schedules, total];
  }

  async findByServiceAndDate(
    serviceId: number,
    date: string,
  ): Promise<Schedule[]> {
    const entities = await this.scheduleOrmRepository.find({
      where: { serviceId, date },
      order: { startTime: 'ASC' },
    });

    return entities.map((entity) => convertToDomain(Schedule, entity));
  }

  async create(
    serviceId: number,
    date: string,
    startTime: string,
    duration: number,
    totalSlots: number,
  ): Promise<Schedule> {
    const entity = this.scheduleOrmRepository.create({
      serviceId,
      date,
      startTime,
      duration,
      totalSlots,
    });

    const saved = await this.scheduleOrmRepository.save(entity);
    return convertToDomain(Schedule, saved);
  }

  async update(
    id: number,
    startTime?: string,
    duration?: number,
    totalSlots?: number,
  ): Promise<Schedule | null> {
    const entity = await this.scheduleOrmRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    if (startTime !== undefined) {
      entity.startTime = startTime;
    }
    if (duration !== undefined) {
      entity.duration = duration;
    }
    if (totalSlots !== undefined) {
      entity.totalSlots = totalSlots;
    }

    const saved = await this.scheduleOrmRepository.save(entity);
    return convertToDomain(Schedule, saved);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.scheduleOrmRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
