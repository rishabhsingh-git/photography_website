import 'reflect-metadata';
import { DataSource } from 'typeorm';

// We always run migrations via ts-node in this project,
// so we can safely point to the .ts files.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'cine_stories',
  password: process.env.DB_PASS || 'cine_stories',
  database: process.env.DB_NAME || 'cine_stories',
  entities: ['src/infrastructure/database/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: false,
});



