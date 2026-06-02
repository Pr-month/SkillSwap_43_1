import { ConfigType, registerAs } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

type JwtTokenConfig = {
  secret: string;
  expiresIn: JwtSignOptions['expiresIn'];
};

type JwtConfig = {
  access: JwtTokenConfig;
  refresh: JwtTokenConfig;
};

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'super-secret-access-key',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
        '15m') as JwtSignOptions['expiresIn'],
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
        '7d') as JwtSignOptions['expiresIn'],
    },
  }),
);

export type TJwtConfig = ConfigType<typeof jwtConfig>;
