import { Module } from '@nestjs/common';
import { ServicesModule } from '../services';

@Module({
  imports: [ServicesModule],
  controllers: [],
  providers: [],
  exports: [ServicesModule],
})
export class SchedulesModule {}
