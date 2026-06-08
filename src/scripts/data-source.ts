import 'dotenv/config';
import { DataSource } from 'typeorm';
import dbConfig from '../config/database.config';

export const AppDataSource = new DataSource(dbConfig());
