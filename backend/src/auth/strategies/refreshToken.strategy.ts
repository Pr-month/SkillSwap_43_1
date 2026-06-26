import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { AuthRefreshRequest, TJwtPayload } from '../auth.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: TJwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.refresh.secret,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: TJwtPayload): TJwtPayload {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Refresh token does not identify a user');
    }

    (request as AuthRefreshRequest).refreshToken = refreshToken;

    return payload;
  }
}
