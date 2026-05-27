import { Request } from 'express';

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type TJwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthRequest = Request & {
  user: TJwtPayload;
};

export type AuthRefreshRequest = Request & {
  user: TJwtPayload;
  refreshToken: string;
};
