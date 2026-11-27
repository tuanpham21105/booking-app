import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '../services';
import { ScheduleRepository } from './domain/repositories/schedule.repository.port';
import { ScheduleOrmEntity } from './infrastructure/persistence/entities/schedule.orm-entity';
import { TypeOrmScheduleRepository } from './infrastructure/persistence/repositories/typeorm-schedule.repository';

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
  ],
  exports: [TypeOrmModule, ScheduleRepository, ServicesModule],
})
export class SchedulesModule {}
