import { adminConfig } from './admin.config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';

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

  describe('adminConfig', () => {
    it('should return default values when env vars are missing', () => {
      delete process.env.INITIAL_ADMIN_NAME;
      delete process.env.INITIAL_ADMIN_EMAIL;
      delete process.env.INITIAL_ADMIN_PASSWORD;

      const config = adminConfig();
      expect(config.name).toBe('System Admin');
      expect(config.email).toBe('admin@bookingapp.com');
      expect(config.password).toBe('AdminPassword123@');
    });

    it('should return parsed values from environment variables', () => {
      process.env.INITIAL_ADMIN_NAME = 'Super Admin';
      process.env.INITIAL_ADMIN_EMAIL = 'superadmin@example.com';
      process.env.INITIAL_ADMIN_PASSWORD = 'CustomAdminPass123!';

      const config = adminConfig();
      expect(config.name).toBe('Super Admin');
      expect(config.email).toBe('superadmin@example.com');
      expect(config.password).toBe('CustomAdminPass123!');
    });
  });

  describe('jwtConfig', () => {
    it('should return default values when env vars are missing', () => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;
      delete process.env.JWT_REFRESH_EXPIRES_IN;

      const config = jwtConfig();
      expect(config.secret).toBe('booking-app-jwt-secret-key-32-characters-min-safety');
      expect(config.expiresIn).toBe('15m');
      expect(config.refreshExpiresIn).toBe('7d');
    });

    it('should preserve duration string when unit is provided', () => {
      process.env.JWT_EXPIRES_IN = '30m';
      process.env.JWT_REFRESH_EXPIRES_IN = '14d';

      const config = jwtConfig();
      expect(config.expiresIn).toBe('30m');
      expect(config.refreshExpiresIn).toBe('14d');
    });
  });
});

