import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../interfaces/authenticated-request.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: TJwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.access.secret,
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedUser {
    const userId = payload.sub ?? payload.id ?? payload.userId;

    if (!userId) {
      throw new UnauthorizedException('Access token does not identify a user');
    }

    return {
      id: userId,
      payload,
    };
  }
}
