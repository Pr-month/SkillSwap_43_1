import { User } from '../entities/user.entity';

export type PatchCurrentUserDto = Partial<
  Omit<User, 'password' | 'refreshToken' | 'role' | 'id'>
>;
