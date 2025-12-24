import 'reflect-metadata';
import { DataSource } from 'typeorm';

// CRITICAL: This DataSource must use the SAME connection as the NestJS app
// ALWAYS use DATABASE_URL if provided (this is what Docker Compose sets)
// If DATABASE_URL is not set, construct from individual parts
const getDbConfig = () => {
  // PRIORITY 1: Use DATABASE_URL if set (Docker Compose sets this)
  if (process.env.DATABASE_URL) {
    console.log('🔌 [AppDataSource] Using DATABASE_URL from environment');
    return { url: process.env.DATABASE_URL };
  }
  
  // PRIORITY 2: Use individual DB_* variables if set
  if (process.env.DB_HOST) {
    console.log('🔌 [AppDataSource] Using DB_HOST from environment:', process.env.DB_HOST);
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'cine_stories',
      password: process.env.DB_PASS || 'cine_stories',
      database: process.env.DB_NAME || 'cine_stories',
    };
  }
  
  // PRIORITY 3: Default - check if we're in Docker (hostname 'db' exists) or local
  // If running inside Docker container, use 'db' service name
  // If running on host machine, use 'localhost'
  // CRITICAL: When running seed from host, you MUST set DATABASE_URL or DB_HOST
  const defaultHost = 'localhost'; // Default to localhost for safety
  
  console.log('⚠️  [AppDataSource] No DATABASE_URL or DB_HOST set, defaulting to:', defaultHost);
  console.log('⚠️  [AppDataSource] If running seed from host, set DATABASE_URL=postgres://cine_stories:cine_stories@localhost:5432/cine_stories');
  
  return {
    host: defaultHost,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'cine_stories',
    password: process.env.DB_PASS || 'cine_stories',
    database: process.env.DB_NAME || 'cine_stories',
  };
};

const dbConfig = getDbConfig();

// We always run migrations via ts-node in this project,
// so we can safely point to the .ts files.
export const AppDataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  entities: ['src/infrastructure/database/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.NODE_ENV !== 'production', // Only sync in dev
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'schema', 'query'] : false,
  // Connection pool settings - MUST match app.module.ts
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // CRITICAL: Ensure immediate commit
    statement_timeout: 30000, // 30 second timeout for statements
  },
  // Note: Transaction isolation level is set per-transaction, not globally
  // We use READ COMMITTED in all transaction() calls for immediate visibility
});

console.log('🔌 [AppDataSource] Database connection config:', {
  type: 'postgres',
  host: dbConfig.host || 'from DATABASE_URL',
  database: dbConfig.database || 'from DATABASE_URL',
  synchronize: process.env.NODE_ENV !== 'production',
});



