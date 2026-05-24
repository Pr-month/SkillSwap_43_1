import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

type DatabaseType = 'postgres' | 'mongodb';

export default registerAs(
  'DATABASE_CONFIG',
  (): DataSourceOptions => ({
    type: (process.env.DATABASE_DRIVER as DatabaseType) || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
    database: process.env.DATABASE_NAME || 'db',
    username: process.env.DATABASE_USERNAME || 'db',
    password: process.env.DATABASE_PASSWORD,
    entities: [],
    synchronize: false,
  }),
);
