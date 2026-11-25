import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { AppConfig } from '../config/app.config';

export const createTypeOrmOptions = (configService: ConfigService): TypeOrmModuleOptions => {
  const dbConfig = configService.get<DatabaseConfig>('database');
  const appConfig = configService.get<AppConfig>('app');

  return {
    type: 'postgres',
    host: dbConfig?.host ?? 'localhost',
    port: dbConfig?.port ?? 5432,
    username: dbConfig?.username ?? 'postgres',
    password: dbConfig?.password ?? 'postgres',
    database: dbConfig?.database ?? 'booking_db',
    autoLoadEntities: true,
    synchronize: false,
    logging:
      appConfig?.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  };
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
