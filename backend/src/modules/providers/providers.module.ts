import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderRepository } from './domain/repositories/provider.repository.port';
import { ProviderOrmEntity } from './infrastructure/persistence/entities/provider.orm-entity';
import { TypeOrmProviderRepository } from './infrastructure/persistence/repositories/typeorm-provider.repository';
import { ProvidersService } from './application/services/providers.service';
import { ProvidersController } from './presentation/controllers/providers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderOrmEntity])],
  controllers: [ProvidersController],
  providers: [
    {
      provide: ProviderRepository,
      useClass: TypeOrmProviderRepository,
    },
    ProvidersService,
  ],
  exports: [TypeOrmModule, ProviderRepository, ProvidersService],
})
export class ProvidersModule {}
