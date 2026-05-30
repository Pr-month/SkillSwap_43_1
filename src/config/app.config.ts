import { registerAs } from '@nestjs/config';

const appConfig = registerAs('APP_CONFIG', () => ({
  port: parseInt(process.env.APP_PORT as string, 10) || 3000,
  hashSalt: parseInt(process.env.HASH_SALT as string, 10) || 10,
}));

export type TAppConfig = ReturnType<typeof appConfig>;
export default appConfig;
