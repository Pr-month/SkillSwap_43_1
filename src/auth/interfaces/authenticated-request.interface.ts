import { Request } from 'express';

export interface AccessTokenPayload {
  sub?: string;
  id?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface AuthenticatedUser {
  id: string;
  payload: AccessTokenPayload;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
