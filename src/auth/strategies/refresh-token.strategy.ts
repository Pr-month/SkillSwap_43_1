import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRefreshRequest, TJwtPayload } from '../auth.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('jwt.refresh.secret'),
      passReqToCallback: true,
    });
  }

  validate(req: AuthRefreshRequest, payload: TJwtPayload): TJwtPayload {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    req.refreshToken = refreshToken;

    return payload;
  }
}
