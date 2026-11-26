import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordHasher } from '@nestjs/authentication';
import { UserRepository } from './domain/repositories/user.repository.port';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { UsersService } from './application/services/users.service';
import { AdminSeederService } from './application/services/admin-seeder.service';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    PasswordHasher,
    UsersService,
    AdminSeederService,
  ],
  exports: [TypeOrmModule, UserRepository, UsersService, AdminSeederService, PasswordHasher],
})
export class UsersModule {}
