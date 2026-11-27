import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '../services';
import { ScheduleRepository } from './domain/repositories/schedule.repository.port';
import { ScheduleOrmEntity } from './infrastructure/persistence/entities/schedule.orm-entity';
import { TypeOrmScheduleRepository } from './infrastructure/persistence/repositories/typeorm-schedule.repository';
import { SchedulesService } from './application/services/schedules.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleOrmEntity]),
    ServicesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: ScheduleRepository,
      useClass: TypeOrmScheduleRepository,
    },
    SchedulesService,
  ],
  exports: [TypeOrmModule, ScheduleRepository, SchedulesService, ServicesModule],
})
export class SchedulesModule {}
