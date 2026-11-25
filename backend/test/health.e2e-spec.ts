import { Test, TestingModule } from '@nestjs/testing';
import { Global, INestApplication, Module } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { HealthModule } from '../src/modules/health/health.module';
import { HttpExceptionFilter } from '../src/common/presentation/filters';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let mockDataSource: {
    isInitialized: boolean;
    query: (q: string) => Promise<unknown>;
  };

  beforeEach(async () => {
    mockDataSource = {
      isInitialized: true,
      query: async () => [{ '?column?': 1 }],
    };

    @Global()
    @Module({
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
      exports: [DataSource],
    })
    class MockDatabaseModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockDatabaseModule, HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/health should return 200 and health status when database is connected', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('GET /api/v1/health should return 503 Service Unavailable when database query fails', async () => {
    mockDataSource.query = async () => {
      throw new Error('Database connection lost');
    };

    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(503);

    expect(res.body).toMatchObject({
      statusCode: 503,
      message: 'Không thể kết nối đến cơ sở dữ liệu',
      error: 'Service Unavailable',
      path: '/api/v1/health',
    });
  });

  it('GET /api/v1/health should return 503 Service Unavailable when database is not initialized', async () => {
    mockDataSource.isInitialized = false;

    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(503);

    expect(res.body).toMatchObject({
      statusCode: 503,
      message: 'Không thể kết nối đến cơ sở dữ liệu',
      error: 'Service Unavailable',
      path: '/api/v1/health',
    });
  });
});
