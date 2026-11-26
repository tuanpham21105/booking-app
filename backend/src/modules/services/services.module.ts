import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersModule } from '../providers';
import { ServiceRepository } from './domain/repositories/service.repository.port';
import { ServiceOrmEntity } from './infrastructure/persistence/entities/service.orm-entity';
import { TypeOrmServiceRepository } from './infrastructure/persistence/repositories/typeorm-service.repository';
import { ServicesService } from './application/services/services.service';
import { ServicesController } from './presentation/controllers/services.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrmEntity]),
    ProvidersModule,
  ],
  controllers: [ServicesController],
  providers: [
    {
      provide: ServiceRepository,
      useClass: TypeOrmServiceRepository,
    },
    ServicesService,
  ],
  exports: [TypeOrmModule, ServiceRepository, ServicesService],
})
export class ServicesModule {}
