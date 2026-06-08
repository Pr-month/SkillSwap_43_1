import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

type DatabaseType = 'postgres' | 'mongodb';

const dbConfig = registerAs(
    'DATABASE_CONFIG',
    (): DataSourceOptions => ({
        type: (process.env.DATABASE_DRIVER as DatabaseType) || 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
        database: process.env.DATABASE_NAME || 'db',
        username: process.env.DATABASE_USERNAME || 'db',
        password: process.env.DATABASE_PASSWORD,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
    }),
);

export default dbConfig;
export type TDbConfig = ReturnType<typeof dbConfig>;

export const AppDataSource = new DataSource(dbConfig());