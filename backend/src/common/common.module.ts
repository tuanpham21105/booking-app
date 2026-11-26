import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { adminConfig, appConfig, databaseConfig, jwtConfig } from './infrastructure/config';
import { DatabaseModule } from './infrastructure/database/database.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, adminConfig, jwtConfig],
      envFilePath: ['.env', '../.env', '.env.local'],
    }),
    DatabaseModule,
  ],
  exports: [ConfigModule, DatabaseModule],
})
export class CommonModule {}

