import { appConfig } from './app.config';
import { databaseConfig } from './database.config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('appConfig', () => {
    it('should return default values when env vars are missing', () => {
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.BACKEND_PORT;

      const config = appConfig();
      expect(config.nodeEnv).toBe('development');
      expect(config.port).toBe(3000);
    });

    it('should return parsed values from environment variables', () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';

      const config = appConfig();
      expect(config.nodeEnv).toBe('production');
      expect(config.port).toBe(8080);
    });

    it('should fallback to BACKEND_PORT if PORT is not set', () => {
      delete process.env.PORT;
      process.env.BACKEND_PORT = '4000';

      const config = appConfig();
      expect(config.port).toBe(4000);
    });
  });

  describe('databaseConfig', () => {
    it('should return default database values when env vars are missing', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USERNAME;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_DATABASE;

      const config = databaseConfig();
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.username).toBe('postgres');
      expect(config.password).toBe('postgres');
      expect(config.database).toBe('booking_db');
    });

    it('should return parsed values from environment variables', () => {
      process.env.DB_HOST = 'custom-host';
      process.env.DB_PORT = '5433';
      process.env.DB_USERNAME = 'myuser';
      process.env.DB_PASSWORD = 'mypassword';
      process.env.DB_DATABASE = 'custom_db';

      const config = databaseConfig();
      expect(config.host).toBe('custom-host');
      expect(config.port).toBe(5433);
      expect(config.username).toBe('myuser');
      expect(config.password).toBe('mypassword');
      expect(config.database).toBe('custom_db');
    });
  });
});
