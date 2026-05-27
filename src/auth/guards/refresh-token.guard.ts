import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TJwtPayload } from '../auth.types';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = TJwtPayload>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
