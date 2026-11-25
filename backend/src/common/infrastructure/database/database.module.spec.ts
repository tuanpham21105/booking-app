import { ConfigService } from '@nestjs/config';
import { createTypeOrmOptions } from './database.module';

describe('createTypeOrmOptions', () => {
  it('should create TypeOrmModuleOptions with config values', () => {
    const mockConfigService = {
      get: (key: string) => {
        if (key === 'database') {
          return {
            host: 'db-host',
            port: 5432,
            username: 'user',
            password: 'pwd',
            database: 'db_name',
          };
        }
        if (key === 'app') {
          return {
            nodeEnv: 'development',
            port: 3000,
          };
        }
        return undefined;
      },
    } as unknown as ConfigService;

    const options = createTypeOrmOptions(mockConfigService);

    expect(options).toEqual({
      type: 'postgres',
      host: 'db-host',
      port: 5432,
      username: 'user',
      password: 'pwd',
      database: 'db_name',
      autoLoadEntities: true,
      synchronize: false,
      logging: ['error', 'warn'],
    });
  });

  it('should fallback to default values when configs are undefined', () => {
    const mockConfigService = {
      get: () => undefined,
    } as unknown as ConfigService;

    const options = createTypeOrmOptions(mockConfigService);

    expect(options).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'booking_db',
      autoLoadEntities: true,
      synchronize: false,
      logging: ['error'],
    });
  });
});
