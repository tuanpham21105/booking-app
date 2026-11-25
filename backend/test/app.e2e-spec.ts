import { Test, TestingModule } from '@nestjs/testing';
import { Global, INestApplication, Module } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { CommonModule } from '../src/common/common.module';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useValue: { isInitialized: true, query: async () => [{ '?column?': 1 }] },
    },
  ],
  exports: [DataSource],
})
class MockCommonModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(CommonModule)
      .useModule(MockCommonModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
