import { Request } from 'express';
import { Role } from '../../users/entities/user.enums';

export interface AccessTokenPayload {
  sub?: string;
  id?: string;
  userId?: string;
  role?: Role;
  [key: string]: unknown;
}

export interface AuthenticatedUser {
  id: string;
  role: Role;
  payload: AccessTokenPayload;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
