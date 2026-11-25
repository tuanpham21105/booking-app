import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'booking_db',
  entities: ['dist/modules/**/infrastructure/persistence/entities/*.orm-entity.js'],
  migrations: ['dist/common/infrastructure/database/migrations/*.js'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
