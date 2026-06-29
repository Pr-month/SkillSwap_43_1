import { Request } from 'express';
import { Role } from '../users/entities/user.enums';

export type TJwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type AuthRequest = Request & {
  user: TJwtPayload;
};

export type AuthRefreshRequest = Request & {
  user: TJwtPayload;
  refreshToken: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};
