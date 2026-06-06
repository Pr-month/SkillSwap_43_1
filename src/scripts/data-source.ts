import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
  database: process.env.DATABASE_NAME || 'db',
  username: process.env.DATABASE_USERNAME || 'db',
  password: process.env.DATABASE_PASSWORD,
  entities: [User, Skill],
  synchronize: false,
});
